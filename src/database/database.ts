import { mongoose } from '@typegoose/typegoose'
import { configuration } from '@/config'
import { UserService, GuildService } from '.'

export class MongoDatabase {
  public static instance: MongoDatabase | null = null
  private readonly connection: typeof mongoose
  public readonly guildService: GuildService
  public readonly userService: UserService

  constructor(connection: typeof mongoose) {
    this.connection = connection
    this.guildService = new GuildService()
    this.userService = new UserService()
  }

  static async connect() {
    if (this.instance) {
      return this.instance
    }

    const connection = await mongoose.connect(
      configuration.mongodb.connection_url,
      {
        serverSelectionTimeoutMS: 4000,
      }
    )

    return new MongoDatabase(connection)
  }
}
