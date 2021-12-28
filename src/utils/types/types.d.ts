import { MongoDatabase, Cache, GuildService, UserService } from '@/database'

declare module '@sapphire/pieces' {
  interface Container {
    db: MongoDatabase
    cache: Cache
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    /** Roles */
    RolesNotActiveOnly: never
    RolesActiveOnly: never

    /** Server */
    BotNotInitializeOnly: never
    BotInitializeOnly: never

    /** User */
    AdminOnly: never
  }
}
