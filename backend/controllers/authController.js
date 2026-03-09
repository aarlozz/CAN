
import InstitutionProfile from "../models/InstitutionProfile.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const newInstitutionSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      institutionName,
      institutionType,
      establishedYear,
      location,
      website,
      description,
      contactPerson,
    } = req.body;

    //now we check if there is existing insititution by checking the email fo the institution in user

    const existingInstitution = await User.findOne({ email });
    if (existingInstitution) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    //suru ma role"institution" rakhera user baanyo

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "institution",
    });
    //tyo user lai reference le link gareko xa
    //esma user: user._id le aaba tya baneko user sanga connect garyo
    await InstitutionProfile.create({
  user: user._id,
  institutionName,
  institutionType,
  establishedYear,
  website,
  location: {
    province: location?.province || "",
    district: location?.district || "",
    municipality: location?.municipality || "",
    ward: location?.ward || "",
    street: location?.street || "",
  },
  description: description || "",
  contactPerson: {
    name: contactPerson?.name || "",
    phone: contactPerson?.phone || "",
    email: contactPerson?.email || "",
    designation: contactPerson?.designation || "",
  },

    });

   return  res
      .status(201)
      .json({ message: "Your institution has been registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "There has been a problem. " });
  }
};
// yo chai login ko lagi

export const institutionLogin = async (req, res) => {
  try {
    //user ko email password liyo suruma
    const { email, password } = req.body;
    //email ma existing user ma xaina vane invalid vanne
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Credentials. Please try again!" });
    }
    if (user.role !== "institution") {
      return res.status(400).json({ message: "Access Denied " });
    }

    //aba password match hunxa ki hunna herney if hunna vane invalid vanne
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //now we used JWT token to create token for each user after login and send it to frontend
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
