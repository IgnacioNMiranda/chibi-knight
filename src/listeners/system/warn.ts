import { Events, Listener } from '@sapphire/framework'
import { logger } from '@/utils'

export class WarnListener extends Listener<typeof Events.Warn> {
  public run(message: string) {
    logger.warn(message)
  }
}
