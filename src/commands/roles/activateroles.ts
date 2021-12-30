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
  CustomCommand,
  CustomArgs,
  CustomPrecondition,
  languageKeys,
} from '@/utils'
import { configuration } from '@/config'
import { Guild } from '@/database'

/**
 * Activate roles functionality.
 */
export class ActivateRolesCommand extends CustomCommand {
  private resolver: Record<UserActions, (_: ActivateRolesResolverParams) => Promise<ActivateRolesResolverParams>> = {
    [UserActions.ACCEPT]: this.activate.bind(this),
    [UserActions.REJECT]: this.reject.bind(this),
    [UserActions.IGNORE]: this.ignore.bind(this),
  }

  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['ar'],
      description: languageKeys.commands.roles.activateroles.description,
      preconditions: [
        CustomPrecondition.AdminOnly,
        CustomPrecondition.BotInitializedOnly,
        CustomPrecondition.RolesDeactivatedOnly,
      ],
      requiredUserPermissions: ['ADMINISTRATOR'],
      requiredClientPermissions: ['MANAGE_ROLES'],
    })
  }

  /**
   * It executes when someone types the "activateroles" command.
   */
  async messageRun(message: Message, { t }: CustomArgs): Promise<Message> {
    const { rolesListText, messageFooter, acceptButtonLabel, rejectButtonLabel, unexpectedError } =
      languageKeys.commands.roles.activateroles

    try {
      let rolesList = ''
      const everyRole = Object.values(roles)
      everyRole.forEach((role) => {
        rolesList += `• ${role.name}\n`
      })

      const { appName } = configuration

      const embedMessage = new MessageEmbed()
        .setAuthor({
          name: configuration.appName,
          iconURL: botLogoURL,
        })
        .setThumbnail(botLogoURL)
        .addField(t(rolesListText), rolesList)
        .setColor(configuration.embedMessageColor)
        .setFooter(t(messageFooter, { appName }))

      const buttons = new MessageActionRow().addComponents(
        getButton(RolesButtonId.ACCEPT, t(acceptButtonLabel), 'SUCCESS'),
        getButton(RolesButtonId.REJECT, t(rejectButtonLabel), 'DANGER')
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
          t,
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
      return message.channel.send(t(unexpectedError))
    }
  }

  async activate({ message, t, interaction }: ActivateRolesResolverParams) {
    const { activateMessage, rolesCreationError, rolesCreationSuccessful } = languageKeys.commands.roles.activateroles
    const activatingRolesMsg = await message.channel.send(t(activateMessage))

    const rolesCreated = await initRoles(message)
    if (!rolesCreated) {
      interaction.reply(rolesCreationError)
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

    interaction.reply(t(rolesCreationSuccessful, { prefix: configuration.prefix }))
    return { message: activatingRolesMsg, interaction }
  }

  async reject({ t, interaction }: ActivateRolesResolverParams) {
    await interaction.reply(t(languageKeys.commands.roles.activateroles.rejectMessage))
    return { interaction }
  }

  async ignore({ message, t }: ActivateRolesResolverParams) {
    const timesUpMessage = await message.channel.send(t(languageKeys.commands.roles.activateroles.ignoreMessage))
    return { message: timesUpMessage }
  }
}
