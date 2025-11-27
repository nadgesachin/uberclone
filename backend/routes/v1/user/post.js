const Crypto = require("crypto-js");
const User = require("../../../models/User");
const jwtService = require("../../services/token-service");

exports.createUser = async function (req, res) {
  try {
    console.log("Creating user with data:", req.body);

    const { fullName, email, phone, password, userType } = req.body;

    if (!fullName || !email || !phone || !password || !userType) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "Email already used" });

    // Encrypt password using CryptoJS AES
    const encryptedPassword = Crypto.AES.encrypt(password, "MY_SECRET_KEY").toString();

    const user = await User.create({
      userType,
      fullName,
      email,
      phone,
      password: encryptedPassword,
    });

    // Generate JWT using jwtService
    const token = jwtService.generateToken({
      userId: user._id.toString(),
      userType: user.userType,
    });

    res.json({ success: true, data: user, token });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};