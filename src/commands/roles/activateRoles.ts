import { CollectorFilter, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed } from 'discord.js'
import { Command, container } from '@sapphire/framework'
import {
  ActivateRolesResolverParams,
  botLogoURL,
  getBotLogo,
  getButton,
  initRoles,
  logger,
  roles,
  RolesButtonId,
  UserActions,
  CustomPrecondition,
} from '@/utils'
import { configuration } from '@/config'
import { Guild } from '@/database'

/**
 * Activate roles functionality.
 */
export class ActivateRolesCommand extends Command {
  private resolver: Record<UserActions, (_: ActivateRolesResolverParams) => Promise<ActivateRolesResolverParams>> = {
    [UserActions.ACCEPT]: this.activate.bind(this),
    [UserActions.REJECT]: this.reject.bind(this),
    [UserActions.IGNORE]: this.ignore.bind(this),
  }

  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'activateroles',
      aliases: ['ar'],
      fullCategory: ['roles'],
      description: 'Activates bot roles.',
      preconditions: [
        CustomPrecondition.AdminOnly,
        CustomPrecondition.BotInitializeOnly,
        CustomPrecondition.RolesNotActiveOnly,
      ],
      requiredUserPermissions: ['ADMINISTRATOR'],
      requiredClientPermissions: ['MANAGE_ROLES'],
    })
  }

  /**
   * It executes when someone types the "activateroles" command.
   */
  async messageRun(message: Message): Promise<Message> {
    try {
      let rolesList = ''
      const everyRole = Object.values(roles)
      everyRole.forEach((role) => {
        rolesList += `• ${role.name}\n`
      })

      const embedMessage = new MessageEmbed()
        .setAuthor({
          name: configuration.appName,
          iconURL: botLogoURL,
        })
        .setThumbnail(botLogoURL)
        .addField('The next roles will be added to your server:', rolesList)
        .setColor(configuration.embedMessageColor)
        .setFooter(`> Do you really want to activate ${configuration.appName}'s roles ?`)

      const buttons = new MessageActionRow().addComponents(
        getButton(RolesButtonId.ACCEPT, 'ACCEPT', 'SUCCESS'),
        getButton(RolesButtonId.REJECT, 'REJECT', 'DANGER')
      )

      const activateRolesEmbedMessage = await message.channel.send({
        embeds: [embedMessage],
        files: [getBotLogo()],
        components: [buttons],
      })

      const filter: CollectorFilter<[MessageComponentInteraction<'cached'>]> = (btnInteraction) =>
        btnInteraction.user.id === message.author.id

      // Waits 15 seconds for response.
      const collector = message.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 15,
      })

      let authorAction = UserActions.IGNORE
      collector.on('end', (collection) => {
        if (collection.first()?.customId === RolesButtonId.REJECT) {
          authorAction = UserActions.REJECT
        } else if (collection.first()?.customId === RolesButtonId.ACCEPT) {
          authorAction = UserActions.ACCEPT
        }

        this.resolver[authorAction]({
          message,
          interaction: collection.first(),
        }).then(({ message, interaction }) => {
          activateRolesEmbedMessage.delete().catch()
          setTimeout(() => {
            interaction?.deleteReply().catch()
            message?.delete().catch()
          }, 1000 * 7)
        })
      })
    } catch (error) {
      logger.error(`MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`, {
        context: this.constructor.name,
      })
      return message.channel.send(
        'It occured an unexpected error, roles could not be created ): Try again later :sweat:'
      )
    }
  }

  async activate({ message, interaction }: ActivateRolesResolverParams) {
    const activatingRolesMsg = await message.channel.send(`Okay, we're working for you, meanwhile take a nap n.n`)

    const rolesCreated = await initRoles(message)
    if (!rolesCreated) {
      interaction.reply(`Error while trying to create roles, maybe I don't have enough permissions :sweat:`)
      return { interaction }
    }

    const { id: guildId } = message.guild
    const guild = await container.db.guildService.getById(guildId)
    guild.rolesActivated = true
    await guild.save()

    const newCachedGuild: Guild = {
      guildId: message.guild.id,
      rolesActivated: true,
    }
    container.cache.set(message.guild.id, newCachedGuild)

    interaction.reply(
      `Roles created successfully :purple_heart: Try to see yours with **${configuration.prefix}myroles** command.`
    )
    return { message: activatingRolesMsg, interaction }
  }

  async reject({ interaction }: ActivateRolesResolverParams) {
    await interaction.reply(`Okay! we're not gonna create any role (:`)
    return { interaction }
  }

  async ignore({ message }: ActivateRolesResolverParams) {
    const timesUpMessage = await message.channel.send(`Time's up! Try again later ):`)
    return { message: timesUpMessage }
  }
}
