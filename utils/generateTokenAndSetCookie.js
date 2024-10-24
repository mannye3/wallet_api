import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, user) => {
    // Create payload with user ID and role
    const payload = { userId: user._id, role: user.role };

    // Log the payload to verify its contents
    console.log("JWT Payload:", payload);

    // Generate a JWT token with the payload
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set the token in a cookie
    res.cookie("token", token, { 
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Helps protect against CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration set to 7 days
    });

    return token; // Optional, you can choose to omit this
};
