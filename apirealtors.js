import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'distance_manager';
const collection = 'realtors';

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
        const { id, ...query } = req.query;
        if (id) {
          const doc = await col.findOne({ _id: new ObjectId(id) });
          return res.status(200).json(doc || {});
        }
        // Support basic filtering (used by search)
        const filter = {};
        if (query.company) filter.company = query.company;
        const docs = await col.find(filter).sort({ created_at: -1 }).toArray();
        return res.status(200).json(docs);

      case 'POST':
        const newDoc = { ...req.body, created_at: new Date().toISOString() };
        const result = await col.insertOne(newDoc);
        return res.status(201).json({ insertedId: result.insertedId });

      case 'PUT':
        const updateId = req.body._id;
        if (!updateId) return res.status(400).json({ error: 'Missing _id' });
        delete req.body._id;
        await col.updateOne({ _id: new ObjectId(updateId) }, { $set: req.body });
        return res.status(200).json({ ok: true });

      case 'DELETE':
        const deleteId = req.body._id;
        if (!deleteId) return res.status(400).json({ error: 'Missing _id' });
        await col.deleteOne({ _id: new ObjectId(deleteId) });
        return res.status(200).json({ ok: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
}