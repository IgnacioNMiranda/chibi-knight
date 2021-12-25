import { MongoDatabase, Cache, GuildService, UserService } from '@/database'

declare module '@sapphire/pieces' {
  interface Container {
    db: MongoDatabase
    cache: Cache
  }
}
