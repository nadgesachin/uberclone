const User = require("../../../models/User");

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ userId: req.params.userId });

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        return res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
