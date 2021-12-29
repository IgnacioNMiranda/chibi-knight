import { Events, Listener } from '@sapphire/framework'
import { Guild, TextChannel } from 'discord.js'
import { configuration } from '@/config'

export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
  public run(guild: Guild) {
    const channel = guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
    )

    if (channel) {
      const textChannel = channel as TextChannel
      textChannel.send(
        `Thanks for invite me to your server n.n please, first run the **${configuration.prefix}init** command, I need it to work correctly (:`
      )
    }
  }
}
