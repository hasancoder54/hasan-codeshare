const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await client.connect();
        const db = client.db("hasanbrawl54_db_user");
        const codesColl = db.collection("codes");
        const usersColl = db.collection("users");

        // Gönderilen veriyi işle
        let body = {};
        if (req.body) {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }

        if (req.method === "GET") {
            const { type } = req.query;
            if (type === "users") {
                const users = await usersColl.find({}).toArray();
                return res.status(200).json(users);
            }
            const codes = await codesColl.find({}).toArray();
            return res.status(200).json(codes);
        }

        if (req.method === "POST") {
            const newCode = {
                title: body.title,
                content: body.content,
                game: body.game || "Universal",
                status: body.status || "Working",
                author: body.author || "Admin",
                createdAt: new Date()
            };
            await codesColl.insertOne(newCode);
            return res.status(201).json({ msg: "Success" });
        }

        if (req.method === "PUT") {
            const { _id, ...updateData } = body;
            await codesColl.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });
            return res.status(200).json({ msg: "Updated" });
        }

        if (req.method === "DELETE") {
            const { id } = req.query;
            await codesColl.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ msg: "Deleted" });
        }

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
