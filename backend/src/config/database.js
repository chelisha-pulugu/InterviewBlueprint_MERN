const mongoose = require("mongoose");

async function connectToDB() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        throw new Error("Set MONGODB_URI in backend/.env before starting the API.");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
}

module.exports = connectToDB;
