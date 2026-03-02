"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Proposal } from "@/types/proposal";

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
});

type FormValues = z.infer<typeof formSchema>;

type ProposalFormProps = {
  threadId: string;
  gigId: string;
  customerId: string;
  freelancerId: string;
  onSuccess: (proposal: Proposal) => void;
  onCancel?: () => void;
};

export default function ProposalForm({
  threadId,
  gigId,
  customerId,
  freelancerId,
  onSuccess,
  onCancel,
}: ProposalFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      price: 0,
      deadline: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          gigId,
          customerId,
          freelancerId,
          description: values.description,
          price: values.price,
          deadline: values.deadline,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create proposal");
      }
      const { proposal } = (await res.json()) as { proposal: Proposal };
      form.reset();
      onSuccess(proposal);
    } catch (err) {
      console.error("[ProposalForm] submit:", err);
      form.setError("root", {
        message: err instanceof Error ? err.message : "Failed to send proposal",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the work and terms..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (USD)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={0.01} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send proposal"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
