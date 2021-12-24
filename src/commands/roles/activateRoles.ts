import {
  GuildMember,
  Message,
  MessageAttachment,
  MessageEmbed,
} from 'discord.js'
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { initRoles, logger, roles } from '@/utils'
import { app } from '@/index'
import { configuration } from '@/config'
import { Guild } from '@/database'

/**
 * Activate roles functionality.
 */
export default class ActivateRolesCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'activateroles',
      aliases: ['ar'],
      group: 'roles',
      memberName: 'activateroles',
      description: 'Activates bot roles.',
    })
  }

  /**
   * It executes when someone types the "activaterolesgame" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      if (!message.guild) {
        return message.say(`We cannot have roles here ¬¬`)
      }
      const user: GuildMember = await message.guild.members.fetch(
        message.author.id
      )
      if (!user.permissions.has('ADMINISTRATOR')) {
        return message.say(
          `You don't have permissions to run this command. Contact with an Administrator :sweat:`
        )
      }

      const { id: guildId } = message.guild
      const activatedRolesError = `You already have initialize ${configuration.appName}'s roles :relieved: Check yours with **${configuration.prefix}myroles**.`
      const cachedGuild = app.cache.get(guildId)
      if (cachedGuild?.rolesActivated) {
        return message.say(activatedRolesError)
      }

      const guild = await app.guildService.getById(guildId)
      if (!guild) {
        return message.say(
          `You have not run **${configuration.prefix}init** command. You cannot activate roles before that.`
        )
      }

      if (guild.rolesActivated) {
        return message.say(activatedRolesError)
      }

      let rolesList = ''
      const everyRole = Object.values(roles)
      everyRole.forEach((role) => {
        rolesList += `• ${role.name} \n`
      })

      const file = new MessageAttachment('./public/img/chibiKnightLogo.png')
      const embedMessage = new MessageEmbed()
        .setImage('attachment://chibiKnightLogo.png')
        .setAuthor(configuration.appName, 'attachment://chibiKnightLogo.png')
        .setThumbnail('attachment://chibiKnightLogo.png')
        .addField('The next roles will be added to your server:', rolesList)
        .setColor(configuration.embedMessageColor)
        .setFooter(
          `Do you really want to activate ${configuration.appName}'s roles ? (yes/y/no/n)`
        )
      await message.say({ embedMessage, files: [file] })

      const filter = (response: Message) => {
        const validAnswer = /yes|y|no|n/.test(response.content.toLowerCase())
        return response.author.id === message.author.id && validAnswer
      }
      // Waits 15 seconds while types a valid answer (yes/y/no/n).
      const collectedMessages = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 15000,
      })

      if (!collectedMessages.first()) {
        return message.say(`Time's up! Try again later ):`)
      }

      const receivedResponse = collectedMessages.first().content.toLowerCase()
      if (receivedResponse === 'no' || receivedResponse === 'n') {
        return message.say('Okay! (:')
      }

      // Answer was yes.
      await message.say(`Okay, we're working for you, meanwhile take a nap n.n`)

      const rolesCreated = await initRoles(message)
      if (!rolesCreated) {
        return message.say(
          `Error while trying to create roles, maybe I don't have enough permissions :sweat:`
        )
      }

      guild.rolesActivated = true
      await guild.save()

      const newCachedGuild: Guild = {
        guildId: message.guild.id,
        gameInstanceActive: guild.gameInstanceActive,
        rolesActivated: true,
      }
      app.cache.set(message.guild.id, newCachedGuild)

      return message.say(
        `Roles created successfully :purple_heart: Try to see yours with **${configuration.prefix}myroles** command.`
      )
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`,
        { context: this.constructor.name }
      )
      return message.say(
        'It occured an unexpected error, roles could not be created ): Try again later :sweat:'
      )
    }
  }
}
