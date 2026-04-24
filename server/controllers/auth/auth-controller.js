import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../../models/User.js";
import UserActivity from "../../models/UserActivity.js";


// Secret Key
const secretKey = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

// Register
export const registerUser = async (req, res) => {
    console.log("Registration attempt for:", req.body?.email);
    try {
        const { userName, email, password } = req.body;

        // Robust check for missing or non-string fields
        if (!userName || typeof userName !== 'string' || 
            !email || typeof email !== 'string' || 
            !password || typeof password !== 'string') {
            return res.status(406).json({ success: false, message: "All fields are mandatory and must be valid text" });
        }

        const trimmedUserName = userName.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (trimmedUserName.length === 0 || trimmedEmail.length === 0 || trimmedPassword.length === 0) {
            return res.status(406).json({ success: false, message: "Fields cannot be empty" });
        }

        const checkUser = await User.findOne({ email: trimmedEmail });
        if (checkUser) {
            return res.status(403).json({
                success: false,
                message: "User Already Exist"
            });
        }

        const hashPassword = await bcrypt.hash(trimmedPassword, 12);
        const newUser = new User({
            userName: trimmedUserName,
            email: trimmedEmail,
            password: hashPassword
        });

        await newUser.save();
        console.log("User registered successfully:", trimmedEmail);
        
        return res.status(200).json({
            success: true,
            message: "Registration Successful"
        });

    } catch (error) {
        console.error("CRITICAL Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during registration",
            error: error.message
        });
    }
}

// Login
export const login = async (req, res) => {
    console.log("Login attempt started for body:", JSON.stringify(req.body));
    try {
        const { email, password } = req.body;

        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            console.log("Login failed: Missing or invalid fields");
            return res.status(406).json({ success: false, message: "Email and password are required" });
        }

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (trimmedEmail.length === 0 || trimmedPassword.length === 0) {
            console.log("Login failed: Empty fields after trim");
            return res.status(406).json({ success: false, message: "Fields cannot be empty" });
        }

        console.log("Finding user with email:", trimmedEmail);
        let checkUser;
        try {
            checkUser = await User.findOne({ email: trimmedEmail });
        } catch (dbError) {
            console.error("Database error during User.findOne:", dbError);
            throw new Error("Database error during user lookup");
        }

        if (!checkUser) {
            console.log("Login failed: User not found");
            return res.status(404).json({ success: false, message: "User Not Found, Please Register" });
        }

        console.log("Comparing passwords for user:", checkUser._id);
        let checkPassword;
        try {
            checkPassword = await bcrypt.compare(trimmedPassword, checkUser.password);
        } catch (bcryptError) {
            console.error("Bcrypt error during compare:", bcryptError);
            throw new Error("Error verifying password");
        }

        if (!checkPassword) {
            console.log("Login failed: Invalid password");
            return res.status(403).json({ success: false, message: "Invalid Password or Email" });
        }

        console.log("Generating JWT token...");
        let token;
        try {
            token = jwt.sign({
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName
            }, secretKey, { expiresIn: "60m" });
        } catch (jwtError) {
            console.error("JWT signing error:", jwtError);
            throw new Error("Error generating security token");
        }

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000 // 1 hour
        };

        // Log the login activity
        console.log("Logging activity...");
        try {
            const activity = new UserActivity({
                userId: checkUser._id,
                activityType: 'login',
                ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress),
                userAgent: req.headers['user-agent']
            });
            await activity.save();
            console.log("Activity logged successfully");
        } catch (activityError) {
            console.error('Error logging login activity:', activityError);
        }

        console.log("Setting cookie and sending response...");
        res.cookie("token", token, cookieOptions).status(200).json({
            success: true,
            message: "Login Successfully",
            user: {
                userName: checkUser.userName,
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id
            }
        });
        console.log("Login response sent successfully");

    } catch (error) {
        console.error("CRITICAL Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
            stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
        });
    }
}

// Logout
export const logout = async (req, res) => {
    try {
        console.log("Logout attempt...");
        // Log the logout activity if user is authenticated
        if (req.user && (req.user.id || req.user._id)) {
            const userId = req.user.id || req.user._id;
            try {
                const activity = new UserActivity({
                    userId: userId,
                    activityType: 'logout',
                    ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress),
                    userAgent: req.headers['user-agent']
                });
                await activity.save();
                console.log("Logout activity logged for user:", userId);
            } catch (activityError) {
                console.error('Error logging logout activity:', activityError);
            }
        }

        return res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }).status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });

    } catch (error) {
        console.error("CRITICAL Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during logout",
            error: error.message
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


