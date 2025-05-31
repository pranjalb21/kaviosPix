import jwt from "jsonwebtoken"
export const verifyJwt = (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        let token = req.cookies.authToken;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                error: "Access denied. Authentication token missing.",
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedValue) => {
            if (err) {
                return res
                    .status(403)
                    .json({ error: "Token Expired/Invalid." });
            }
            req.user = decodedValue;
            next();
        });
    } catch (error) {
        console.error(`Error verifying JWT: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
