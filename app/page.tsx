// Portalin ana sayfasi. Bolum kartlari burada listelenir.
import Link from "next/link";

export default function AnaSayfa() {
  return (
    <div className="anaSayfa">
      <h1>Ne yapmak istersin?</h1>
      <div className="bolumKartlari">
        <Link href="/boyama/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🎨</span>
          <span className="bolumAd">Boyama</span>
        </Link>
        <Link href="/ogren/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🔤</span>
          <span className="bolumAd">Harfler ve Sayılar</span>
        </Link>
        <Link href="/oyunlar/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🎮</span>
          <span className="bolumAd">Oyunlar</span>
        </Link>
        <Link href="/kodla/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🧩</span>
          <span className="bolumAd">Kodlama</span>
        </Link>
      </div>
    </div>
  );
}
