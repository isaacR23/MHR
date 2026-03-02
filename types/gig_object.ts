import { z } from "zod";


// Note: key is stored as "gig:<EOA_ADDRESS>:<GIG_ID>" in the redis database
export const Igig_schema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    deadline: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
    createdAt: z.string(),
    updatedAt: z.string(),
    freelancerId: z.string()
})