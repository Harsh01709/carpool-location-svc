const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location'); 

const app = express();
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/carpool', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// POST endpoint to update location
app.post('/api/location', async (req, res) => {
    const { userId, longitude, latitude } = req.body;

    if (!userId || longitude === undefined || latitude === undefined) {
        return res.status(400).json({ error: "userId, longitude, and latitude are required" });
    }

    try {
        const location = await Location.findOneAndUpdate(
            { userId },
            {
                userId,
                coordinates: { type: "Point", coordinates: [longitude, latitude] },
                timestamp: new Date()
            },
            { upsert: true, new: true } // Create new if not found, return updated document
        );
        res.status(200).json({ message: "Location updated", location });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET endpoint to retrieve the latest location for a user
app.get('/api/location/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const location = await Location.findOne({ userId }).sort({ timestamp: -1 });
        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }
        res.status(200).json(location);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
