import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSalonBySlug } from "@/lib/db/salons";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function SalonBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { slug } = await params;
  const { serviceId } = await searchParams;

  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  return (
    <Suspense fallback={null}>
      <BookingFlow slug={slug} initialServiceId={serviceId ? Number(serviceId) : undefined} />
    </Suspense>
  );
}
