const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};


const register = asyncHandler(async (req, res) => {
  const { email, password, isAdmin } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please enter all the required fields" });
    return;
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ error: "User already exists!" });

      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    if (newUser) {
      res.status(201).json({
        _id: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin || false,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).json({ error: "Invalid credentials" });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });

  }
});
;



const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please enter all the required fields" });

  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: "The credentials you entered are invalid" });

  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400).json({ error: "User does not exist" });
    

  } else {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedUser);
  }
});


const reset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ error: "User does not exist" });

  }

  const resetCode = generateResetCode();

  user.resetCode = resetCode;
  await user.save();

  sendResetCodeByEmail(email, resetCode);

  res.status(200).json({ message: 'Reset code sent successfully' });
});


const setPassword = asyncHandler(async (req, res) => {
  const { email, password, resetCode } = req.body;

  const user = await User.findOne({ email, resetCode });

  if (!user) {
  res.status(400).json({ message: 'Invalid reset code or email' });

  }


  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  user.resetCode = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });
});

const sendResetCodeByEmail = async (email, resetCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.Email,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.Email,
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${resetCode}`,
  };

  await transporter.sendMail(mailOptions);
};

const generateResetCode = async () => {
  const cryptoRandomString = (await import('crypto-random-string')).default;
  return cryptoRandomString({ length: 8, type: 'alphanumeric' });
};


const getCredentials = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});



const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users) {
    handleErrors(res, 400, 'Users not found');
  } else {
    res.json(users);
  }
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    handleErrors(res, 400, 'User not found');
  } else {
    res.json(user);
  }
});



const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      handleErrors(res, 404, 'User not found');
    }

    await User.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ id: req.params.id, message: 'User account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = {
  register,
  login,
  updateUser,
  reset,
  getCredentials,
  getUsers,
  getUser,
  deleteUser,
  setPassword,
};
