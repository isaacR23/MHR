import { z } from "zod";

export const ProposalStatus = z.enum(["pending", "accepted", "rejected"]);
export type ProposalStatusType = z.infer<typeof ProposalStatus>;

export const ProposalSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  gigId: z.string(),
  customerId: z.string(),
  freelancerId: z.string(),
  description: z.string(),
  price: z.number(),
  deadline: z.string(),
  status: ProposalStatus,
  createdAt: z.string(),
});

export type Proposal = z.infer<typeof ProposalSchema>;

export const CreateProposalBodySchema = z.object({
  threadId: z.string(),
  gigId: z.string(),
  customerId: z.string(),
  freelancerId: z.string(),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
});

export type CreateProposalBody = z.infer<typeof CreateProposalBodySchema>;
