import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
 
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }


        req.id = decode.userId; // Attach user ID to request object for future use
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        console.log(err);
        
    }
};

export default isAuthenticated;
