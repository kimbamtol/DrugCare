const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).send('User created');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.send({ token });
});

router.post('/set-alarm', authMiddleware, async (req, res) => {
    const { alarmTime } = req.body;
    try {
        await User.findByIdAndUpdate(req.user.userId, { alarmTime });
        res.status(200).send('Alarm time set successfully');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// FCM 토큰 저장 엔드포인트
router.post('/save-fcm-token', authMiddleware, async (req, res) => {
    const { fcmToken } = req.body;
    try {
        await User.findByIdAndUpdate(req.user.userId, { fcmToken });
        res.status(200).send('FCM token saved successfully');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;
