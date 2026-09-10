"use client";

// Bul oyunu: ustte bir rakam, altta uc nesne grubu. Cocuk rakam kadar
// nesnenin oldugu grubu bulur.
//
// Say oyununun TERSI yonde calisir (orada say, sonra rakami soyle; burada
// rakami gor, o kadar nesneyi bul) ve ayni bilgiyi iki yonden yoklar.
//
// Yanlis secim cezalandirilmaz: grup hafifce sallanip yerinde kalir.
import { useEffect, useState } from "react";
import Link from "next/link";
import { bulTurSayisi, bulTuruUret } from "@/lib/ogren/bul";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, yildizEkle } from "@/lib/ogren/yildiz";
import "./ogren.css";

/** ogren.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Durum = {
  sira: number;
  yanlis: number | null;
  bitti: boolean;
};

function sayiAdi(rakam: number): string {
  return SAYILAR.find((sayi) => sayi.rakam === rakam)?.ad ?? String(rakam);
}

export default function BulOyunu() {
  const [durum, setDurum] = useState<Durum>({ sira: 0, yanlis: null, bitti: false });
  const tur = bulTuruUret(durum.sira);

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

  function secildi(miktar: number) {
    if (durum.bitti) return;
    if (miktar !== tur.hedef) {
      setDurum((onceki) => ({ ...onceki, yanlis: miktar }));
      return;
    }
    yildizEkle(ogeAnahtari("sayi", String(tur.hedef)), "bul");
    setDurum((onceki) => ({ ...onceki, bitti: true, yanlis: null }));
  }

  function sonrakiTur() {
    setDurum((onceki) => ({
      sira: (onceki.sira + 1) % bulTurSayisi(),
      yanlis: null,
      bitti: false,
    }));
  }

  return (
    <div className="bulOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Bul</h1>
      </div>

      {/* Hedef: rakamin kendisi. Yazi yok, ad yalnizca erisilebilirlik
          icin veriliyor. */}
      <div className="bulHedefi" role="note" aria-label={`${sayiAdi(tur.hedef)} tane bul`}>
        <span aria-hidden="true">{tur.hedef}</span>
      </div>

      <div className="bulSecenekleri" role="group" aria-label="Seçenekler">
        {tur.secenekler.map((secenek) => (
          <button
            key={secenek.miktar}
            type="button"
            className={`bulSecenegi${durum.yanlis === secenek.miktar ? " yanlis" : ""}`}
            aria-label={`${sayiAdi(secenek.miktar)} tane`}
            onClick={() => secildi(secenek.miktar)}
          >
            {Array.from({ length: secenek.miktar }, (_, sira) => (
              <span key={sira} aria-hidden="true">
                {secenek.simge}
              </span>
            ))}
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
            <p>{sayiAdi(tur.hedef)}!</p>
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
