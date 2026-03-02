import GigDetail from "@/components/pages/GigDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GigDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <GigDetail gigId={id} />;
}
