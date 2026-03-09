import InstitutionProfile from "../models/InstitutionProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  //we crreate a universal signup for all of these

  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Make sure all the rewuired fields are specified" });
    }
    //eail check garera edi user paila xa ki xaina hereko

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: " User already exists" });
    }
    // password lai 12 salting le hash greko
    const hashedPassword = await bcrypt.hash(password, 12);
    //euta universal user banaune aaba role specify garera
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // abaa esma student ko role sahit xuttaune if role= student vanera kasaile halyo vane
    //============================Student Profile Signup
    if (user.role == "student") {
      //yo data user bata signup garda liyum
      const { personal_info, address, guardian_info } = req.body;

      //aaba lets create studentprofie for that user huss

      await StudentProfile.create({
        // hamle || "" esari use garema kina vana ta
        //ma vanxu ni kina huss
        //" defau;t valu eempty rakheko ko k "
        //kina vane user le birseera value rakherna vanera error nafalos undefined vanera falos vanera ho huss
        //aani nested vako vanera hamel dob: personal_info?.dob rakheko huss
        user: user._id,
        personal_info: {
          dob: personal_info?.dob || "",
          gender: personal_info?.gender || "",
          phone: personal_info?.phone || "",
        },
        address: {
          province: address?.province || "",
          district: address?.district || "",
          municipality: address?.municipality || "",
          ward: address?.ward || "",
          street: address?.street || "",
        },

        guardian_info: {
          name: guardian_info?.name || "",
          relation: guardian_info?.relation || "",
          phone_number: guardian_info?.phone_number || "",
          occupation: guardian_info?.occupation || "",
        },
      });
    }

    //==================================Insatitutiion Signup heram huss ===========================

    if (role == "institution") {
      //chahine value jati request bataa aako body bata linxam hamile
      const {
        institutionName,
        institutionType,
        establishedYear,
        location,
        website,
        description,
        contactPerson,
      } = req.body;

      //aba Institution banaune huss

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
    }

    return res.status(201).json({
      message: "Signup successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ messsage: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //user xa ki xaina match xaina vane invalid credentila vanne
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //password check garney user ko paaword ra hale hash gareko password change gareny
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invlaid credentials" });
    }

    let profile = null;
    //user ko role anushar find gareny
    //harek ko studemt profile ko remaining data like dob, guardian_info is held by profile
    //profile chai temporary variable ho
    // ani user:user._id herera hamle tya tyo user xa ki xaina hernu parxa
    if (user.role === "student") {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    if (user.role === "institution") {
      profile = await InstitutionProfile.findOne({ user: user._id });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" },
    );

    //esle chai frontend lai message, create gareko jwt token pathayo ani
    // // user ko role ani profile( user ko credential bahek remaining data pathat)
    res.json({
      message: "Login successful",
      token,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Server error" });
  }
};
