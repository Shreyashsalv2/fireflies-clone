import MeetingDetailView from "@/components/meetings/MeetingDetailView";

// Next 16: params and searchParams are async (Promises) — await them.
export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  return (
    <MeetingDetailView id={Number(id)} initialSeek={t ? Number(t) : undefined} />
  );
}
