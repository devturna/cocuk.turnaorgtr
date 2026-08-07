// Boyama ekrani sayfasi. SVG dosyasi derleme aninda diskten okunur,
// boylece calisma aninda hicbir ag istegi yapilmaz.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { tumResimler, resmiBul } from "@/lib/boyama/katalog";
import BoyamaEkrani from "@/components/boyama/BoyamaEkrani";

export function generateStaticParams() {
  return tumResimler().map((resim) => ({ resimId: resim.id }));
}

// Katalogda olmayan bir adres icin sayfa uretilmez.
export const dynamicParams = false;

export default async function BoyamaSayfasi({
  params,
}: {
  params: Promise<{ resimId: string }>;
}) {
  const { resimId } = await params;
  const resim = resmiBul(resimId);
  if (!resim) notFound();

  const svgIcerigi = readFileSync(
    join(process.cwd(), "public", "boyama", resim.dosya),
    "utf8",
  );

  // Tuvalin olceklenebilmesi icin viewBox degeri gerekiyor.
  const viewBoxEslesme = svgIcerigi.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxEslesme ? viewBoxEslesme[1] : "0 0 400 400";

  return (
    <BoyamaEkrani
      resimId={resim.id}
      resimAdi={resim.ad}
      svgIcerigi={svgIcerigi}
      viewBox={viewBox}
    />
  );
}
