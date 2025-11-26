const jwt = require("jsonwebtoken");
const SECRET = "SUPERSECRET123";

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            userId: user.userId,
            userType: user.userType,
        },
        SECRET,
        { expiresIn: "30d" }
    );
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
};
