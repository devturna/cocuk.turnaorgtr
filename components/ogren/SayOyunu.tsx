"use client";

// Say oyunu: cocuk nesnelere teker teker dokunarak sayar.
//
// Parmakla saymak okul oncesinde kullanilan GERCEK yontemdir; ekranda
// sayilan nesnenin isaretlenmesi de o parmagin izidir. Sayac, dokunulan
// her nesnede buyur -- rakam boylece "sayarken gorulen sey" olur.
//
// Yanlis cevap cezalandirilmaz: secenek hafifce sallanip geri doner, sure
// yoktur, puan yoktur (docs/tasarim/harfler-ve-sayilar.md §5).
import { useEffect, useState } from "react";
import Link from "next/link";
import { turSayisi, turUret } from "@/lib/ogren/say";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, yildizEkle } from "@/lib/ogren/yildiz";
import "./ogren.css";

/** Yanlis secenegin sallanma suresi; ogren.css'teki animasyonla ayni. */
const SALLANMA_SURESI = 500;

type Durum = {
  sira: number;
  /** Sayilan nesnelerin sirasi; dokunma sirasina gore buyur. */
  sayilanlar: number[];
  /** Yanlis secilen rakam; sallanma bitince temizlenir. */
  yanlis: number | null;
  bitti: boolean;
};

function yeniDurum(sira: number): Durum {
  return { sira, sayilanlar: [], yanlis: null, bitti: false };
}

function sayiAdi(rakam: number): string {
  return SAYILAR.find((sayi) => sayi.rakam === rakam)?.ad ?? String(rakam);
}

export default function SayOyunu() {
  const [durum, setDurum] = useState(() => yeniDurum(0));
  const tur = turUret(durum.sira);
  const hepsiSayildi = durum.sayilanlar.length === tur.miktar;

  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Yanlis secenek sallanip kendiliginden geri doner: cocuga "yanlis"
  // denmez, secenek yalnizca yerinde kalir.
  useEffect(() => {
    if (durum.yanlis === null) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, yanlis: null })),
      SALLANMA_SURESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [durum.yanlis]);

  function nesneyeDokunuldu(sira: number) {
    setDurum((onceki) => {
      if (onceki.bitti || onceki.sayilanlar.includes(sira)) return onceki;
      return { ...onceki, sayilanlar: [...onceki.sayilanlar, sira] };
    });
  }

  function secenekSecildi(secenek: number) {
    if (durum.bitti) return;
    if (secenek !== tur.miktar) {
      setDurum((onceki) => ({ ...onceki, yanlis: secenek }));
      return;
    }
    yildizEkle(ogeAnahtari("sayi", String(tur.miktar)), "say");
    setDurum((onceki) => ({ ...onceki, bitti: true, yanlis: null }));
  }

  function bastanBasla() {
    setDurum((onceki) => yeniDurum(onceki.sira));
  }

  function sonrakiTur() {
    setDurum((onceki) => yeniDurum((onceki.sira + 1) % turSayisi()));
  }

  return (
    <div className="sayOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        {/* Sayac sorunun cevabini VERMEZ: yalnizca su ana kadar kacinin
            sayildigini gosterir. Hepsi sayilinca da orada durur, cunku
            cocuk sayiyi kendisi soyleyecek. */}
        <h1 aria-live="polite">
          {durum.sayilanlar.length > 0 ? durum.sayilanlar.length : "Say"}
        </h1>
      </div>

      <div className="sayAlani">
        {tur.yerlesimler.map((yerlesim, sira) => {
          const sayildiMi = durum.sayilanlar.includes(sira);
          const kacinci = durum.sayilanlar.indexOf(sira) + 1;
          return (
            <button
              key={sira}
              type="button"
              className={`sayNesnesi${sayildiMi ? " sayildi" : ""}`}
              style={{ left: `${yerlesim.x}%`, top: `${yerlesim.y}%` }}
              aria-label={sayildiMi ? `${kacinci}. sayıldı` : "Say"}
              onClick={() => nesneyeDokunuldu(sira)}
            >
              <span aria-hidden="true">{tur.simge}</span>
              {sayildiMi ? (
                <span className="sayIsareti" aria-hidden="true">
                  {kacinci}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Soru ancak HEPSI sayilinca cikar: once say, sonra soyle. */}
      {hepsiSayildi && !durum.bitti ? (
        <div className="saySorusu">
          <p className="sayySoruYazi">Kaç tane?</p>
          <div className="saySecenekleri" role="group" aria-label="Kaç tane?">
            {tur.secenekler.map((secenek) => (
              <button
                key={secenek}
                type="button"
                className={`sayDugmesi${durum.yanlis === secenek ? " yanlis" : ""}`}
                aria-label={sayiAdi(secenek)}
                onClick={() => secenekSecildi(secenek)}
              >
                {secenek}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="oyunAltBar">
          <button type="button" className="oyunDugmesi" onClick={bastanBasla}>
            Baştan
          </button>
          <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiTur}>
            Sonraki
          </button>
        </div>
      )}

      {durum.bitti && (
        <div className="kutlama" role="status" onPointerDown={sonrakiTur}>
          <div className="kutlamaIcerik" onPointerDown={(olay) => olay.stopPropagation()}>
            <p>{sayiAdi(tur.miktar)}!</p>
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
