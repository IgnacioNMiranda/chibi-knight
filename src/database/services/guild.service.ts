import { DocumentType, ReturnModelType, getModelForClass } from '@typegoose/typegoose'
import { Guild } from '../models'

export class GuildService {
  private readonly guildRepository: ReturnModelType<typeof Guild>

  constructor() {
    this.guildRepository = getModelForClass(Guild)
  }

  async create(guild: Guild) {
    return this.guildRepository.create(guild)
  }

  async getAll(): Promise<DocumentType<Guild>[]> {
    return this.guildRepository.find().exec()
  }

  async getById(guildId: string): Promise<DocumentType<Guild>> {
    return this.guildRepository.findOne({ guildId }).exec()
  }

  async deleteById(guildId: string) {
    this.guildRepository.deleteOne({ guildId }).exec()
  }
}
