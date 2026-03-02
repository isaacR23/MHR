import { z } from "zod";


// Note: key is stored as "freelancer:<EOA_ADDRESS>" in the redis database
export const Ifreelance_schema = z.object({
    id: z.string(),
    address: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    bio: z.string(),
    skills: z.array(z.string()),
    hourlyRate: z.string(),
    settlementFrequency: z.string(),
    registeredAt: z.string(),
    contractsIds: z.array(z.string()),
    gigsIds: z.array(z.string()),
})

