import { upsertStreamUser } from "../db/stream.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken"

export async function signup(req, res){
    const {email, password, fullName} =req.body

    try{
        if(!email || !password || !fullName){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 8){
            return res.status(400).json({message: "Password must be at least 8 characters long"})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Invalid email format"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email is already registered"});
        }

        const idx = Math.floor(Math.random() * 100)+1;// 1 to 100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar,
        });


        try{
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.fullName}`)
        }catch(error){
            console.log("Error creating Stream user:", error);
        }
        

        const token = jwt.sign({UserId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==="production"
        })

        res.status(201).json({success:true,user:newUser})

    }
    catch(error){
        console.log("Error in the signup controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }
};

export async function login(req, res){
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const isPasswordValid = await user.matchPassword(password);

        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid email or password"})
        }

        const token = jwt.sign({UserId: user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "7d"
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV==="production"
        })

        res.status(200).json({success: true, user});

    }
    catch(error){
        console.log("Error in the Login controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};  

export function logout(req, res){
    res.clearCookie("jwt");
    res.status(200).json({message: "Logged out successfully"});
}

export async function onboard(req, res){
    try{
        const userId = req.user._id;
        const {fullName, nativeLanguage, profilePic, bio, learningLanguages, location} = req.body;

        if(!fullName || !nativeLanguage || !learningLanguages || learningLanguages.length===0){
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    (!learningLanguages || learningLanguages.length===0) && "learningLanguages",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updateUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,

        }, {new: true});

        if(!updateUser){
            return res.status(404).json({message: "User not found"});
        }

        try{
            await upsertStreamUser({
                id: updateUser._id.toString(),
                name: updateUser.fullName,
                image: updateUser.profilePic || "",
            })

            console.log(`Stream user updated after onboarding for ${updateUser.fullName}`);
        }
        catch(streamError){
            console.log("Error updating Stream user during onboarding:", streamError.message);
        }
        

        res.status(200).json({success: true, user: updateUser});
    }
    catch(error){
        console.log("Error in onboarding",error);
        res.status(500).json({message: "Internal Server Error"});
    }
}
