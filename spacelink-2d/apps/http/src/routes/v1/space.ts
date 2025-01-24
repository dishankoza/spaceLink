import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { addEelementSchema, CreateSpaceSchema, deleteElementSchma } from "../../types";
import client from "@repo/db/client";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req , res) => {
    const parseData = CreateSpaceSchema.safeParse(req.body);
    if(parseData.error) {
        res.status(400).json("Validation failed")
        return;
    }
    try{
        if(!parseData.data.mapId){
            const space = await client.space.create({
                data: {
                    name: parseData.data.name,
                    width: parseData.data.dimensions.split("x")[1],
                    height: parseData.data.dimensions.split("x")[0],
                    creatorId: req.userId!
                }
            })
            res.json({spaceId: space.id})
        }else{
            const map = await client.map.findUnique({
                where: {
                    id: parseData.data.mapId
                },
                select: {
                    mapElements: true
                }
            })
            if(!map){
                res.status(400).json({message: "Map not found"})
                return
            }
                await client.$transaction(async () => {
                    const space = await client.space.create({
                        data: {
                            name: parseData.data.name,
                            width: parseData.data.dimensions.split("x")[0],
                            height: parseData.data.dimensions.split("x")[1],
                            creatorId: req.userId!,
                        }
                    })
                    await client.spaceElements.createMany({
                        data: map.mapElements.map(e => ({
                            elementId: e.elementId,
                            spaceId: space.id,
                            x: e.x,
                            y: e.y,
                        }))
                    })
                    res.json({spaceId: space.id})
                })
        }
    }catch (error) {
        res.status(400).json({message: "please try again!"})
    }
})

spaceRouter.delete("/:spaceId", userMiddleware, async (req , res) => {
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId
            }, select: {
                creatorId: true
            }
        })

        if(!space){
            res.status(400).json({message: "Space not found"})
            return
        }

        if(space?.creatorId != req.userId){
            res.status(403).json({message: "Unauthorized to delete the space"})
            return
        }
        const deletedSpace = await client.space.delete({
            where: {
                id: req.params.spaceId
            }
        })
        res.json({ message: `space with id ${deletedSpace.id} deleted` })
    } catch (error) {
        res.status(400).json({message: "unable to perform the operation"})
    }
})

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId
        }
    }) 
    res.json({
        spaces: spaces.map(s => ({
          id: s.id,
          name: s.name,
          height: s.height,
          width: s.width 
        }))
    })
})


spaceRouter.post("/element", userMiddleware, async (req , res) => {
    const parseData = addEelementSchema.safeParse(req);
    if(parseData.error){
        res.status(400).json({message: "unable to parse the body"})
        return;
    }

    try {
     
        const space = await client.space.findUnique({
            where: {
                id: parseData.data?.spaceId,
                creatorId: req.userId
            }
        })
    
        if(!space){
            res.status(400).json({message: "Unauthorized to access the space"})
            return;
        }
    
        await client.spaceElements.create({
            data: {
                elementId: parseData.data.elementId,
                spaceId: parseData.data.spaceId,
                x: parseData.data.x,
                y: parseData.data.y
            }
        })

        res.json({message: "Added element to the space"})
    } catch (error) {
        res.status(400).json({message: "unable to add the element"})
    }    
})

spaceRouter.delete("/element", userMiddleware, async (req , res) => {
    const parseData = deleteElementSchma.safeParse(req);
    if(parseData.error){
        res.status(400).json({message: "unable to parse the body"})
    }

    const element = await client.spaceElements.delete({
        where: {
            id: parseData.data?.id,
            space:{
                creatorId: req.userId
            } 
        }
    })
    if(!element){
        res.status(403).json({message: "Unathorize to delete the element"})
        return;
    }
    res.json({message: "Succesffully deleted the element"})
})

spaceRouter.get("/:spaceId", userMiddleware, async (req , res) => {
    try {
        const space = await client.space.findUnique({
            where: {
                id: req.params.spaceId,
            },
            include: {
                spaceElements: {
                    include: {
                        element: true
                    }
                }
            }
        })

        if(!space){
            res.json({message: "Space not found"})
            return
        }

        res.json({
            dimension: `${space.width}x${space.height}`,
            elements: space.spaceElements.map(e => ({
                id: e.id,
                element: {
                    id: e.element.id,
                    imageUrL: e.element.imageUrl,
                    height: e.element.height,
                    width: e.element.width,
                    static: e.element.static
                },
                x: e.x,
                y: e.y,

            }))
        })
    } catch (error) {
        res.status(400).json({message: "unable to retrieve the space"})
    }
})