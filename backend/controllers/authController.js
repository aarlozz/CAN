// authController.js — Authentication controller (4-role system)
//
// Exports:
//   registerStudent  POST /api/auth/register/student
//   registerCollege  POST /api/auth/register/college
//   login            POST /api/auth/login
//   logout           POST /api/auth/logout  (protected)

const User          = require('../models/User');
const Student       = require('../models/Student');
const College       = require('../models/College');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────
// REGISTER STUDENT
// Creates: User (userType: 'student') + Student profile in one go
// Body:    email, password, fullName, gender
//          optional: phone, dateOfBirth
// ─────────────────────────────────────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const { email, password, fullName, gender, phone, dateOfBirth } = req.body;

    // 1. Validate required fields
    if (!email || !password || !fullName || !gender) {
      return res.status(400).json({
        message: 'email, password, fullName and gender are required',
      });
    }

    // 2. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // 3. Create User — pre-save hook hashes password automatically
    const user = await User.create({
      email,
      password,
      userType: 'student',
    });

    // 4. Create Student profile linked to User
    const student = await Student.create({
      userId: user._id,
      personalInfo: {
        fullName,
        gender,
        phone:       phone       || undefined,
        dateOfBirth: dateOfBirth || undefined,
      },
    });

    // 5. Generate token — payload includes { id, userType }
    const token = generateToken(user._id, user.userType);

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id:       user._id,
        email:    user.email,
        userType: user.userType,
      },
      profile: {
        studentId: student._id,
        fullName:  student.personalInfo.fullName,
      },
    });

  } catch (error) {
    // Mongoose duplicate key (race condition — second check after findOne)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    console.error('registerStudent error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// REGISTER COLLEGE
// Creates: User (userType: 'college') + College profile in one go
// Body:    email, password, collegeName,
//          provinceId, provinceName, districtId, districtName,
//          websiteUrl, phone
//          optional: addressLine, municipalityId, municipalityName
// ─────────────────────────────────────────────────────────────────
exports.registerCollege = async (req, res) => {
  try {
    const {
      email,
      password,
      collegeName,
      provinceId,
      provinceName,
      districtId,
      districtName,
      municipalityId,
      municipalityName,
      addressLine,
      websiteUrl,
      phone,
    } = req.body;

    // 1. Validate required fields
    if (!email || !password || !collegeName || !provinceId || !districtId) {
      return res.status(400).json({
        message: 'email, password, collegeName, provinceId and districtId are required',
      });
    }

    // 2. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // 3. Create User — pre-save hook hashes password automatically
    const user = await User.create({
      email,
      password,
      userType: 'college',
    });

    // 4. Create College profile linked to User
    const college = await College.create({
      userId:     user._id,
      collegeName,
      location: {
        province: {
          provinceId,
          provinceName: provinceName || undefined,
        },
        district: {
          districtId,
          districtName: districtName || undefined,
        },
        municipality: municipalityId
          ? { municipalityId, municipalityName: municipalityName || undefined }
          : undefined,
        addressLine: addressLine || undefined,
      },
      contactInfo: {
        websiteUrl: websiteUrl || undefined,
        email,                               // mirror contact email from auth email
        phone:      phone      || undefined,
      },
      // verification.status defaults to 'pending' — set by schema
    });

    // 5. Generate token
    const token = generateToken(user._id, user.userType);

    res.status(201).json({
      message:            'College registered successfully. Awaiting verification.',
      token,
      user: {
        id:       user._id,
        email:    user.email,
        userType: user.userType,
      },
      profile: {
        collegeId:          college._id,
        collegeName:        college.collegeName,
        verificationStatus: college.verification.status,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    console.error('registerCollege error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// LOGIN
// Works for all 4 roles — userType comes from the User document
// Body: email, password
// ─────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // 1. Find user — must explicitly select password (select: false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    // 3. Compare password using instance method on User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // 5. Generate token with userType in payload
    const token = generateToken(user._id, user.userType);

    // 6. Fetch role-specific profile for the response
    let profile = null;
    if (user.userType === 'student') {
      profile = await require('../models/Student').findOne({ userId: user._id })
        .select('personalInfo.fullName personalInfo.gender profileCompleted');
    } else if (user.userType === 'college') {
      profile = await College.findOne({ userId: user._id })
        .select('collegeName verification.status');
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id:       user._id,
        email:    user.email,
        userType: user.userType,
      },
      profile,
    });

  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// LOGOUT
// Protected route — clears ALL refresh tokens from User document
// The access token itself expires naturally (stateless JWT)
// ─────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    // req.user is set by protect() middleware
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokens: [] },
    });

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('logout error:', error);
    res.status(500).json({ message: error.message });
  }
};