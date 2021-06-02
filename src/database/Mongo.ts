import { mongoose } from '@typegoose/typegoose';
import { configuration } from '../config/configuration';

export class MongoConnection {
  private mongo: typeof mongoose;

  async connect() {
    if (this.mongo) {
      return this.mongo;
    }

    try {
      this.mongo = await mongoose.connect(
        configuration.mongodb.connection_url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          serverSelectionTimeoutMS: 4000,
        },
      );
      return this.mongo;
    } catch (error) {
      throw error;
    }
  }
}
