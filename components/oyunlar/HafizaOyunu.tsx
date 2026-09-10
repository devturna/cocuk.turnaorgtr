"use client";

// Hafiza oyunu: kartlar ters durur, cocuk ikisini acar.
//
// Kaybetme yoktur: sure, can, puan yok. Tur ancak butun ciftler bulununca
// biter ve bir sonraki tur iki kart daha ile acilir
// (docs/tasarim/oyunlar.md §3).
import { useEffect, useState } from "react";
import Link from "next/link";
import { desteUret, eslesiyorMu, turBittiMi } from "@/lib/oyunlar/hafiza";
import "./oyunlar.css";

/**
 * Yanlis cift bu sure sonunda kapanir.
 *
 * Kisa ama SABIT: daha kisasi karti gormeye vakit birakmaz, daha uzunu
 * cocugu bekletir. CSS'te bir karsiligi yok, yalnizca bu zamanlayici.
 */
const KAPANMA_SURESI = 900;

type Durum = {
  sira: number;
  /** Su an acik olan kartlarin siralari; en fazla iki. */
  acikOlanlar: number[];
  /** Eslesip acik kalan kartlar. */
  bulunanlar: number[];
};

function yeniDurum(sira: number): Durum {
  return { sira, acikOlanlar: [], bulunanlar: [] };
}

export default function HafizaOyunu() {
  const [durum, setDurum] = useState(() => yeniDurum(0));
  const deste = desteUret(durum.sira);
  const bitti = turBittiMi(deste, durum.bulunanlar);
  const bekleniyor = durum.acikOlanlar.length === 2;

  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Iki kart acikken karar veriliyor: eslesiyorlarsa acik kalir,
  // eslesmiyorlarsa kisa bir bekleyisten sonra kapanir.
  useEffect(() => {
    if (durum.acikOlanlar.length !== 2) return;
    const [ilk, ikinci] = durum.acikOlanlar;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({
        ...onceki,
        acikOlanlar: [],
        bulunanlar: eslesiyorMu(deste, ilk, ikinci)
          ? [...onceki.bulunanlar, ilk, ikinci]
          : onceki.bulunanlar,
      }));
    }, KAPANMA_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.acikOlanlar, deste]);

  function kartaDokunuldu(sira: number) {
    if (bekleniyor || bitti) return;
    if (durum.bulunanlar.includes(sira) || durum.acikOlanlar.includes(sira)) return;
    setDurum((onceki) => ({ ...onceki, acikOlanlar: [...onceki.acikOlanlar, sira] }));
  }

  function sonrakiTur() {
    setDurum((onceki) => yeniDurum(onceki.sira + 1));
  }

  function bastanBasla() {
    setDurum((onceki) => yeniDurum(onceki.sira));
  }

  return (
    <div className="hafizaOyunu">
      <div className="oyunBaslik">
        <Link href="/oyunlar/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Hafıza</h1>
      </div>

      <div className={`hafizaTahtasi kart-${deste.length}`}>
        {deste.map((kart) => {
          const bulundu = durum.bulunanlar.includes(kart.sira);
          const acik = bulundu || durum.acikOlanlar.includes(kart.sira);
          return (
            <button
              key={kart.sira}
              type="button"
              className={`hafizaKarti${acik ? " acik" : ""}${bulundu ? " bulundu" : ""}`}
              aria-label={acik ? `Açık kart: ${kart.simge}` : "Kapalı kart"}
              onClick={() => kartaDokunuldu(kart.sira)}
            >
              <span aria-hidden="true">{acik ? kart.simge : "❓"}</span>
            </button>
          );
        })}
      </div>

      <div className="oyunAltBar">
        <button type="button" className="oyunDugmesi" onClick={bastanBasla}>
          Baştan
        </button>
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
          Sonraki
        </button>
      </div>

      {bitti && (
        <div className="kutlama" role="status" onPointerDown={sonrakiTur}>
          <div className="kutlamaIcerik" onPointerDown={(olay) => olay.stopPropagation()}>
            <p>Hepsini buldun!</p>
            <span className="kutlamaYildiz" aria-hidden="true">🎉</span>
            <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
