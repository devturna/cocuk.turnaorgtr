// Portalin ana sayfasi. Bolum kartlari burada listelenir.
export default function AnaSayfa() {
  return (
    <div className="anaSayfa">
      <h1>Ne yapmak istersin?</h1>
      <div className="bolumKartlari">
        <a href="/boyama/" className="bolumKarti">
          <span className="bolumIkon" aria-hidden="true">🎨</span>
          <span className="bolumAd">Boyama</span>
        </a>
        <div className="bolumKarti pasif">
          <span className="bolumIkon" aria-hidden="true">🎮</span>
          <span className="bolumAd">Oyunlar</span>
          <span className="yakinda">Yakında</span>
        </div>
        <div className="bolumKarti pasif">
          <span className="bolumIkon" aria-hidden="true">🧩</span>
          <span className="bolumAd">Kodlama</span>
          <span className="yakinda">Yakında</span>
        </div>
      </div>
    </div>
  );
}
