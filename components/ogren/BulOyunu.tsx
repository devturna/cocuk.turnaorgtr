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
import {
  bulHarfTurSayisi,
  bulHarfTuruUret,
  bulTurSayisi,
  bulTuruUret,
} from "@/lib/ogren/bul";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, yildizEkle } from "@/lib/ogren/yildiz";
import "./ogren.css";

/** ogren.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Takim = "harf" | "rakam";

type Durum = {
  takim: Takim;
  sira: number;
  /** Yanlis secilen secenegin anahtari; sallanma bitince temizlenir. */
  yanlis: string | null;
  bitti: boolean;
};

/** Ekranda gosterilecek tur, iki takim icin tek sekle indirgenmis hali. */
type Secenek = { anahtar: string; etiket: string; icerik: string[] };

function turSayisi(takim: Takim): number {
  return takim === "harf" ? bulHarfTurSayisi() : bulTurSayisi();
}

function sayiAdi(rakam: number): string {
  return SAYILAR.find((sayi) => sayi.rakam === rakam)?.ad ?? String(rakam);
}

export default function BulOyunu() {
  // Harfler once: bolumun adi da once harfleri soyluyor.
  const [durum, setDurum] = useState<Durum>({
    takim: "harf",
    sira: 0,
    yanlis: null,
    bitti: false,
  });

  // Iki takim iki ayri soru soruyor: rakamda "bu kadar nesne hangisi",
  // harfte "hangi kelime bu harfle basliyor". Ikincisi harfi bir SESE
  // bagliyor -- buyuk/kucuk eslestirmesini zaten Eslestir oyunu yapiyor.
  const harfTuru = durum.takim === "harf" ? bulHarfTuruUret(durum.sira) : null;
  const sayiTuru = durum.takim === "rakam" ? bulTuruUret(durum.sira) : null;

  const hedefYazisi = harfTuru !== null ? harfTuru.hedef : String(sayiTuru!.hedef);
  const hedefEtiketi =
    harfTuru !== null
      ? `${harfTuru.hedef} ile başlayan kelimeyi bul`
      : `${sayiAdi(sayiTuru!.hedef)} tane bul`;
  const dogruAnahtar = harfTuru !== null ? harfTuru.hedef : String(sayiTuru!.hedef);

  const secenekler: Secenek[] =
    harfTuru !== null
      ? harfTuru.secenekler.map((secenek) => ({
          anahtar: secenek.harf,
          etiket: secenek.kelime,
          icerik: [secenek.simge],
        }))
      : sayiTuru!.secenekler.map((secenek) => ({
          anahtar: String(secenek.miktar),
          etiket: `${sayiAdi(secenek.miktar)} tane`,
          icerik: Array.from({ length: secenek.miktar }, () => secenek.simge),
        }));

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

  function secildi(anahtar: string) {
    if (durum.bitti) return;
    if (anahtar !== dogruAnahtar) {
      setDurum((onceki) => ({ ...onceki, yanlis: anahtar }));
      return;
    }
    yildizEkle(
      ogeAnahtari(durum.takim === "harf" ? "harf" : "sayi", dogruAnahtar),
      "bul",
    );
    setDurum((onceki) => ({ ...onceki, bitti: true, yanlis: null }));
  }

  function sonrakiTur() {
    setDurum((onceki) => ({
      ...onceki,
      sira: (onceki.sira + 1) % turSayisi(onceki.takim),
      yanlis: null,
      bitti: false,
    }));
  }

  function takimDegistir(takim: Takim) {
    setDurum((onceki) =>
      onceki.takim === takim ? onceki : { takim, sira: 0, yanlis: null, bitti: false },
    );
  }

  return (
    <div className="bulOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Bul</h1>
        <div className="yazTakimlari" role="group" aria-label="Ne bulalım?">
          <button
            type="button"
            className={`yazTakimDugmesi${durum.takim === "harf" ? " secili" : ""}`}
            aria-pressed={durum.takim === "harf"}
            onClick={() => takimDegistir("harf")}
          >
            ABÇ
          </button>
          <button
            type="button"
            className={`yazTakimDugmesi${durum.takim === "rakam" ? " secili" : ""}`}
            aria-pressed={durum.takim === "rakam"}
            onClick={() => takimDegistir("rakam")}
          >
            123
          </button>
        </div>
      </div>

      {/* Hedef: harfin ya da rakamin kendisi. Yazi yok, ad yalnizca
          erisilebilirlik icin veriliyor. */}
      <div className="bulHedefi" role="note" aria-label={hedefEtiketi}>
        <span aria-hidden="true">{hedefYazisi}</span>
      </div>

      <div className="bulSecenekleri" role="group" aria-label="Seçenekler">
        {secenekler.map((secenek) => (
          <button
            key={secenek.anahtar}
            type="button"
            className={
              `bulSecenegi${durum.yanlis === secenek.anahtar ? " yanlis" : ""}` +
              // Tek simgeli secenek (harf turu) daha buyuk cizilir: genis
              // bir kutunun ortasindaki tek kucuk emoji kaybolyordu.
              `${secenek.icerik.length === 1 ? " tek" : ""}`
            }
            aria-label={secenek.etiket}
            onClick={() => secildi(secenek.anahtar)}
          >
            {secenek.icerik.map((simge, sira) => (
              <span key={sira} aria-hidden="true">
                {simge}
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
            <p>
              {harfTuru !== null
                ? harfTuru.secenekler.find((secenek) => secenek.harf === harfTuru.hedef)!.kelime
                : sayiAdi(sayiTuru!.hedef)}
              !
            </p>
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
