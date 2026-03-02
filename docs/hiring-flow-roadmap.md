# Hiring Flow — Sequential Implementation Roadmap

This roadmap implements the full customer hiring flow from [hire_steps.txt](../hire_steps.txt): **Browse Gigs → Auth → Quote Request & Chat Unlock → Proposal Submission → Proposal Review → Contract Activation → Delivery & Fund Release**.

Each task includes **file reference(s)**, **description**, and **goal**. Tasks are sequential; later steps assume earlier ones are done. Where applicable, API routes may read from local JSON in the project for clean, predictable mock data during development.

---

## Phase 1: Browse Gigs (Public)

### Task 1.1 — Gig list API and mock data

| Field | Details |
|-------|--------|
| **Files** | `app/api/gigs/route.ts` (create), `app/api/gigs/gigs.json` (create) |
| **Description** | Create `GET /api/gigs` that returns a list of gigs. Populate `gigs.json` with sample gigs (id, title, description, price, deadline, status, freelancerId, etc.) aligned with `types/gig_object.ts` and `lib/freelancer-types.ts`. Optionally support query params (e.g. `?freelancerId=`) for filtering. |
| **Goal** | A single source of gig data for the app; frontend can list and link to gigs without a live backend. |

### Task 1.2 — Public gig listing page

| Field | Details |
|-------|--------|
| **Files** | `app/(public)/gigs/page.tsx` (create), `components/pages/GigList.tsx` (create), `lib/nav.ts` (modify) |
| **Description** | Add a public route `/gigs` (outside dashboard) that fetches from `GET /api/gigs` and renders a grid/list of gig cards (title, price, deadline, freelancer summary). Use shadcn/ui (Card, Button). Each card links to the gig detail page. Update nav if you want a “Browse Gigs” link. |
| **Goal** | Customers can browse all available gigs without logging in. |

### Task 1.3 — Public gig detail page

| Field | Details |
|-------|--------|
| **Files** | `app/(public)/gigs/[id]/page.tsx` (create), `components/pages/GigDetail.tsx` (create), `app/api/gigs/[id]/route.ts` (create) |
| **Description** | Create `GET /api/gigs/[id]` (or read from `gigs.json` by id). Build a public gig detail page at `/gigs/[id]` showing full description, price, deadline, and freelancer info (name, bio, skills). Add a clear CTA: “Request quote” or “Contact freelancer” that will later trigger auth + chat unlock. |
| **Goal** | Each gig has a public detail page for exploration; one primary action leads to the next step (auth + quote). |

---

## Phase 2: Authentication Gate

### Task 2.1 — Auth check and redirect on “Request quote”

| Field | Details |
|-------|--------|
| **Files** | `components/pages/GigDetail.tsx` (modify), `app/(public)/gigs/[id]/page.tsx` (modify), `components/providers/AuthProvider.tsx` (use only) |
| **Description** | On “Request quote” (or equivalent) click: if the user is not logged in (`useAuth().isLoggedIn`), redirect to `/auth?redirect=/gigs/[id]&action=request_quote` (or store intended action in query/state). If logged in, proceed to “request quote” logic (next phase). |
| **Goal** | Unauthenticated users are prompted to sign up or log in when they try to request a quote. |

### Task 2.2 — Post-login return to gig and action

| Field | Details |
|-------|--------|
| **Files** | `app/(auth)/auth/page.tsx` (modify), `components/pages/Auth.tsx` (modify) |
| **Description** | After successful login/signup, read `redirect` (and optionally `action`) from the URL. If `redirect` is present (e.g. `/gigs/123`), navigate to that path instead of `/`. Preserve `action=request_quote` so the gig page can auto-trigger “request quote” and unlock chat. |
| **Goal** | After auth, the user returns to the gig they clicked and can immediately continue to request a quote. |

---

## Phase 3: Quote Request & Chat Unlock

### Task 3.1 — Quote request API and persistence

