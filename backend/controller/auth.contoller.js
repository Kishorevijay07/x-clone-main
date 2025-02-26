import User from "../model/auth.model.js";
import bcrypt from "bcryptjs";
import generatetoken from '../utils/generatetoken.js'

export const signup = async (req, res) => {
    try {
        // Destructure incoming data
        const { username, fullname, email, password } = req.body;
        console.log(username)
        console.log(fullname)
        console.log(email)
        console.log(password)
        // Validate request body
        if (!username || !fullname || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check for existing email or username
        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        if (existingEmail || existingUsername) {
            return res.status(400).json({ error: "Email or username already exists" });
        }

        // Password length validation
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword,
        });
        generatetoken(newUser._id,res)
        await newUser.save();

        // Respond with user data (excluding sensitive information)
        res.status(200).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileimg: newUser.profileimg,
                coverimg: newUser.coverimg,
                bio: newUser.bio,
                link: newUser.link,
            },
        });
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login =async(req, res) => {
    try{
        const {username,password}=req.body;

        const user = await User.findOne({username})
        const ispasscorrect =await bcrypt.compare(password,user?.password || "");
    
        if(!user || !ispasscorrect){
            return res.status(404).json({error:"the username ans pass is incorrect"})
        }
        generatetoken(user._id,res)
        res.status(200).json(
            {
            message: "Login Succesfully",
            user: {
                username: user.username,
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileimg: user.profileimg,
                coverimg: user.coverimg,
                bio: user.bio,
                link: user.link,
                }
            });
        }
        catch(error)
        {
            console.log("The error occurs")
            res.status(500).json({error:"The Fucking error occurs"})
        }
};

export const logout = (req, res) => {
    try {

        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({"message":"Logout successfully"});
    } catch (error) {
        console.log("The error occurs")
        res.status(500).json({error:"The Fucking error occurs"})
    }
};

export const getme = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.user._id}).select('-password')
        res.status(200).json(user);
    } catch (error) {
        console.log(`Error ${error}`)
        res.status(500).json({error : "The error occured"})
    }
}
