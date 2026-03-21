import express from 'express';
import {authMiddleware, login, logout, registerUser} from '../../controllers/auth/auth-controller.js';

const router = express.Router();

// For Registeration of new user 
router.post("/register",registerUser);

// For Login User
router.post("/login",login);

// GET route for testing (optional - remove in production)
router.get("/login", (req, res) => {
  res.json({
    message: "Login endpoint - Use POST method with email and password in request body",
    example: {
      email: "user@example.com",
      password: "yourpassword"
    }
  });
});

// Logout 
router.post("/logout",authMiddleware,logout);

// MiddleWare 
router.get("/check-auth",authMiddleware,(req,res)=>{
    const user = req.user;


    res.status(200).json({
        success : true,
        message : "User Authenticated",
        user  
    });
    
}
);

export default router;