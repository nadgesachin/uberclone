const jwtService = require("../services/token-service");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwtService.verifyToken(token);

    if (!decoded)
        return res.status(401).json({ success: false, message: "Invalid token" });

    req.user = decoded;
    next();
};
