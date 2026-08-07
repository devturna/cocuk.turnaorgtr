"use client";

// Yaz oyunu: cocuk rakamin uzerinden parmagiyla gecer.
//
// Yanlis yere cizmek cezalandirilmaz; o hareket sadece sayilmaz. Cocuk
// istedigi kadar deneyebilir, sure yoktur.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { yazilabilirRakamlar } from "@/lib/ogren/sayilar";
import { RAKAM_YOLLARI, kontrolNoktalari, type Nokta } from "@/lib/ogren/rakamYollari";
import { yeniIzleme, parmakGecti, hepsiBittiMi } from "@/lib/ogren/izleme";
import { yildizEkle, ogeAnahtari } from "@/lib/ogren/yildiz";
import YaziTuvali from "./YaziTuvali";
import "./ogren.css";

// Kontrol noktalari birbirine bu kadar yakinsa elenir (tuval birimi).
const EN_AZ_ARALIK = 42;
// Parmak bir kontrol noktasina bu kadar yaklasirsa nokta gecilmis sayilir.
const TOLERANS = 34;

export default function YazOyunu() {
  const rakamlar = yazilabilirRakamlar();
  const [sira, setSira] = useState(0);
  const rakam = rakamlar[sira].rakam;

  const vuruslar = useMemo(() => RAKAM_YOLLARI[rakam], [rakam]);
  const kontroller = useMemo(
    () => vuruslar.map((vurus) => kontrolNoktalari(vurus, EN_AZ_ARALIK)),
    [vuruslar],
  );

  const [durum, setDurum] = useState(() => yeniIzleme(kontroller));
  const bitti = hepsiBittiMi(durum);

  // Bu ekran acikken sayfa kaydirilmaz ve ust bar gizlenir.
  // Sinif body uzerinde durur; ilgili kurallar app/globals.css icinde.
  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Rakam degisince izleme sifirlanir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum(yeniIzleme(kontroller));
  }, [kontroller]);

  // Rakam tamamlaninca yildiz kazanilir.
  useEffect(() => {
    if (bitti) yildizEkle(ogeAnahtari("sayi", String(rakam)), "yaz");
  }, [bitti, rakam]);

  function parmakHareketi(nokta: Nokta) {
    setDurum((onceki) => parmakGecti(onceki, kontroller, nokta, TOLERANS));
  }

  function sonrakiRakam() {
    setSira((onceki) => (onceki + 1) % rakamlar.length);
  }

  return (
    <div className="yazOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>{rakamlar[sira].ad}</h1>
      </div>

      <YaziTuvali
        vuruslar={vuruslar}
        kontroller={kontroller}
        durum={durum}
        parmakHareketi={parmakHareketi}
        bitti={bitti}
      />

      <div className="oyunAltBar">
        <button
          type="button"
          className="oyunDugmesi"
          onClick={() => setDurum(yeniIzleme(kontroller))}
        >
          Baştan
        </button>
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiRakam}>
          Sonraki
        </button>
      </div>

      {bitti && (
        <div className="kutlama" role="status">
          <div className="kutlamaIcerik">
            <p>Aferin!</p>
            <span className="kutlamaYildiz" aria-hidden="true">⭐</span>
            <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiRakam}>
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
