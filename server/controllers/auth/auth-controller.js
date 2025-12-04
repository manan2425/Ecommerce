import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import UserActivity from "../../models/UserActivity.js";


// Secret Key
const secretKey = "CLIENT_SECRET_KEY";

// Register
export const registerUser = async(req,res)=>{
    try{
        const {userName,email,password} = req.body;

        try{
            if(userName.trim().length===0 || email.trim().length===0 || password.trim().length===0 ){
                return res.status(406).json({success:false,message:"All Fields Are Mandatory"});
            }

            const checkUser = await User.findOne({email});
            if(checkUser){
                return res.status(403).json({success: false,
                    message : "User Already Exist"
                });
            }

            const hashPassword = await bcrypt.hash(password,12);
            console.log("hash password: " + hashPassword);
            const newUser = new User({
                userName,
                email,
                password : hashPassword
            });

            try{
                const response = await newUser.save();
                console.log("Response User Register  : ",JSON.stringify(response));
                res.status(200).json({
                    success: true,
                    message: "Registration Successfull"
                });

            }catch(error){
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: "Error In Submission"
                });
            }

        }catch(error){
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Some Error Occured"
            });
        }
    }catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some Error Occured"
        });
    }
}

// Login
export const login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(password.trim().length===0 || email.trim().length===0){
            return res.status(406).json({success:false,message:"All Fields Are Mandatory"});
        }
        try{
            const checkUser = await User.findOne({email});
            if(!checkUser){
                return res.status(404).json({success:false,message:"User Not Found, Please Register"});
            }
            try{
                const checkPassword = await bcrypt.compare(password,checkUser.password);
                if(!checkPassword){
                    return res.status(403).json({success:false,message:"Invalid Password or Email"});
                }
                const token = jwt.sign({
                    id : checkUser._id,role : checkUser.role,email : checkUser.email,
                    userName : checkUser.userName
                },secretKey,{expiresIn : "60m"});

                // Log the login activity
                try {
                    const activity = new UserActivity({
                        userId: checkUser._id,
                        activityType: 'login',
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent']
                    });
                    await activity.save();
                } catch (activityError) {
                    console.log('Error logging login activity:', activityError);
                    // Don't fail the login if activity logging fails
                }

                res.cookie("token", token,{httpOnly:true,secure:false}).status(200).json({
                    success : true,
                    message : "Login Successfully",
                    user : {
                        userName : checkUser.userName,
                        email : checkUser.email,
                        role : checkUser.role,
                        id : checkUser._id 
                    }
                });
            }catch(error){
                console.log(error);
                return res.status(500).json({
                    success: false,
                    message: "Some Error Occured"
                });
            }
        }catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Some Error Occured"
            });
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Some Error Occured"
        });
    }
}

// Logout
export const logout = async(req,res)=>{
    try{
        // Log the logout activity if user is authenticated
        if (req.user && req.user._id) {
            try {
                const activity = new UserActivity({
                    userId: req.user._id,
                    activityType: 'logout',
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.headers['user-agent']
                });
                await activity.save();
            } catch (activityError) {
                console.log('Error logging logout activity:', activityError);
                // Don't fail the logout if activity logging fails
            }
        }

        console.log("Here Error");
        res.clearCookie("token").json({
            success : true,
            message : "Logged Out Successfully"
        });
  
        
 

    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Some Error Occured"
        });

    }
}

// Auth Middle Ware
export const authMiddleware = async(req,res,next)=>{
    try{
        const token = req.cookies.token;
       
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Unauthorised User"
            })
        }
        try{
            const decode = jwt.verify(token,secretKey);
            req.user = decode;
            next();
    
        }catch(error){
            console.log(error.message);
            return res.status(401).json({
                success : false,
                message : "Unauthorised User"
            })
        }

    }catch(error)
    {
        console.log(error.message)
    }
}