| Field | Details |
|-------|--------|
| **Files** | `app/api/quote-request/route.ts` (create), `app/api/quote-request/quote-requests.json` (create, optional) or use Redis key pattern e.g. `quote_request:<gigId>:<customerAddress>` |
| **Description** | Implement `POST /api/quote-request` with body `{ gigId, customerAddress }`. Persist that this customer requested a quote for this gig (JSON file or Redis). Return a stable `chatThreadId` or `conversationId` that ties the gig + customer + freelancer to one chat. |
| **Goal** | One “quote requested” record per gig+customer; backend can decide if chat is “unlocked” for that pair. |

### Task 3.2 — Chat tied to gig and participants

| Field | Details |
|-------|--------|
| **Files** | `app/api/chat/route.ts` (modify), `lib/chat.ts` (modify) |
| **Description** | Extend chat to be keyed by `chatThreadId` (e.g. `gigId_customerAddress` or id returned from quote-request) instead of only a generic session id. Ensure GET/POST accept `threadId` and persist messages per thread. Optionally validate that the requester is the customer or the gig owner (freelancer) for that thread. |
| **Goal** | Each quote request has a dedicated chat thread; only that customer and that freelancer use it. |

### Task 3.3 — Chat page unlocked by quote request

| Field | Details |
|-------|--------|
| **Files** | `app/(dashboard)/chat/[threadId]/page.tsx` (create), `components/pages/ChatThread.tsx` (create) |
| **Description** | Add a route `/chat/[threadId]`. After “request quote” (and auth), create the quote request and get `threadId`, then redirect to `/chat/[threadId]`. Chat page loads messages via `GET /api/chat?threadId=...` and sends via POST with `threadId`. Show gig context (title, freelancer) in the chat header. If threadId is invalid or user not allowed, show 404 or “Request quote first”. |
| **Goal** | Requesting a quote unlocks a dedicated chat page for that gig; customer and freelancer communicate in one place. |

### Task 3.4 — Link from gig detail to chat after quote request

| Field | Details |
|-------|--------|
| **Files** | `components/pages/GigDetail.tsx` (modify), `app/(public)/gigs/[id]/page.tsx` (modify) |
| **Description** | If the current user has already requested a quote for this gig, show “Open conversation” (or “Go to chat”) that links to `/chat/[threadId]`. Use a small API or inline check: e.g. `GET /api/quote-request?gigId=...&customerAddress=...` returning `{ hasRequested, threadId }`. |
| **Goal** | Returning users can jump straight to the conversation from the gig page. |

---

## Phase 4: Proposal Submission

### Task 4.1 — Proposal data model and API

| Field | Details |
|-------|--------|
| **Files** | `types/proposal.ts` (create), `app/api/proposals/route.ts` (create), `app/api/proposals/proposals.json` (create, optional) or Redis |
| **Description** | Define a proposal type: description, price, deadline, status (e.g. pending, accepted, rejected), customerId, freelancerId, gigId, threadId, createdAt. Implement `POST /api/proposals` to create a proposal and optionally attach it to the chat thread. Implement `GET /api/proposals?threadId=...` to list proposals for a thread. |
| **Goal** | Proposals are first-class entities; they can be shown in the chat and reviewed by the freelancer. |

### Task 4.2 — Proposal form in chat UI

| Field | Details |
|-------|--------|
| **Files** | `components/pages/ChatThread.tsx` (modify), `components/ProposalForm.tsx` (create) |
| **Description** | In the chat page, add a “Send proposal” flow: form with description (textarea), price (input), deadline (date). On submit, call `POST /api/proposals` with threadId and gigId, then add a “proposal” message to the chat (or render proposals in a sidebar). Use shadcn Form, Input, Textarea, Calendar/date picker. |
| **Goal** | From the chat, the customer can send a proposal (description, price, deadline) to the freelancer. |

### Task 4.3 — Show proposals in chat

| Field | Details |
|-------|--------|
| **Files** | `components/pages/ChatThread.tsx` (modify), `app/api/chat/route.ts` (optional: support message type “proposal”) |
| **Description** | Fetch proposals for the thread and display them in the chat timeline (e.g. as special message bubbles or a sidebar). Each proposal shows description, price, deadline, status. New proposals appear after submission. |
| **Goal** | Both parties see proposals inline with the conversation. |

