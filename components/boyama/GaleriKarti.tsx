// Galeride tek bir boyama sayfasinin onizleme karti.
import Link from "next/link";
import type { KatalogGirdisi } from "@/lib/boyama/katalog";

export default function GaleriKarti({
  resim,
  baslanmis,
}: {
  resim: KatalogGirdisi;
  baslanmis: boolean;
}) {
  return (
    <Link href={`/boyama/${resim.id}/`} className="galeriKarti">
      {/* Onizleme bos cizgi resmidir; cocugun cizimi burada gosterilmez. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/boyama/${resim.dosya}`} alt={resim.ad} className="galeriOnizleme" />
      <span className="galeriAd">{resim.ad}</span>
      {baslanmis && <span className="devamRozeti">Devam ediyor</span>}
    </Link>
  );
}
