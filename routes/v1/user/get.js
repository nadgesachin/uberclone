const User = require("../../../models/User");

// GET ALL USERS
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        return res.json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

