import {
  DocumentType,
  ReturnModelType,
  getModelForClass,
} from '@typegoose/typegoose';
import { app } from '../../main';
import { Guild } from '../models/index';

export default class UserService {
  private readonly guildRepository: ReturnModelType<typeof Guild>;

  constructor() {
    this.guildRepository = getModelForClass(Guild);
  }

  async create(guild: Guild) {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.guildRepository.create(guild);
      }
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<DocumentType<Guild>[]> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.guildRepository.find().exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async getById(guildId: string): Promise<DocumentType<Guild>> {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.guildRepository.findOne({ guildId }).exec();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteById(guildId: string) {
    try {
      const mongo = await app.mongoConnection.connect();
      if (mongo) {
        return this.guildRepository.deleteOne({ guildId }).exec();
      }
    } catch (error) {
      throw error;
    }
  }
}
