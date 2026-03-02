import ContractActivation from "@/components/pages/ContractActivation";

type PageProps = {
  params: Promise<{ contractId: string }>;
};

export default async function ContractDetailPage({ params }: PageProps) {
  const { contractId } = await params;
  return <ContractActivation contractId={contractId} />;
}
