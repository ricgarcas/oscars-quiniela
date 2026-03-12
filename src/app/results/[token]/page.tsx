import LiveResultsPage from "@/components/LiveResultsPage";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <LiveResultsPage token={token} />;
}
