import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { createAvatarSchema, createElementSchema, createMapSchema, UpdateElementSchema } from "../../types";
import client from '@repo/db/client'

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
    const parseData = createElementSchema.safeParse(req.body);
    if(parseData.error){
        res.status(400).json({message: "invalid body"})
        return;
    }
    try {
        const elementId = await client.element.create({
            data: {
                imageUrl: parseData.data.imageUrl,
                width: parseData.data.width,
                height: parseData.data.height,
                static: parseData.data.static
            },
            select: {
                id: true
            }
        })

        res.json({id: elementId.id})
    } catch (error) {
        res.status(400).json("unable to perform the operation")
    }
})

adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
    const parseData = UpdateElementSchema.safeParse(req.body);
    if(parseData.error){
        res.status(400).json({message: "invalid body"})
        return
    }
    try {
        await client.element.update({
            where: {
                id: req.params.elementId
            },
            data: {
                imageUrl: parseData.data.imageUrl
            }
        })
        res.json({imageUrl: parseData.data.imageUrl})
    } catch (error) {
        res.status(400).json("unable to perform the update")
    }
        
})

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
    const parseData = createAvatarSchema.safeParse(req.body);
    if(parseData.error){
        res.status(400).json({message: "Invalid request body"})
        return;
    }
    try {
        
        const avatar = await client.avatar.create({
                data:{
                    imageUrl: parseData.data.imageUrl,
                    name: parseData.data.name
                }
            })
        
            res.json({avatarId: avatar.id})

    } catch (error) {
        res.status(400).json({message: "Please try again"})
    }
    })

adminRouter.post("/map", adminMiddleware, async (req, res) => {
    const parseData = createMapSchema.safeParse(req.body);
    if(parseData.error){
        res.status(400).json("Invalid body")
        return;
    }
    try {
        const map = await client.map.create({
            data:{
                name: parseData.data.name,
                width: parseData.data.dimensions.split("x")[0],
                height: parseData.data.dimensions.split("x")[1],
                thumbnail: parseData.data.thumbnail,
                mapElements: {
                    create: parseData.data.defaultElements.map(de => ({
                        elementId: de.elementId,
                        x: de.x,
                        y: de.y
                    }))
                }
            }
       })
       res.json({id: map.id})   
    } catch (error) {
        res.status(400).json({message: "something went wrong"})
    }
})