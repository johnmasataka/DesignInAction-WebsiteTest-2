const mongoose = require('mongoose');

// 定义用户上下文 Schema
const userContextSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // 用户 ID
    preferences: { type: Object, default: {} }, // 用户偏好或上下文参数
}, { timestamps: true }); // 自动记录创建和更新时间

// 创建并导出模型
module.exports = mongoose.model('UserContext', userContextSchema);
