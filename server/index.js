const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');
const User = require('./models/User');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // 프론트엔드 URL을 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.options('*', cors()); // Preflight request handling

mongoose.connect('mongodb://localhost:27017/diary-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// Firebase Admin SDK 초기화
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (token, message) => {
    const payload = {
        notification: {
            title: 'Alarm',
            body: message
        }
    };

    try {
        await admin.messaging().sendToDevice(token, payload);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification', error);
    }
};

// 매분마다 사용자 알람 시간 확인
const checkAlarms = async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const users = await User.find({ alarmTime: currentTime });

    users.forEach(async (user) => {
        const fcmToken = user.fcmToken; // FCM 토큰을 사용자 모델에 추가해야 합니다.
        if (fcmToken) {
            await sendNotification(fcmToken, 'It\'s time for your alarm!');
        }
    });
};

// 1분마다 알람 확인
setInterval(checkAlarms, 60 * 1000);

const PORT = 3434;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
