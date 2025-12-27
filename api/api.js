const { MongoClient, ObjectId } = require("mongodb");

// Vercel Dashboard üzerinden eklediğin MONGODB_URI değişkenini çeker
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // CORS Ayarları (Frontend ile iletişim için şart)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tarayıcıların kontrol isteği (Preflight) için yanıt
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await client.connect();
        const db = client.db("hasanbrawl54_db_user");
        const codesColl = db.collection("codes");
        const usersColl = db.collection("users");

        // Gelen veriyi parse et (Vercel bazen string bazen object gönderir)
        let body = {};
        if (req.body) {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }

        // --- VERİ ÇEKME (GET) ---
        if (req.method === "GET") {
            const { type } = req.query;
            if (type === "users") {
                const users = await usersColl.find({}).toArray();
                return res.status(200).json(users);
            }
            // Varsayılan olarak kodları getir (Tarihe göre yeniden eskiye)
            const codes = await codesColl.find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(codes);
        }

        // --- YENİ KOD EKLEME (POST) ---
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

        // --- GÜNCELLEME (PUT) ---
        if (req.method === "PUT") {
            const { _id, ...updateData } = body;
            if (!_id) return res.status(400).json({ error: "ID gerekli" });
            
            await codesColl.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );
            return res.status(200).json({ msg: "Updated" });
        }

        // --- SİLME (DELETE) ---
        if (req.method === "DELETE") {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: "ID gerekli" });

            await codesColl.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ msg: "Deleted" });
        }

    } catch (e) {
        console.error("Database Error:", e);
        return res.status(500).json({ error: e.message });
    } finally {
        // Bağlantıyı açık tutmak performansı artırır ama istersen kapatabilirsin:
        // await client.close();
    }
};
