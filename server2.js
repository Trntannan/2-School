// server.js
const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const QRCode = require('qrcode');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let users = [];
let profiles = {};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.prepare().then(() => {
    const server = express();
    server.use(bodyParser.json());

    // Register endpoint
    server.post('/api/register', (req, res) => {
        const { username, email, password } = req.body;
        if (users.find(user => user.email === email)) {
            return res.status(400).send({ message: 'User already exists' });
        }
        const id = crypto.randomBytes(16).toString('hex');
        users.push({ id, username, email, password, qr: id });
        res.send({ message: 'User registered successfully' });
    });

    // Login endpoint
    server.post('/api/login', (req, res) => {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        res.send({ message: 'Login successful', user });
    });

    // Profile update endpoint
    server.post('/api/profile', upload.single('profilePic'), (req, res) => {
        const { id, fullName, mobile, school, bio } = req.body;
        const profilePic = req.file ? req.file.buffer.toString('base64') : null;

        profiles[id] = {
            fullName,
            mobile,
            school,
            bio,
            profilePic
        };

        res.send({ message: 'Profile updated successfully' });
    });

    // QR Code generation endpoint
    server.get('/api/qrcode/:id', (req, res) => {
        const { id } = req.params;
        if (!users.find(u => u.id === id)) {
            return res.status(404).send({ message: 'User not found' });
        }

        const url = `https://localhost:3000/profile/${id}`;
        QRCode.toDataURL(url, (err, src) => {
            if (err) res.send({ message: 'Error generating QR code' });
            res.send({ src });
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
}).catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
});