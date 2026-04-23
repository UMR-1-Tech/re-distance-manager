import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'distance_manager';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const docs = await db.collection('realtors').find({}).toArray();
    return res.status(200).json(docs);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
}