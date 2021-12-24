import { mongoose } from '@typegoose/typegoose'
import { configuration } from '@/config'

export class MongoConnection {
  private mongo: typeof mongoose

  async connect() {
    if (this.mongo) {
      return this.mongo
    }

    this.mongo = await mongoose.connect(configuration.mongodb.connection_url, {
      serverSelectionTimeoutMS: 4000,
    })
    return this.mongo
  }
}
