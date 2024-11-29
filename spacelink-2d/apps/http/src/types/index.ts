import z, { ParseStatus } from "zod";

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["admin", "user"]).default("user"),
})

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const UpdateMetaDataSchema = z.object({
    avatarId: z.string(),
})

export const CreateSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,5}x[0-9]{1,5}$/),
    mapId: z.string(),
})

export const addEelementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const createElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const createAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})

export const createMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,5}x[0-9]{1,5}$/),
    name: z.string(),
    defaultElement: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number(),
    })),
})

declare global {
    namespace Express {
        export interface Request {
            role?: "admin" | "user";
            userId?: string
        }
    }
}