import { NextRequest, NextResponse } from "next/server";
import { loadProposals, saveProposals } from "@/app/api/proposals/route";
import type { Proposal, ProposalStatusType } from "@/types/proposal";

const VALID_STATUSES: ProposalStatusType[] = ["accepted", "rejected"];

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Proposal id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body?.status as string | undefined;
    const freelancerAddress = (body?.freelancerAddress ?? "").trim();

    if (!status || !VALID_STATUSES.includes(status as ProposalStatusType)) {
      return NextResponse.json(
        { error: "Body must include status: 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    if (!freelancerAddress) {
      return NextResponse.json(
        { error: "freelancerAddress is required to accept or reject" },
        { status: 400 }
      );
    }

    const proposals = await loadProposals();
    const index = proposals.findIndex((p) => p.id === id.trim());
    if (index === -1) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposal = proposals[index];
    if (proposal.status !== "pending") {
      return NextResponse.json(
        { error: "Proposal is already accepted or rejected" },
        { status: 400 }
      );
    }

    const callerNorm = normalizeAddress(freelancerAddress);
    const proposalFreelancerNorm = normalizeAddress(proposal.freelancerId);
    if (callerNorm !== proposalFreelancerNorm) {
      return NextResponse.json(
        { error: "Only the gig owner (freelancer) can accept or reject this proposal" },
        { status: 403 }
      );
    }

    const updated: Proposal = {
      ...proposal,
      status: status as ProposalStatusType,
    };
    proposals[index] = updated;
    await saveProposals(proposals);

    return NextResponse.json({ proposal: updated });
  } catch (error) {
    console.error("[api/proposals/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}
