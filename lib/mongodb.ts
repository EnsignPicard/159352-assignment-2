/*
 * Need a way of checking for existing connections
 * that works on Vercel
 */
const client = new MongoClient(URI);

export async function connectDB() {
  // Do this check to avoid re-connecting - doesn't work on Vercel
  /*
  if (!client) {
    console.log('New connection');
    await client.connect();
  }
  */

  /*
  const globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(URI);
  }

  const client = globalWithMongo._mongoClient;
  */

  // Get the named database object
  const db = await client.db(DB_NAME);
  return db;
}