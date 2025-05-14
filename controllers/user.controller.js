import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import path from "path"
// import { AsyncLocalStorage } from "async_hooks";

export const register = async (req, res) => {

    try {
        const { fullname, email, password, phoneNumber, role } = req.body;

        const file = req.file;

        let uploadResult;
        if (file) {
            const fileUri = getDataUri(file);
            uploadResult = await cloudinary.uploader.upload(fileUri.content);
        }



        if (!fullname || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({
                message: "Please fill in all fields",
                success: false
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "Email already exists",
                success: false
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            password: hashPassword,
            phoneNumber,
            role,
            profile: {
                profilePhoto: uploadResult.secure_url
            }
        })

        return res.status(201).json({
            message: "User created successfully",
            success: true
        })

    } catch (err) {
        console.log(err);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Please fill in all fields",
                success: false
            });
        }


        let user = await User.findOne({ email });
        // console.log(user);

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false
            });
        }

        // check role is correct is not 
        if (role != user.role) {
            return res.status(400).json({
                message: "Invalid role",
                success: false
            });
        }

        const tokenData = {
            userId: user._id
        }

        // set the cookie for 1 day
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });
        // localStorage.setItem('token', token);
        

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profile: user.profile
        }

        return res.status(200).cookie("token", token,
            { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true
            })

    } catch (err) {
        console.log(err);
    }
}

export const logout = async (req, res) => {
    try {
        // Clear the token cookie
        res.cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: "strict" });

        // Send a single response
        return res.status(200).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (err) {
        console.log(err);
    }
};


 
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        // cloudinary ayega idhar
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray
      
        // resume comes later here...
        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}