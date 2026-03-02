import HireFreelancer from "@/components/pages/HireFreelancer";

type Props = { params: Promise<{ address: string }> };

export default async function HireFreelancerPage({ params }: Props) {
  const { address } = await params;
  return <HireFreelancer address={address} />;
}
