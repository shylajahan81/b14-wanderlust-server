const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const uri = "mongodb://isratibnatlizna_db_user:StudioSpace2026@ac-by3okhs-shard-00-00.unskihv.mongodb.net:27017,ac-by3okhs-shard-00-01.unskihv.mongodb.net:27017,ac-by3okhs-shard-00-02.unskihv.mongodb.net:27017/studiospace?ssl=true&replicaSet=atlas-idrmrm-shard-0&authSource=admin";

// Create a MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will remain open
    }
}
run().catch(console.dir);

// Sample Route
app.get('/', (req, res) => {
    res.send('StudioSpace server is running!');
});

app.listen(port, () => {
    console.log(`StudioSpace server is running on port ${port}`);
});




















// Challenge 1: JWT Security Middleware
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access: No token provided' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};





// Challenge 2: Double-Booking Prevention Route
app.post('/api/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        const { studioId, date, timeSlot } = bookingData;

        const bookingsCollection = client.db("studiospace").collection("bookings");

        const existingBooking = await bookingsCollection.findOne({
            studioId: studioId,
            date: date,
            timeSlot: timeSlot,
            status: "Confirmed"
        });

        if (existingBooking) {
            return res.status(400).json({
                error: "Collision detected: This time slot is already booked and confirmed for this studio."
            });
        }

        const result = await bookingsCollection.insertOne({ ...bookingData, status: "Confirmed" });
        res.status(201).json({ success: true, insertedId: result.insertedId });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete('/api/studios/:id', verifyJWT, async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const studiosCollection = client.db("studiospace").collection("studios");
        const result = await studiosCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete studio" });
    }
});







