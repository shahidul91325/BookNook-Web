import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/booknook";
const dbName = process.env.MONGODB_DB_NAME || "booknook";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Returns a connected MongoClient instance.
 */
export default clientPromise;

/**
 * Returns the MongoDB database instance for BookNook.
 */
export async function getDatabase(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

/**
 * Returns the default synchronous MongoDB client instance.
 */
export function getMongoClient(): MongoClient {
  if (!client) {
    client = new MongoClient(uri);
  }
  return client;
}
