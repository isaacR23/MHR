import { z } from "zod";

export const Ipayment_schema = z.object({
    id: z.string(),
    amount: z.number(),
    status: z.enum(["pending", "completed", "failed"]),
    createdAt: z.string(),
    updatedAt: z.string(),
})