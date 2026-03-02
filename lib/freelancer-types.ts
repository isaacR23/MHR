/** Service offering — a discrete package of work a freelancer sells. */
export type Gig = {
  id: string;
  title: string;
  description: string;
  price: string;
  deliveryTime: string;
  tags: string[];
};

/** Freelancer profile stored in Redis. */
export type FreelancerProfile = {
  address: string;
  firstName: string;
  lastName: string;
  bio: string;
  skills: string[];
  gigs: Gig[];
  hourlyRate: string;
  settlementFrequency: string;
  registeredAt: string;
};

function generateGigId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `gig-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyGig(): Gig {
  return {
    id: generateGigId(),
    title: "",
    description: "",
    price: "",
    deliveryTime: "",
    tags: [],
  };
}

export function ensureGigId(gig: Gig): Gig {
  return gig.id ? gig : { ...gig, id: generateGigId() };
}
