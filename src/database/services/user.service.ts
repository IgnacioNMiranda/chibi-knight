import {
  DocumentType,
  ReturnModelType,
  getModelForClass,
} from '@typegoose/typegoose'
import { Aggregate } from 'mongoose'
import { User } from '../models'

export class UserService {
  private readonly userRepository: ReturnModelType<typeof User>

  constructor() {
    this.userRepository = getModelForClass(User)
  }

  async create(user: User) {
    return this.userRepository.create(user)
  }

  async getAll(): Promise<DocumentType<User>[]> {
    return this.userRepository.find().exec()
  }

  async getByFilter(
    filter: any,
    limit = 10,
    sort = 1
  ): Promise<DocumentType<User>[]> {
    return this.userRepository.find(filter).limit(limit).sort(sort).exec()
  }

  async getByNestedFilter(
    unwind: string,
    filter: any,
    sort: any,
    limit = 10
  ): Promise<Aggregate<User[]>> {
    return await this.userRepository.aggregate([
      { $unwind: `$${unwind}` },
      { $match: filter },
      { $sort: sort },
      { $limit: limit },
    ])
  }

  async getById(discordUserId: string): Promise<DocumentType<User>> {
    return this.userRepository.findOne({ discordId: discordUserId }).exec()
  }

  async deleteById(discordUserId: string) {
    return this.userRepository.deleteOne({ discordId: discordUserId }).exec()
  }

  async deleteGuildDataById(guildId: string) {
    this.userRepository
      .updateMany(
        {
          guildsData: {
            $elemMatch: {
              guildId,
            },
          },
        },
        {
          $pull: {
            guildsData: { guildId },
          },
        }
      )
      .exec()
  }
}
