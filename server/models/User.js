const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    alarmTime: { type: String }, // 알람 시간을 저장할 필드 (HH:mm 형식)
    fcmToken: { type: String } // FCM 토큰을 저장할 필드
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

module.exports = mongoose.model('User', userSchema);
