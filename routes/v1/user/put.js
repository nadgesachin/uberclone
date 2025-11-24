const User = require("../../../models/User");

// UPDATE USER
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true }
        );

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        return res.json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
