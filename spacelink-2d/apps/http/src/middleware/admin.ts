import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config"

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1]
    if(!token){
        res.status(403).json({ message: "Unauthorized" })
        return;
    }

    try {
        const decode = jwt.verify(token, JWT_SECRET) as { userId: string, role: "admin" | "user"}
        if(decode.role != 'admin'){
            res.status(403).json({ message: "Unauthorized" })
            return;
        }
        req.userId = decode.userId;
        req.role = decode.role;
        next();
    } catch (error) {
        res.status(403).json({ message: "Unauthorized" })
        return;
    }
}