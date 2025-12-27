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
            const { title, content, game, status, author } = JSON.parse(req.body);
            const newCode = {
                title,
                content,
                game: game || "Universal",
                status: status || "Working",
                author: author || "Admin",
                createdAt: new Date()
            };
            await codesColl.insertOne(newCode);
            return res.status(201).json({ msg: "Success" });
        }

        if (req.method === "PUT") {
            const data = JSON.parse(req.body);
            const id = data._id;
            delete data._id;
            await codesColl.updateOne({ _id: new ObjectId(id) }, { $set: data });
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
