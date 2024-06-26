const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const { MongoClient } = require("mongodb");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const DATA_DIR = "./user_data";
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const mongoURI =
  "mongodb+srv://trntannan1:Trentas.10@cluster0.gubddcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0i"; // Replace with your MongoDB connection URI

async function connectToMongoDB() {
  const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB server");

    const db = client.db("user_data");

    // Check if the database exists; if not, create it
    const dbList = await client.db().admin().listDatabases();
    const databaseExists = dbList.databases.some(
      (db) => db.name === "user_data"
    );

    if (!databaseExists) {
      await db.createCollection("users");
      console.log("Created 'users' collection in the database");
    }

    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

app
  .prepare()
  .then(async () => {
    const db = await connectToMongoDB();

    const usersCollection = db.collection("users");

    const server = express();
    server.use(bodyParser.json());

    // Register endpoint
    server.post("/api/register", async (req, res) => {
      const { username, email, password } = req.body;

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: "User already exists" });
      }

      const userId = crypto.randomBytes(16).toString("hex");
      const newUser = { userId, username, email, password };

      await usersCollection.insertOne(newUser);
      res.send({ message: "User registered successfully", userId });
    });

    // Login endpoint
    server.post("/api/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await usersCollection.findOne({ email, password });
      if (!user) {
        return res.status(401).send({ message: "Invalid credentials" });
      }

      res.send({
        message: "Login successful",
        user: { userId: user.userId, email: user.email },
      });
    });

    // Profile update endpoint
    server.put(
      "/api/profile",
      upload.single("profilePic"),
      async (req, res) => {
        const { userId, field, value } = req.body;

        const user = await usersCollection.findOne({ userId });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        const updatedProfile = { [field]: value };

        if (req.file) {
          updatedProfile.profilePic = req.file.buffer.toString("base64");
        }

        await usersCollection.updateOne(
          { userId },
          { $set: { [`profile.${field}`]: value } }
        );

        res.send({ message: "Profile updated successfully" });
      }
    );

    // Fetch user profile data endpoint
    server.get("/api/profile/:userId", async (req, res) => {
      const { userId } = req.params;

      const user = await usersCollection.findOne({ userId });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send(user.profile);
    });

    server.all("*", (req, res) => handle(req, res));

    server.listen(3000, (err) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
