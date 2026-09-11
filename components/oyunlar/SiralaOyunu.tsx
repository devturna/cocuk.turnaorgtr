"use client";

// Sirala oyunu: uc nesne, kucukten buyuge dizilecek.
//
// Cocuk en kucuge dokunur, sonra ortancaya, sonra en buyuge. Dogru sirada
// dokunulan nesne yerini alir; yanlis sirada dokunulan yalnizca sallanir.
//
// Kaybetme yok, sure yok, kayit yok (docs/tasarim/oyunlar.md §2).
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  secimGecerliMi,
  siraDogruMu,
  siralaTurSayisi,
  siralaTuruUret,
} from "@/lib/oyunlar/sirala";
import "./oyunlar.css";

/** oyunlar.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Durum = {
  sira: number;
  /** Dogru sirada secilmis boylar. */
  secilenler: number[];
  /** Yanlis sirada dokunulan boy; sallanma bitince temizlenir. */
  yanlis: number | null;
};

function yeniDurum(sira: number): Durum {
  return { sira, secilenler: [], yanlis: null };
}

const BOY_ADLARI: Record<number, string> = { 1: "En küçük", 2: "Ortanca", 3: "En büyük" };

export default function SiralaOyunu() {
  const [durum, setDurum] = useState(() => yeniDurum(0));
  const ogeler = siralaTuruUret(durum.sira);
  const bitti = siraDogruMu(durum.secilenler);

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

  function ogeyeDokunuldu(boy: number) {
    if (bitti || durum.secilenler.includes(boy)) return;
    if (!secimGecerliMi(durum.secilenler, boy)) {
      setDurum((onceki) => ({ ...onceki, yanlis: boy }));
      return;
    }
    setDurum((onceki) => ({ ...onceki, secilenler: [...onceki.secilenler, boy], yanlis: null }));
  }

  function sonrakiTur() {
    setDurum((onceki) => yeniDurum((onceki.sira + 1) % siralaTurSayisi()));
  }

  function bastanBasla() {
    setDurum((onceki) => yeniDurum(onceki.sira));
  }

  return (
    <div className="siralaOyunu">
      <div className="oyunBaslik">
        <Link href="/oyunlar/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Sırala</h1>
      </div>

      {/* Istek okunmaz, GORULUR: kucukten buyuge giden uc nokta. */}
      <div className="siralaIstegi" role="note" aria-label="Küçükten büyüğe sırala">
        <span className="siralaIstekNoktasi kucuk" aria-hidden="true" />
        <span className="siralaIstekNoktasi orta" aria-hidden="true" />
        <span className="siralaIstekNoktasi buyuk" aria-hidden="true" />
      </div>

      <div className="siralaAlani" role="group" aria-label="Nesneler">
        {ogeler.map((oge) => {
          const sirasi = durum.secilenler.indexOf(oge.boy) + 1;
          return (
            <button
              key={oge.boy}
              type="button"
              className={
                `siralaOgesi boy-${oge.boy}` +
                `${sirasi > 0 ? " secildi" : ""}` +
                `${durum.yanlis === oge.boy ? " yanlis" : ""}`
              }
              aria-label={sirasi > 0 ? `${BOY_ADLARI[oge.boy]}: ${sirasi}.` : BOY_ADLARI[oge.boy]}
              onClick={() => ogeyeDokunuldu(oge.boy)}
            >
              <span aria-hidden="true">{oge.simge}</span>
              {sirasi > 0 ? (
                <span className="siralaIsareti" aria-hidden="true">
                  {sirasi}
                </span>
              ) : null}
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
            <p>Sıraladın!</p>
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
