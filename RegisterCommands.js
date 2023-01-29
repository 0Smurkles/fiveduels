const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { readdirSync } = require('fs')
const rest = new REST({ version: '9' }).setToken(process.env['TOKEN'])

const commands = []
readdirSync(`${__dirname}/Commands`)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const command = require(`${__dirname}/Commands/${file}`)
    commands.push(command.data.toJSON())
  })

module.exports = async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationGuildCommands(
        process.env['CLIENT_ID'],
        process.env['GUILD_ID']
      ),
      {
        body: commands
      }
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
