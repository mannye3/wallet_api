import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetSuccessEmail } from "../utils/emailService.js";
import Transaction from "../models/transactionModel.js";


export const register = async (req, res) => {
  const { firstname, lastname, identification,identificationNumber, address, phone, email, password } = req.body;
 try {
    if(!firstname || !lastname ||  !email || !password) {
       return res.status(400).json({ message: "All fields are required" }); 
    }
    const userExists = await User.findOne({ email });
    if(userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
     const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({ 
      firstname,
      lastname,
      email, 
      identification,
      identificationNumber,
      address, 
      phone,
      password: hashedPassword, 
      verificationToken, 
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      // verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // JWT token
    generateTokenAndSetCookie(res, user._id)
    res.send({
      message: "User created successfully. Please check your email for verification.",
      user: null,
      success:true

    })
   // res.status(201).json({ message: "User created successfully. Please check your email for verification.", user: { ...user._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }

};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification code or expired code" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify email", error: error.message });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // if (!user.isVerified) {
        //     return res.status(403).json({ message: "Please verify your email first" });
        // }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate the token and set it as a cookie
        const token = generateTokenAndSetCookie(res, user); // Get the token for logging

        // Log the generated token to see its contents
        console.log("Generated Token:", token);

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Send a success response (optional user info without password)
        res.send({
          message: "Login successful",
          user: null, // Send null for user info (optional)
          success: true,
          token: token, // Send the token for logging
        })
        // res.status(200).json({
        //     message: "Login successful",
        //     user: { ...user._doc, password: undefined }, // Send user info without password
        // });
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const logout = async (req, res) => {
 res.clearCookie("token")
 res.status(200).json({ message: "Logged out successfully" });
};


export const forgotPassword = async (req, res) => {
      const { email } = req.body;
   
      try {
         const user = await User.findOne({email});
    if (!user) {
       return res.status(404).json({ message: "User not found" });
     
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 hour
    await user.save();


    await sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ message: "Reset password email sent successfully" });

      } catch (error) {
         console.log("Error in Password Reset", error);
    res.status(400).json({ success: false, message: error.message });
      }
};



export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token expired or invalid" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in Resetting Password:", error);
    res.status(500).json({ success: false, message: "An error occurred while resetting the password" });
  }
};



// Controller to check user authentication
export const checkAuth = async (req, res) => {
  try {
    // Fetch the user based on the userId from the token
    const user = await User.findById(req.body.userId).select("-password");
    console.log(user)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

     //const transactions = await Transaction.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] })
    

    res.status(200).json({
      success: true,
      user,
      //data: transactions,
      token: req.token,
    });
  } catch (error) {
    console.error("Error in CheckAuth:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const checkAuth2 = async (req, res) => {
  try {
    // Fetch the user based on the userId from the token
    const user = await User.findById(req.body.userId).select("-password");
    //console.log(user)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

     const transactions = await Transaction.find({ $or: [{sender: req.body.userId}, {receiver: req.body.userId}] })
    

    res.status(200).json({
      success: true,
      user,
      data: transactions,
      token: req.token,
    });
  } catch (error) {
    console.error("Error in CheckAuth:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const adminCheck = async(req, res) => {
  res.json({message: "Welcome to Admin"})
}







