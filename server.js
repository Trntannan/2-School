const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const { ObjectId, MongoClient } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const mongoURI =
  "mongodb+srv://trntannan1:Trentas.10@cluster0.gubddcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0i";

let usersCollection; 

async function connectToMongoDB() {
  const client = new MongoClient(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB server");

    const db = client.db("user_data");
    const dbList = await client.db().admin().listDatabases();
    const databaseExists = dbList.databases.some(
      (db) => db.name === "user_data"
    );

    if (!databaseExists) {
      await db.createCollection("users");
      console.log("Created 'users' collection in the database");
    }

    usersCollection = db.collection("users");
    
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

async function updateOrCreateUserGroups(userId, groupData) {
  const user = await usersCollection.findOne({ userId });

  if (!user) {
    return { error: "User not found" };
  }

  const groups = user.groups || {};
  groups[groupData.groupName] = {
    schoolName: groupData.schoolName,
    schoolLocation: groupData.schoolLocation,
    meetupPoint: groupData.meetupPoint,
    startTime: groupData.startTime,
  };

  await usersCollection.updateOne(
    { userId: ObjectId(userId) },
    { $set: { groups } }
  );

  return { message: "Group data updated successfully" };
}

app
  .prepare()
  .then(async () => {
    const db = await connectToMongoDB();

    const server = express();
    server.use(bodyParser.json());

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

    server.put(
      "/api/profile",
      upload.single("profilePic"),
      async (req, res) => {
        const { userId, fullName, mobile, school, bio } = req.body;

        try {
          const user = await usersCollection.findOne({ userId });

          if (!user) {
            // User not found, create new user with profile
            const newUser = {
              userId,
              profile: {
                fullName,
                mobile,
                school,
                bio,
              },
            };

            // Handle profile picture upload
            if (req.file) {
              newUser.profile.profilePic = req.file.buffer.toString("base64");
            }

            await usersCollection.insertOne(newUser);
            return res.send({ message: "Profile created successfully" });
          } else {
            // User found, update profile
            const profileUpdates = {
              fullName,
              mobile,
              school,
              bio,
            };

            // Handle profile picture upload
            if (req.file) {
              profileUpdates.profilePic = req.file.buffer.toString("base64");
            }

            await usersCollection.updateOne(
              { userId },
              { $set: { profile: profileUpdates } }
            );
            return res.send({ message: "Profile updated successfully" });
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          res.status(500).send({ message: "Internal server error" });
        }
      }
    );

    server.get("/api/profile/:userId", async (req, res) => {
      const { userId } = req.params;

      const user = await usersCollection.findOne({ userId });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send(user.profile);
    });

    server.post("/api/updateUserGroups", async (req, res) => {
      const { userId, groupData } = req.body;

      try {
        const result = await updateOrCreateUserGroups(userId, groupData);
        if (result.error) {
          return res.status(404).send(result);
        }

        res.send(result);
      } catch (error) {
        console.error("Error updating user groups:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    server.get("/api/groups/:userId", async (req, res) => {
      const { userId } = req.params;

      try {
        const user = await usersCollection.findOne({ userId });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        const groups = user.groups || [];
        res.send({ groups });
      } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).send({ message: "Internal server error" });
      }
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
