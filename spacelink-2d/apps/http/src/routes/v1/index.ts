import { Router } from "express";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { userRouter } from "./user";
import { SigninSchema, SignupSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { compare, hash } from "../../scrypt";

export const router = Router();

router.post('/signup', async (req, res) => {
    const parsedata = SignupSchema.safeParse(req.body);
    if(!parsedata.data) {
        res.status(400).json({ message: "Validation failed" });
        console.error(parsedata.error)
        return;
    }
    try {

        const hashedPassword = await hash(parsedata.data.password);
        const user = await client.user.create({
            data: {
                username: parsedata.data.username,
                password: hashedPassword, 
                role: parsedata.data.type,
            }
        })

        res.json({
            userId: user.id
        });
    } catch (error) {
        res.status(400).json({ message: "user already exists" });
        console.error(error)
    }
})

router.post("/signin", async (req, res) => {
    const parseData = SigninSchema.safeParse(req.body);
    if(!parseData.data) {
        res.status(403).json({ message: "Validation failed" });
        console.error(parseData.error)
        return;
    }
    try {
        console.log('zawe', parseData)
        const user = await client.user.findUnique({
            where:{
                username: parseData.data.username
            }
        })
        if(!user) {
            res.status(403).json({ message: "Invalid username" });
            return;
        }
        const isPasswordCorrect = await compare(parseData.data.password, user.password);
        if(!isPasswordCorrect) {
            res.status(403).json({ message: "Invalid password" });
            return;
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_SECRET)

        res.json({
            token  
        })
    } catch (error) {
        const e: Error = error as any;
        console.error(e.message)
        res.status(403).json({ message: "Invalid password" });
    }
})

router.get("/avatars", (req, res) => {

})

router.get("/elements", (req, res) => {
    
})

router.use("/admin", adminRouter);
router.use("/space", spaceRouter)
router.use("/user", userRouter);