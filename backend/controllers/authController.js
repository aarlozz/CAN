// Login & signup logic

const User = require("../models/Instutional");
const bcrypt = require("bcryptjs");



// Signup controller
exports.signup = async (req,res) => {
    try{
        const{institutional_name,province,address,website,email,phone,password} = req.body;

        // 1. Check is user already exists
        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({message: "User already exists"});
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // 3.Create User
        const Institutional = await Instutional.create({
            institutional_name,
            province,
            address,
            website,
            email,
            phone,
            password: hashedPassword,
        });

        //4. Send response
        res.status(201).json({
            message: "Institutional created Successfully",
            institutionalId: Institutional._id
        });
    } catch (error){
        console.error("Signup error:", error);
        res.status(500).json({message: error.message});
    }
};


// Login controller (to be implemented)
const jwt = require("jsonwebtoken");
const Instutional = require("../models/Instutional");
require("dotenv").config();

exports.login = async( req,res) => {
    try{
        const{ email,password} = req.body;

        // Check if user exists
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: "Invalid Credentails"});
        }
        // Generate JWT
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
            
        );
        // Send response
        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });


    } catch (error){
        res.status(500).json({message: error.message});
    }
};