import { z } from "zod";

export const ContractStatus = z.enum([
  "discovery",
  "awaiting_deposit",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
]);
export type ContractStatusType = z.infer<typeof ContractStatus>;

export const ContractSpecSchema = z.object({
  network: z.string(),
  escrowAddress: z.string(),
});

export const ContractDeliverableSchema = z.object({
  name: z.string(),
  description: z.string(),
  uploadId: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export const ContractSchema = z.object({
  id: z.string(),
  gigId: z.string(),
  proposalId: z.string(),
  threadId: z.string(),
  payer: z.string(),
  payee: z.string(),
  amount: z.number(),
  status: ContractStatus,
  payer_acceptance: z.boolean(),
  payee_acceptance: z.boolean(),
  title: z.string().optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.array(z.object({ id: z.string(), text: z.string(), timestamp: z.string() })).optional(),
  contractSpecs: z.array(ContractSpecSchema),
  contractDeliverables: z.array(ContractDeliverableSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Contract = z.infer<typeof ContractSchema>;

export const CreateContractBodySchema = z.object({
  proposalId: z.string().min(1, "proposalId is required"),
});
export type CreateContractBody = z.infer<typeof CreateContractBodySchema>;
