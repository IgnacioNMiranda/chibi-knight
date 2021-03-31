import { mongoose } from '@typegoose/typegoose';
import configuration from '../config/configuration';

export function openMongoConnection() {
  return mongoose.connect(configuration.mongodb.connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}
