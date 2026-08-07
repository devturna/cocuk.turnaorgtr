// Bolum girisindeki tek bir oyun karti.
import Link from "next/link";

export default function OyunKarti({
  ad,
  aciklama,
  adres,
  ikon,
  ilerleme,
  yakinda,
}: {
  ad: string;
  aciklama: string;
  adres?: string;
  ikon: string;
  ilerleme?: string;
  yakinda?: boolean;
}) {
  const icerik = (
    <>
      <span className="oyunIkon" aria-hidden="true">{ikon}</span>
      <span className="oyunAd">{ad}</span>
      <span className="oyunAciklama">{aciklama}</span>
      {ilerleme && <span className="oyunIlerleme">{ilerleme}</span>}
      {yakinda && <span className="oyunYakinda">Yakında</span>}
    </>
  );

  if (yakinda || !adres) {
    return <div className="oyunKarti pasif">{icerik}</div>;
  }
  return (
    <Link href={adres} className="oyunKarti">
      {icerik}
    </Link>
  );
}
