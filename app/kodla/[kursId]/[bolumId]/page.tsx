// Bolum ekrani sayfasi.
import { notFound } from "next/navigation";
import { yayindakiKurslar } from "@/lib/kodla/kurslar";
import { bolumBul, bolumSiralamasi, kursBolumleri } from "@/lib/kodla/bolumler";
import BolumEkrani from "@/components/kodla/labirent/BolumEkrani";

export function generateStaticParams() {
  return yayindakiKurslar().flatMap((kurs) =>
    kursBolumleri(kurs.id).map((bolum) => ({ kursId: kurs.id, bolumId: bolum.id })),
  );
}

// Katalogda olmayan bir adres icin sayfa uretilmez.
export const dynamicParams = false;

export default async function BolumSayfasi({
  params,
}: {
  params: Promise<{ kursId: string; bolumId: string }>;
}) {
  const { kursId, bolumId } = await params;
  const bolum = bolumBul(kursId, bolumId);
  if (!bolum) notFound();

  const sirali = bolumSiralamasi(kursId);
  const sonraki = sirali[sirali.indexOf(bolumId) + 1] ?? null;

  return <BolumEkrani kursId={kursId} bolum={bolum} sonrakiBolumId={sonraki} />;
}
