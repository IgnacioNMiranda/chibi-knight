import { Events, Listener } from '@sapphire/framework'
import { Guild, TextChannel } from 'discord.js'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'
import { languageKeys } from '../../utils'

export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
  public async run(guild: Guild) {
    const channel = guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
    )

    if (channel) {
      const textChannel = channel as TextChannel
      const welcomeMessage = await resolveKey(guild, languageKeys.listeners.guild.welcomeMessage, {
        prefix: configuration.prefix,
      })
      textChannel.send(welcomeMessage)
    }
  }
}