---

## Phase 5: Proposal Review (Freelancer)

### Task 5.1 — Accept/Reject proposal API

| Field | Details |
|-------|--------|
| **Files** | `app/api/proposals/[id]/route.ts` (create), `app/api/proposals/route.ts` (modify if needed) |
| **Description** | Implement `PATCH /api/proposals/[id]` with body `{ status: "accepted" | "rejected" }`. Only the freelancer (gig owner) can accept/reject. On accept, optionally create a contract record in “discovery” or “in_progress” status and return contractId for the next phase. |
| **Goal** | Freelancer can accept or reject proposals from the chat; acceptance transitions to contract setup. |

### Task 5.2 — Accept/Reject UI in chat

| Field | Details |
|-------|--------|
| **Files** | `components/pages/ChatThread.tsx` (modify), `components/ProposalCard.tsx` (create) |
| **Description** | For each proposal with status “pending”, show “Accept” and “Reject” buttons for the freelancer. On Accept, call PATCH to accept and show success; then show a CTA to “Activate contract” (next phase). On Reject, call PATCH and update UI. |
| **Goal** | Freelancer can view and respond to proposals directly within the chat. |

---

## Phase 6: Contract Activation (Escrow + Deposit)

### Task 6.1 — Contract record and link to proposal

| Field | Details |
|-------|--------|
| **Files** | `types/active_contract_page.ts` (use/extend), `app/api/contracts/route.ts` (create), `app/api/contracts/contracts.json` (create, optional) or Redis |
| **Description** | When a proposal is accepted, create a contract record (id, gigId, proposalId, payer, payee, amount, status, payee_acceptance, payer_acceptance, contractSpecs, etc.) using existing `Icontract_schema`. Implement `POST /api/contracts` (from accept proposal) and `GET /api/contracts?id=...` or `GET /api/contracts?threadId=...`. |
| **Goal** | Each accepted proposal has a contract; contract holds payer/payee/amount and later escrow address. |

### Task 6.2 — Deploy escrow on contract creation

| Field | Details |
|-------|--------|
| **Files** | `app/api/contracts/route.ts` (modify) or `app/api/contracts/activate/route.ts` (create), `app/api/deploy-escrow/route.ts` (use) |
| **Description** | When creating a contract from an accepted proposal (or when “Activate contract” is clicked), call the existing `POST /api/deploy-escrow` with payer, payee, amountWei. Store the returned `contractAddress` in the contract’s `contractSpecs` (e.g. `[{ network: "polygon", escrowAddress }]`). See [escrow-deployment.md](./escrow-deployment.md). |
| **Goal** | Accepting a proposal triggers escrow deployment; contract record holds the escrow address. |

### Task 6.3 — Customer deposit flow (fund escrow)

| Field | Details |
|-------|--------|
| **Files** | `app/(dashboard)/contract/[contractId]/page.tsx` (create), `components/pages/ContractActivation.tsx` (create), `app/(dashboard)/funding/page.tsx` (modify) or dedicated “Deposit to escrow” flow |
| **Description** | Add a contract-specific page (e.g. `/contract/[contractId]`) that shows contract details, escrow address, and amount to deposit. “Deposit” CTA should use existing Safe/execute flow or a dedicated “fund escrow” API that credits the escrow contract (e.g. via `execute-safe-tx` or direct deposit). Until deposit is confirmed, show “Pending deposit”. |
| **Goal** | Customer is required to deposit the agreed payment into the escrow after contract activation. |

### Task 6.4 — Contract list and status

| Field | Details |
|-------|--------|
| **Files** | `app/(dashboard)/contract/page.tsx` (modify), `components/pages/Contract.tsx` (modify), `app/api/contracts/route.ts` (extend: list by user) |
| **Description** | List the current user’s contracts (as payer or payee) via `GET /api/contracts?address=...`. On the existing contract page, show contract cards with status (e.g. awaiting deposit, in progress, delivery pending). Link each to `/contract/[contractId]` for deposit or delivery. |
| **Goal** | Users see their active contracts and can complete deposit or move to delivery. |

