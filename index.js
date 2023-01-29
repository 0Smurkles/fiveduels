const { Client, Intents, Collection } = require('discord.js')

const express = require('express')
const EventEmitter = require('events')
const { readdirSync, readFileSync } = require('fs')
const http = require('http')

global.CommandEmitter = new EventEmitter()

const registerCommands = require('./RegisterCommands')

const app = express()
const client = new Client({
  intents: [Intents.FLAGS.GUILDS]
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

client.commands = new Collection()

readdirSync(`${__dirname}/Commands`)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const command = require(`${__dirname}/Commands/${file}`)
    client.commands.set(command.data.name, command)
  })

client.once('ready', () => {
  console.log('Client ready')
  client.user.setActivity('with nothing')
  client.user.setStatus('dnd')

  console.log(`Logged as ${client.user.tag}!`)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (process.env['WHITELIST_IDS'].search(interaction.user.id.toString()) == -1) return interaction.reply({
    content: 'No permission!',
    ephemeral: true
  })

  if (!command) return

  interaction.defaultReply = interaction.reply
  interaction.reply = async (options) => {
    if (interaction.replied) {
      return interaction.editReply(options)
    }

    return interaction.defaultReply(options)
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    return interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true
    })
  }
})

app.get('/', (_, response) => response.send('FiveDuels Bot is Running'))

const init = async () => {
  await registerCommands(client)
}

init()
client.login(process.env['TOKEN'])

app.use(require('./Routes/Router'))

http.createServer((_, res) => res.end('Alive')).listen(process.env['PORT'])
app.listen(process.env['PORT'] || 3000, () =>
  console.log(`Listening to localhost:${process.env['PORT'] || 3000}`)
)
