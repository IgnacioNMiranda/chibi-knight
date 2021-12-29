import { MongoDatabase, Cache } from '@/database'
import { ICustomPreconditions } from './preconditions'

declare module '@sapphire/pieces' {
  interface Container {
    db: MongoDatabase
    cache: Cache
  }
}

declare module '@sapphire/framework' {
  interface Preconditions extends ICustomPreconditions {}
}
