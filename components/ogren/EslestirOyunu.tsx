"use client";

// Eslestir oyunu: solda rakamlar, sagda nokta gruplari.
//
// Say ve Bul tek bir sayiyi yoklar; burada dort sayi yan yana durur ve
// cocuk aralarindaki farki gormek zorunda kalir.
//
// Once soldan bir rakam, sonra sagdan bir grup secilir. Dogruysa ikisi de
// sabitlenir; yanlissa yalnizca sallanip yerinde kalir -- ceza yok, sure
// yok (docs/tasarim/harfler-ve-sayilar.md §5).
import { useEffect, useState } from "react";
import Link from "next/link";
import { eslestirTurSayisi, eslestirTuruUret } from "@/lib/ogren/eslestir";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, yildizEkle } from "@/lib/ogren/yildiz";
import "./ogren.css";

/** ogren.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Durum = {
  sira: number;
  /** Secili rakam (sol taraf); hicbiri secili degilse null. */
  secili: number | null;
  /** Eslesmis sayilar: iki taraf da sabitlenir. */
  eslesenler: number[];
  /** Yanlis secilen grup; sallanma bitince temizlenir. */
  yanlis: number | null;
};

function yeniDurum(sira: number): Durum {
  return { sira, secili: null, eslesenler: [], yanlis: null };
}

function sayiAdi(rakam: number): string {
  return SAYILAR.find((sayi) => sayi.rakam === rakam)?.ad ?? String(rakam);
}

export default function EslestirOyunu() {
  const [durum, setDurum] = useState(() => yeniDurum(0));
  const tur = eslestirTuruUret(durum.sira);
  const bitti = durum.eslesenler.length === tur.sol.length;

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

  function rakamSecildi(rakam: number) {
    if (durum.eslesenler.includes(rakam)) return;
    setDurum((onceki) => ({ ...onceki, secili: rakam }));
  }

  function grupSecildi(miktar: number) {
    if (durum.eslesenler.includes(miktar)) return;
    // Once rakam secilmeli: kural "sunu suna baglıyorum" seklinde okunur.
    if (durum.secili === null) return;
    if (durum.secili !== miktar) {
      setDurum((onceki) => ({ ...onceki, yanlis: miktar }));
      return;
    }
    yildizEkle(ogeAnahtari("sayi", String(miktar)), "eslestir");
    setDurum((onceki) => ({
      ...onceki,
      eslesenler: [...onceki.eslesenler, miktar],
      secili: null,
      yanlis: null,
    }));
  }

  function sonrakiTur() {
    setDurum((onceki) => yeniDurum((onceki.sira + 1) % eslestirTurSayisi()));
  }

  return (
    <div className="eslestirOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Eşleştir</h1>
      </div>

      <div className="eslestirAlani">
        <div className="eslestirSutunu" role="group" aria-label="Rakamlar">
          {tur.sol.map((rakam) => (
            <button
              key={rakam}
              type="button"
              className={
                `eslestirRakami${durum.secili === rakam ? " secili" : ""}` +
                `${durum.eslesenler.includes(rakam) ? " eslesti" : ""}`
              }
              aria-label={sayiAdi(rakam)}
              onClick={() => rakamSecildi(rakam)}
            >
              <span aria-hidden="true">{rakam}</span>
            </button>
          ))}
        </div>

        <div className="eslestirSutunu" role="group" aria-label="Noktalar">
          {tur.sag.map((miktar) => (
            <button
              key={miktar}
              type="button"
              className={
                `eslestirGrubu${durum.yanlis === miktar ? " yanlis" : ""}` +
                `${durum.eslesenler.includes(miktar) ? " eslesti" : ""}`
              }
              aria-label={`${sayiAdi(miktar)} nokta`}
              onClick={() => grupSecildi(miktar)}
            >
              {Array.from({ length: miktar }, (_, sira) => (
                <span key={sira} className="eslestirNoktasi" aria-hidden="true" />
              ))}
            </button>
          ))}
        </div>
      </div>

      <div className="oyunAltBar">
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
          Sonraki
        </button>
      </div>

      {bitti && (
        <div className="kutlama" role="status" onPointerDown={sonrakiTur}>
          <div className="kutlamaIcerik" onPointerDown={(olay) => olay.stopPropagation()}>
            <p>Hepsi eşleşti!</p>
            <span className="kutlamaYildiz" aria-hidden="true">⭐</span>
            <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
