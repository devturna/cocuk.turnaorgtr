"use client";

// Golge oyunu: ustte bir nesne, altta dort golge. Cocuk nesnenin golgesini
// bulur.
//
// Golge ayri bir gorsel degil: AYNI simge, karartilmis haliyle cizilir
// (kodla.css'teki degil, oyunlar.css'teki .golgeSekli filtresi). Bu sayede
// golge ile nesne birbirinden asla sapamaz.
//
// Kaybetme yok: yanlis golge sallanip yerinde kalir, sure ve puan yoktur.
import { useEffect, useState } from "react";
import Link from "next/link";
import { golgeTurSayisi, golgeTuruUret } from "@/lib/oyunlar/golge";
import "./oyunlar.css";

/** oyunlar.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Durum = { sira: number; yanlis: string | null; bitti: boolean };

export default function GolgeOyunu() {
  const [durum, setDurum] = useState<Durum>({ sira: 0, yanlis: null, bitti: false });
  const tur = golgeTuruUret(durum.sira);

  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  useEffect(() => {
    if (durum.yanlis === null) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, yanlis: null })),
      SALLANMA_SURESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [durum.yanlis]);

  function golgeSecildi(golge: string) {
    if (durum.bitti) return;
    if (golge !== tur.hedef) {
      setDurum((onceki) => ({ ...onceki, yanlis: golge }));
      return;
    }
    setDurum((onceki) => ({ ...onceki, bitti: true, yanlis: null }));
  }

  function sonrakiTur() {
    setDurum((onceki) => ({
      sira: (onceki.sira + 1) % golgeTurSayisi(),
      yanlis: null,
      bitti: false,
    }));
  }

  return (
    <div className="golgeOyunu">
      <div className="oyunBaslik">
        <Link href="/oyunlar/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Gölge</h1>
      </div>

      <div className="golgeHedefi" role="img" aria-label="Bunun gölgesini bul">
        <span aria-hidden="true">{tur.hedef}</span>
      </div>

      <div className="golgeSecenekleri" role="group" aria-label="Gölgeler">
        {tur.golgeler.map((golge) => (
          <button
            key={golge}
            type="button"
            className={`golgeSecenegi${durum.yanlis === golge ? " yanlis" : ""}`}
            aria-label={golge === tur.hedef ? "Doğru gölge" : "Gölge"}
            onClick={() => golgeSecildi(golge)}
          >
            <span className="golgeSekli" aria-hidden="true">
              {golge}
            </span>
          </button>
        ))}
      </div>

      <div className="oyunAltBar">
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
          Sonraki
        </button>
      </div>

      {durum.bitti && (
        <div className="kutlama" role="status" onPointerDown={sonrakiTur}>
          <div className="kutlamaIcerik" onPointerDown={(olay) => olay.stopPropagation()}>
            <p>Buldun!</p>
            <span className="kutlamaYildiz" aria-hidden="true">{tur.hedef}</span>
            <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