---

## Phase 7: Delivery & Fund Release

### Task 7.1 — Delivery submission (freelancer)

| Field | Details |
|-------|--------|
| **Files** | `app/api/contracts/[contractId]/delivery/route.ts` (create), `types/active_contract_page.ts` (use contractDeliverables) |
| **Description** | Freelancer marks work as delivered: e.g. `POST /api/contracts/[contractId]/delivery` with description and optional file refs (uploadId). Update contract’s `contractDeliverables` and/or a “deliverySubmitted” flag. |
| **Goal** | Freelancer can signal that work is delivered; contract enters “pending acceptance” state. |

### Task 7.2 — Dual confirmation (payer and payee accept)

| Field | Details |
|-------|--------|
| **Files** | `app/api/contracts/[contractId]/accept/route.ts` (create), `components/pages/Contract.tsx` or `ContractDelivery.tsx` (modify) |
| **Description** | Implement `POST /api/contracts/[contractId]/accept` with body `{ role: "payer" | "payee" }`. Update contract’s `payer_acceptance` and `payee_acceptance`. When **both** are true, allow triggering fund release (next task). |
| **Goal** | Both customer and freelancer must confirm acceptance of the delivery before funds can be released. |

### Task 7.3 — Release funds from escrow

| Field | Details |
|-------|--------|
| **Files** | `app/api/contracts/[contractId]/release/route.ts` (create), existing escrow/Safe integration (e.g. `execute-safe-tx` or escrow release method) |
| **Description** | When both acceptances are true, “Release funds” calls the escrow contract (or Safe) to release to the payee. Use stored `contractSpecs[].escrowAddress`. After successful tx, update contract status to “completed”. |
| **Goal** | Funds are released to the freelancer only after both parties confirm; flow matches hire_steps step 7. |

### Task 7.4 — Delivery and confirmation UI

| Field | Details |
|-------|--------|
| **Files** | `components/pages/Contract.tsx` (modify), `app/(dashboard)/contract/[contractId]/page.tsx` (modify) |
| **Description** | On the contract detail page: show delivery details and attached assets; show “Confirm delivery” for customer and “Confirm delivery” for freelancer (each sets their acceptance). When both accepted, show “Release funds” and call release API. Reuse/adapt existing delivery panel and “Confirm & Release Funds” button logic. |
| **Goal** | Full delivery and dual-confirm flow is visible and actionable in the UI. |

---

## Summary Table

| Phase | Step in hire_steps | Key deliverables |
|-------|--------------------|-------------------|
| 1 | Browse Gigs | `/api/gigs`, `/gigs`, `/gigs/[id]`, gig list + detail pages |
| 2 | Authentication | Auth gate on “Request quote”, redirect back after login |
| 3 | Quote Request & Chat Unlock | Quote request API, thread-scoped chat, `/chat/[threadId]` |
| 4 | Proposal Submission | Proposals API, proposal form in chat, proposals in timeline |
| 5 | Proposal Review | PATCH proposal accept/reject, Accept/Reject UI in chat |
| 6 | Contract Activation | Contract + escrow deploy, deposit flow, contract list |
| 7 | Delivery & Fund Release | Delivery API, dual accept API, release API, delivery + confirm UI |

---

## API & Mock Data Conventions

- **JSON under `/api`**: You may place `gigs.json`, `proposals.json`, `contracts.json` next to the relevant route (e.g. `app/api/gigs/gigs.json`) and read them in the route handler for development. Use `fs` in Node/Next API routes.
- **Redis**: Existing chat and freelancer APIs use Redis; quote-request, proposals, and contracts can use Redis with clear key patterns (e.g. `contract:<contractId>`) for persistence when available.
- **Ids**: Use `crypto.randomUUID()` or slug ids for gigs, threadIds, proposalIds, and contractIds so URLs and references stay stable.

This roadmap is sequential: complete Phase 1 before Phase 2, and so on. Later phases reference files and behaviors introduced in earlier ones.
