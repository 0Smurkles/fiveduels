const {
	SlashCommandBuilder,
	SlashCommandStringOption
} = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const ConfirmSlashCommand = require('../Styles/ConfirmSlashCommand.js')

const commandEmitter = global.CommandEmitter

module.exports = new ConfirmSlashCommand({
	data: new SlashCommandBuilder()
	.setName('run')
  .addStringOption(
			new SlashCommandStringOption()
				.setRequired(true)
				.setName('command')
				.setDescription(
					'Command to run'
				)
		)
  .addStringOption(
			new SlashCommandStringOption()
				.setRequired(true)
				.setName('arguments')
				.setDescription(
					'Arguments attached to command'
				)
		)
	.setDescription('Run a command in-game'),

  getConfirmText(interaction) {
		return {
			embeds: [
				new MessageEmbed()
					.setColor('#5990E2')
					.setTitle('Run Confirmation')
					.setDescription('Are you sure that you want to continue?')
					.addFields(
						{
							name: 'Command',
							value: interaction.options.get('command').value,
							inline: true
						},
						{
							name: 'Arguments',
							value: interaction.options.get('arguments').value,
							inline: true
						},
					)
					.setFooter(
						`Requested by ${interaction.user.tag}`,
						interaction.user.avatarURL({ dynamic: true })
					)
					.setTimestamp()
			],
			success: true
		}
	},
  
	onConfirm(interaction) {
		const targetCommand = interaction.options.get('command').value
		const targetArguments = interaction.options.get('arguments').value

		const callback = (action) => {
			if (action.interaction !== interaction) return

			interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(action.success ? '#4dff7c' : '#ff4d4d')
						.setTitle('Action Done')
						.setDescription(
							action.success
								? `${action.message}`
								: action.message
						)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.avatarURL({ dynamic: true })
						)
						.setTimestamp()
				]
			})

			commandEmitter.off('ActionCompleted', callback)
		}

		commandEmitter.on('ActionCompleted', callback)

		commandEmitter.emit('RequestAction', {
			action: 'Run',
			target: [targetCommand, targetArguments],
			interaction: interaction
		})

		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor('#5990E2')
					.setTitle('Run')
					.setDescription('Running command')
					.addFields({
						name: 'Command',
						value: interaction.options.get('command').value + ' ' + interaction.options.get('arguments').value,
						inline: true
					})
					.setFooter(
						`Requested by ${interaction.user.tag}`,
						interaction.user.avatarURL({ dynamic: true })
					)
					.setTimestamp()
			],
			components: []
		})
	},

	
}).export()
