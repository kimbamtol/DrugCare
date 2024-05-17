// server/routes/diary.js
const express = require('express');
const Diary = require('../models/Diary');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { content } = req.body;
    try {
        const diary = new Diary({ userId: req.user.userId, content });
        await diary.save();
        res.status(201).send(diary);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const diaries = await Diary.find({ userId: req.user.userId });
        res.send(diaries);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;
