const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const QRCode = require('qrcode');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const mongoURI = 'mongodb+srv://trntannan1:Trentas.10@cluster0.gubddcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI).then(async () => {
    console.log("Connected to MongoDB");
    await initializeDatabase();
}).catch(err => {
    console.error("Could not connect to MongoDB", err);
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    qr: String,
});
const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: String,
    mobile: String,
    school: String,
    bio: String,
    profilePic: String,
});

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function initializeDatabase() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('users')) {
        await mongoose.connection.createCollection('users');
        console.log('Created users collection');
    }
    if (!collectionNames.includes('profiles')) {
        await mongoose.connection.createCollection('profiles');
        console.log('Created profiles collection');
    }
}

app.prepare().then(() => {
    const server = express();
    server.use(bodyParser.json());

    // Register endpoint
    server.post('/api/register', async (req, res) => {
        const { username, email, password } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).send({ message: 'User already exists' });
        }
        const id = crypto.randomBytes(16).toString('hex');
        const user = new User({ username, email, password, qr: id });
        await user.save();
        res.send({ message: 'User registered successfully' });
    });

    // Login endpoint
    server.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        res.send({ message: 'Login successful', user });
    });

    // Profile update endpoint
    server.post('/api/profile', upload.single('profilePic'), async (req, res) => {
        const { userId, fullName, mobile, school, bio } = req.body;
        const profilePic = req.file ? req.file.buffer.toString('base64') : null;
        const profile = new Profile({ userId, fullName, mobile, school, bio, profilePic });
        await profile.save();
        res.send({ message: 'Profile updated successfully' });
    });

    // Fetch user profile endpoint
    server.get('/api/profiles/:userId', async (req, res) => {
        const { userId } = req.params;
        try {
            const profile = await Profile.findOne({ userId }).populate('userId');
            if (!profile) {
                return res.status(404).send({ message: 'Profile not found' });
            }
            res.send(profile);
        } catch (error) {
            res.status(500).send({ message: 'Error retrieving profile' });
        }
    });

    // QR Code generation endpoint
    server.get('/api/qrcode/:userId', async (req, res) => {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const url = `https://localhost:3000/profile/${userId}`;
        QRCode.toDataURL(url, (err, src) => {
            if (err) return res.send({ message: 'Error generating QR code' });
            res.send({ src });
        });
    });

    server.all('*', (req, res) => handle(req, res));

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
}).catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
});