const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { connect } = require('getstream');
const streamchat = require('stream-chat');

const login = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const serverClient = connect(
            process.env.STREAM_API_KEY,
            process.env.STREAM_API_SECRET,
            process.env.STREAM_APP_ID
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        const token = serverClient.createUserToken(userId);

        res.status(200).json({ token, fullName, username, userId, hashedPassword, phoneNumber });
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

const signup = async (req, res) => {
    try {
        const {username, password} = req.body;

        const serverClient = connect(
            process.env.STREAM_API_KEY,
            process.env.STREAM_API_SECRET,
            process.env.STREAM_APP_ID
        );

        const client = StreamClient.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

        const { users } = await client.queryUsers({ name : username})
        if (!users.length) {
            res.status(400).json({ message: 'User not found' });
        }

        const success = await bcrypt.compare(password, users[0].hashedPassword);
        
        const token = serverClient.createUserToken(users[0].id);

        if (success) {
            res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id });
        }
        else {
            res.status(500).json({ message: 'Incorrect password' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

module.exports = {
    login,
    signup
}