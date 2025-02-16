//run "mongosh" at terminal first (default profile: Git Bash). 
//run "node service.js", do not use the one under server. 

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserContext = require('./server/models/UserContext');

// 初始化 Express 应用
const app = express();

// 使用中间件
app.use(bodyParser.json());
app.use(cors());

// 连接 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/design', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// 更新用户上下文接口
app.post('/update-context', async (req, res) => {
    const { userId, input } = req.body;

    if (!userId || !input) {
        return res.status(400).json({ error: 'Missing userId or input' });
    }

    try {
        // 查找用户上下文，如果不存在则创建
        let userContext = await UserContext.findOne({ userId });
        if (!userContext) {
            userContext = new UserContext({ userId, preferences: {} });
        }

        // 解析用户输入并更新上下文
        const updatedPreferences = parseInputToPreferences(input, userContext.preferences);
        userContext.preferences = updatedPreferences;

        // 将 updatedPreferences（新生成的参数）保存到用户的数据库记录中。示例：将更新后的参数（如 {"width": 20, "height": 20, "depth": 20, "color": 0x0000ff}）存储到 MongoDB。
        await userContext.save();

        // 返回更新后的上下文, 最终将更新后的 userContext.preferences 返回给前端。
        res.json(userContext.preferences);
    } catch (error) {
        console.error('Error updating context:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 解析用户输入函数
function parseInputToPreferences(input, existingPreferences) {
    const parameters = { ...existingPreferences };

    // 示例规则：处理“再大一点”之类的输入
    if (input.includes('bigger')) {
        parameters.width = (parameters.width || 1) + 10;
        parameters.height = (parameters.height || 1) + 10;
        parameters.depth = (parameters.depth || 1) + 10;
    }

    // 示例规则：处理“蓝色”之类的颜色输入
    if (input.includes('blue')) {
        parameters.color = 0x0000ff; // 蓝色
    }

    // 你可以在这里调用更复杂的 NLP 或规则解析逻辑
    return parameters;
}

console.log(parameters);


// 测试接口
app.get('/', (req, res) => {
    res.send('Design in Action API is running!');
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
