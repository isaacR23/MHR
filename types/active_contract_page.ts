import { z } from "zod";
export const IchatMessage_schema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    sender: z.string(),
    receiver: z.string(),
    status: z.string(),
    type: z.string(),
});

export const Inote_schema = z.object({
    id: z.string(),
    text: z.string(),
    timestamp: z.string(),
})

export const Icontract_schema = z.object({
    id: z.string(),
    title: z.string(),
    payee_acceptance: z.boolean(),
    payer_acceptance: z.boolean(),
    description: z.string(),
    createdAt: z.string(),
    status: z.enum(["discovery", "in_progress", "completed", "disputed", "cancelled"]),
    deadline: z.string(),
    notes: z.array(Inote_schema),
    contractSpecs: z.array(z.object({
        network: z.string(),
        escrowAddress: z.string()
    })),
    contractDeliverables: z.array(z.object({
        name: z.string(),
        description: z.string(),
        uploadId: z.string(),
        status: z.enum(["pending", "approved", "rejected"]),
    })),
})


