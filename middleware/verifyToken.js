import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   

    // Attach userId to the request object
    req.body.userId = decoded.userId;
   // req.userId = decoded.userId; // Make sure this line is executed

    
    next();
  } catch (error) {
    console.error("Error while verifying token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

