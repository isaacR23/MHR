import ChatThread from "@/components/pages/ChatThread";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function ChatThreadPage({ params }: PageProps) {
  const { threadId } = await params;
  return <ChatThread threadId={threadId} />;
}
