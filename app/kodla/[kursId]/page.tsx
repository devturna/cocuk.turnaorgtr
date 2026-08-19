// Bir kursun bolum haritasi. Turkiye silueti derleme aninda diskten okunur,
// boylece calisma aninda hicbir ag istegi yapilmaz.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { kursBul, yayindakiKurslar } from "@/lib/kodla/kurslar";
import { kursBolumleri } from "@/lib/kodla/bolumler";
import GocHaritasi from "@/components/kodla/labirent/GocHaritasi";

export function generateStaticParams() {
  return yayindakiKurslar().map((kurs) => ({ kursId: kurs.id }));
}

// Katalogda olmayan bir adres icin sayfa uretilmez.
export const dynamicParams = false;

export default async function KursSayfasi({
  params,
}: {
  params: Promise<{ kursId: string }>;
}) {
  const { kursId } = await params;
  const kurs = kursBul(kursId);
  if (!kurs || kurs.durum !== "yayinda") notFound();

  const haritaSvg = readFileSync(join(process.cwd(), "public", "kodla", "turkiye.svg"), "utf8");

  return (
    <GocHaritasi
      kursId={kurs.id}
      kursAdi={kurs.ad}
      bolumler={kursBolumleri(kurs.id)}
      haritaSvg={haritaSvg}
    />
  );
}
