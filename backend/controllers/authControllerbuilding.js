import InstitutionProfile from "../models/InstitutionProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Province from "../models/Province.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Make sure all the required fields are specified" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    console.log("✅ User created:");
    console.log(user);

    // Student signup
    if (user.role === "student") {
      const { personal_info, address, guardian_info } = req.body;

      await StudentProfile.create({
        user: user._id,
        personal_info: {
          dob:    personal_info?.dob    || "",
          gender: personal_info?.gender || "",
          phone:  personal_info?.phone  || "",
        },
        address: {
          province:     address?.province     || "",
          district:     address?.district     || "",
          municipality: address?.municipality || "",
          ward:         address?.ward         || "",
          street:       address?.street       || "",
        },
        guardian_info: {
          name:         guardian_info?.name         || "",
          relation:     guardian_info?.relation      || "",
          phone_number: guardian_info?.phone_number  || "",
          occupation:   guardian_info?.occupation    || "",
        },
      });
    }

    // ── Institution signup 
    if (role === "institution") {
      const {
        institutionName,
        institutionType,
        establishedYear,
        location,
        website,
        description,
        contactPerson,
      } = req.body;

      let provinceRefInfo = {};
      if (location?.province) {
        const prov = await Province.findOne({ provinceName: location.province });
        if (prov) {
          provinceRefInfo = {
            provinceId: prov._id,
            provinceName: prov.provinceName
          };
        }
      }

      await InstitutionProfile.create({
        user: user._id,
        institutionName,
        institutionType,
        establishedYear,
        website,
        location: {
          province:     location?.province     || "",
          district:     location?.district     || "",
          municipality: location?.municipality || "",
          ward:         location?.ward         || "",
          street:       location?.street       || "",
          provinceRef:  provinceRefInfo
        },
        description:   description || "",
        contactPerson: {
          name:        contactPerson?.name        || "",
          phone:       contactPerson?.phone       || "",
          email:       contactPerson?.email       || "",
          designation: contactPerson?.designation || "",
        },
        isApproved: false,                    
        verification: { status: "pending" },
      });
    }

    return res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +authProvider");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If user signed up via Google, they might not have a password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: "Please sign in with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user1 = await User.findOne({ email });
    let profile = null;
    if (user.role === "student") {
      profile = await StudentProfile.findOne({ user: user._id });
    }
    if (user.role === "institution") {
      profile = await InstitutionProfile.findOne({ user: user._id });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, role: user.role, profile });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Server error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Google token is required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    let user = await User.findOne({ email });
    let profile = null;

    if (!user) {
      // Create new student user
      user = await User.create({
        name,
        email,
        role: "student",
        authProvider: "google",
        googleId,
        isVerified: true,
      });

      console.log("Creating StudentProfile...");
      // Create empty student profile
      profile = await StudentProfile.create({
        user: user._id,
        address: {
          province: "Not Specified",
          district: "Not Specified",
          municipality: "Not Specified",
        },
        guardian_info: {
          name: "Not Specified",
          relation: "Not Specified",
          phone_number: "0000000000",
        }
      });
      console.log("✅ StudentProfile created:");
      console.log(profile);
    } else {
      // Existing user
      if (user.role === "student") {
        profile = await StudentProfile.findOne({ user: user._id });
      } else if (user.role === "institution") {
        profile = await InstitutionProfile.findOne({ user: user._id });
      }
      
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } 
    );

    res.json({ message: "Google login successful", token: jwtToken, role: user.role, profile });
  } catch (error) {
  console.error("========== GOOGLE LOGIN ERROR ==========");
  console.error(error);
  console.error("Message:", error.message);

  return res.status(500).json({
    message: error.message,
  });
}
};