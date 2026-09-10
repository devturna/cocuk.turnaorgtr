// Oyunlar bolumunun giris sayfasi.
import Link from "next/link";
import "@/components/oyunlar/oyunlar.css";

export const metadata = { title: "Oyunlar - Turna Çocuk" };

export default function OyunlarSayfasi() {
  return (
    <div className="oyunlarGirisi">
      <h1>Hangi oyun?</h1>
      <div className="bolumKartlari">
        <Link href="/oyunlar/hafiza/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🃏</span>
          <span className="bolumAd">Hafıza</span>
        </Link>
        <Link href="/oyunlar/golge/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🌗</span>
          <span className="bolumAd">Gölge</span>
        </Link>
      </div>
    </div>
  );
}
