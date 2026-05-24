import { MongoClient } from "mongodb";
const URI = process.env.MONGODB_URI!;
const DB_NAME = "airline";
const client = new MongoClient(URI);
export async function connectDB() {
    const db = await client.db(DB_NAME);
    return db;
}