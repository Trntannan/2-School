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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const DATA_DIR = "./user_data";
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());

    // Register endpoint
    server.post("/api/register", async (req, res) => {
      const { username, email, password } = req.body;

      const userFilePath = path.join(DATA_DIR, `${email}.json`);
      if (fs.existsSync(userFilePath)) {
        return res.status(400).send({ message: "User already exists" });
      }

      const userId = crypto.randomBytes(16).toString("hex");
      const user = { userId, username, email, password };

      fs.writeFileSync(userFilePath, JSON.stringify(user, null, 2));
      res.send({ message: "User registered successfully", userId });
    });

    // Login endpoint
    server.post("/api/login", async (req, res) => {
      const { email, password } = req.body;

      const userFilePath = path.join(DATA_DIR, `${email}.json`);
      if (!fs.existsSync(userFilePath)) {
        return res.status(401).send({ message: "Invalid credentials" });
      }

      const user = JSON.parse(fs.readFileSync(userFilePath));
      if (user.password !== password) {
        return res.status(401).send({ message: "Invalid credentials" });
      }

      res.send({
        message: "Login successful",
        user: { userId: user.userId, email: user.email },
      });
    });

    // Profile update endpoint
    server.post(
      "/api/profile",
      upload.single("profilePic"),
      async (req, res) => {
        const { userId, fullName, mobile, school, bio } = req.body;

        // Find the user's file by matching the userId
        const userFiles = fs.readdirSync(DATA_DIR);
        const userFilePath = userFiles.find((file) => {
          const user = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file)));
          return user.userId === userId;
        });

        if (!userFilePath) {
          return res.status(404).send({ message: "User not found" });
        }

        const user = JSON.parse(
          fs.readFileSync(path.join(DATA_DIR, userFilePath))
        );

        // Update profile information
        user.profile = { fullName, mobile, school, bio };

        if (req.file) {
          user.profile.profilePic = req.file.buffer.toString("base64");
        }

        fs.writeFileSync(
          path.join(DATA_DIR, userFilePath),
          JSON.stringify(user)
        );

        res.send({ message: "Profile updated successfully" });
      }
    );

    // Fetch user profile data endpoint
    server.get("/api/profile/:userId", (req, res) => {
      const { userId } = req.params;

      const userFiles = fs.readdirSync(DATA_DIR);
      const userFilePath = userFiles.find((file) => {
        const user = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file)));
        return user.userId === userId;
      });

      if (!userFilePath) {
        return res.status(404).send({ message: "User not found" });
      }

      const user = JSON.parse(
        fs.readFileSync(path.join(DATA_DIR, userFilePath))
      );
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
