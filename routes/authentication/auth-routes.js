const Crypto = require("crypto-js");
const User = require("../../models/User");
const jwtService = require("../services/token-service");

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email & password required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Decrypt stored password
    const decrypted = Crypto.AES.decrypt(user.password, "MY_SECRET_KEY");
    const originalPassword = decrypted.toString(Crypto.enc.Utf8);

    if (originalPassword !== password)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT
    const token = jwtService.generateToken({
      userId: user._id.toString(),
      userType: user.userType,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: user,
      token
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
