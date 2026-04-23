import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'distance_manager';
const collection = 'plans';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collection);

    switch (req.method) {
      case 'GET':
        const docs = await col.find().toArray();
        return res.status(200).json(docs);
      case 'POST':
        const result = await col.insertOne(req.body);
        return res.status(201).json({ insertedId: result.insertedId });
      case 'PUT':
        const id = req.body._id;
        delete req.body._id;
        await col.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
        return res.status(200).json({ ok: true });
      case 'DELETE':
        await col.deleteOne({ _id: new ObjectId(req.body._id) });
        return res.status(200).json({ ok: true });
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
}