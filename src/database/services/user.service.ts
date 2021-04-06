import {
  DocumentType,
  ReturnModelType,
  getModelForClass,
} from '@typegoose/typegoose';
import { Aggregate } from 'mongoose';
import { app } from '../../main';
import { User } from '../models/index';

export default class UserService {
  private readonly userRepository: ReturnModelType<typeof User>;

  constructor() {
    this.userRepository = getModelForClass(User);
  }

  async create(user: User) {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.userRepository.create(user);
      }
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<DocumentType<User>[]> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.userRepository.find().exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async getByFilter(
    filter: any,
    limit = 10,
    sort = 1,
  ): Promise<DocumentType<User>[]> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.userRepository.find(filter).limit(limit).sort(sort).exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async getByNestedFilter(
    unwind: string,
    filter: any,
    limit = 10,
    sort: any,
  ): Promise<Aggregate<User[]>> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return await this.userRepository.aggregate([
          { $unwind: `$${unwind}` },
          { $match: filter },
          { $sort: sort },
          { $limit: limit },
        ]);
      }
    } catch (error) {
      throw error;
    }
  }

  async getById(discordUserId: string): Promise<DocumentType<User>> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.userRepository.findOne({ discordId: discordUserId }).exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteById(discordUserId: string) {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.userRepository
          .deleteOne({ discordId: discordUserId })
          .exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteGuildDataById(guildId: string) {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
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
            },
          )
          .exec();
      }
    } catch (error) {
      throw error;
    }
  }
}
