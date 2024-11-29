import { Router } from "express";
import { UpdateMetaDataSchema } from "../../types";
import client from '@repo/db/client';

export const userRouter = Router();

userRouter.post("/metadata", async (req, res) => {
    const parseData = UpdateMetaDataSchema.safeParse(req.body)
    if(parseData.error){
        res.status(400).json({ message: "Validation failed" })
        return;
    }
    try {
        const resp = await client.user.update({
            where:{
                id: req.userId
            },
            data: {
                avatarId : parseData.data.avatarId
            }
        })

        res.json({ message: "Metadata updated"})
    } catch (error) {
        res.status(400).json({ message: "Validation failed" })
    }
})

userRouter.get("/metadata/bulk", async (req , res) => {
    const userIdsString = (req.query.ids ?? "[]") as string
    const userIds = userIdsString.slice(1, userIdsString.length - 2).split(",")
    if(userIds.length == 0){
        res.status(400).json({ message: "user ids is empty"})
        return
    }

    try {

        const users = await client.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select:{
                avatar: true,
                id: true
            }
        })

        res.json({avatars: users.map(user => {
            imageUrl: user.avatar?.imageUrl
            userId: user.id
        })})
        
    } catch (error) {
        res.status(400).json({ message: "Users not found"})
        return
    }
})