import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
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

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal if a user exists
            return res.status(200).json({ 
                success: true, 
                message: "If an account with that email exists, a reset link has been sent." 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/reset-password/${resetToken}`;

        // Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.mailtrap.io",
            port: process.env.SMTP_PORT || 2525,
            auth: {
                user: process.env.SMTP_USER || "test_user",
                pass: process.env.SMTP_PASS || "test_pass"
            }
        });

        const mailOptions = {
            from: '"Shree Maruti Traders" <no-reply@marutitraders.com>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>You requested a password reset for your Shree Maruti Traders account.</p>
                    <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Shree Maruti Traders - Industrial Automation & Control Solutions</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: "If an account with that email exists, a reset link has been sent." 
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Error sending reset email" });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: "Token and password are required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        // Set new password
        const hashPassword = await bcrypt.hash(password, 12);
        user.password = hashPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful! You can now login." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Error resetting password" });
    }
};


