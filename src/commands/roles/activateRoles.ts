import {
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
} from 'discord.js'
import { Command, container } from '@sapphire/framework'
import { initRoles, logger, roles, UserAnswers } from '@/utils'
import { configuration } from '@/config'
import { Guild } from '@/database'

/**
 * Activate roles functionality.
 */
export class ActivateRolesCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'activateroles',
      aliases: ['ar'],
      fullCategory: ['roles'],
      description: 'Activates bot roles.',
    })
  }

  /**
   * It executes when someone types the "activaterolesgame" command.
   */
  async messageRun(message: Message): Promise<Message> {
    try {
      if (!message.guild) {
        return message.channel.send(`We cannot have roles here ¬¬`)
      }
      const user: GuildMember = await message.guild.members.fetch(
        message.author.id
      )
      if (!user.permissions.has('ADMINISTRATOR')) {
        return message.channel.send(
          `You don't have permissions to run this command. Contact with an Administrator :sweat:`
        )
      }

      const { id: guildId } = message.guild
      const activatedRolesError = `You already have initialize ${configuration.appName}'s roles :relieved: Check yours with **${configuration.prefix}myroles**.`
      const cachedGuild = container.cache.get(guildId)
      if (cachedGuild?.rolesActivated) {
        return message.channel.send(activatedRolesError)
      }

      const guild = await container.db.guildService.getById(guildId)
      if (!guild) {
        return message.channel.send(
          `You have not run **${configuration.prefix}init** command. You cannot activate roles before that.`
        )
      }

      if (guild.rolesActivated) {
        return message.channel.send(activatedRolesError)
      }

      let rolesList = ''
      const everyRole = Object.values(roles)
      everyRole.forEach((role) => {
        rolesList += `• ${role.name} \n`
      })

      const botLogo = new MessageAttachment(
        './public/img/chibiKnightLogo.png',
        'chibiKnightLogo.png'
      )
      const embedMessage = new MessageEmbed()
        .setImage('attachment://chibiKnightLogo.png')
        .setAuthor(configuration.appName, 'attachment://chibiKnightLogo.png')
        .setThumbnail('attachment://chibiKnightLogo.png')
        .addField('The next roles will be added to your server:', rolesList)
        .setColor(configuration.embedMessageColor)
        .setFooter(
          `Do you really want to activate ${configuration.appName}'s roles ? (yes/y/no/n)`
        )
      await message.channel.send({ embeds: [embedMessage], files: [botLogo] })

      const filter = (response: Message) => {
        const validAnswer = /yes|y|no|n/.test(response.content.toLowerCase())
        return response.author.id === message.author.id && validAnswer
      }

      // Waits 15 seconds while types a valid answer (yes/y/no/n).
      const collectedMessages = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
      })

      if (!collectedMessages.first()) {
        return message.channel.send(`Time's up! Try again later ):`)
      }

      const receivedResponse = collectedMessages.first().content.toUpperCase()
      if (
        receivedResponse === UserAnswers.N ||
        receivedResponse === UserAnswers.NO
      ) {
        return message.channel.send('Okay! (:')
      } else if (
        receivedResponse !== UserAnswers.Y &&
        receivedResponse !== UserAnswers.YES
      ) {
        return message.channel.send(
          'You typed an invalid answer so I suppose you dont want to activate roles (:'
        )
      }

      await message.channel.send(
        `Okay, we're working for you, meanwhile take a nap n.n`
      )

      const rolesCreated = await initRoles(message)
      if (!rolesCreated) {
        return message.channel.send(
          `Error while trying to create roles, maybe I don't have enough permissions :sweat:`
        )
      }

      guild.rolesActivated = true
      await guild.save()

      const newCachedGuild: Guild = {
        guildId: message.guild.id,
        rolesActivated: true,
      }
      container.cache.set(message.guild.id, newCachedGuild)

      return message.channel.send(
        `Roles created successfully :purple_heart: Try to see yours with **${configuration.prefix}myroles** command.`
      )
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`,
        { context: this.constructor.name }
      )
      return message.channel.send(
        'It occured an unexpected error, roles could not be created ): Try again later :sweat:'
      )
    }
  }
}
