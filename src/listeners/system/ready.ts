import { Events, Listener } from '@sapphire/framework'
import type { Client } from 'discord.js'
import { configuration } from '@/config'
import { logger } from '@/utils'

export class ReadyListener extends Listener<typeof Events.ClientReady> {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
    })
  }

  public run(client: Client) {
    client.user.setActivity(`${configuration.client.defaultPrefix}help`)
    logger.info(`${client.user.username} is online n.n`, {
      context: client.constructor.name,
    })
  }
}
