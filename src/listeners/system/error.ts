import { Events, Listener } from '@sapphire/framework'
import { logger } from '@/utils'

export class ErrorListener extends Listener<typeof Events.Error> {
  public run(error: Error) {
    logger.error(error.message)
  }
}
