"use client";

// Yaz oyunu: cocuk rakamin uzerinden parmagiyla gecer.
//
// Yanlis yere cizmek cezalandirilmaz; o hareket sadece sayilmaz. Cocuk
// istedigi kadar deneyebilir, sure yoktur.
import { useEffect, useState } from "react";
import Link from "next/link";
import { yazilabilirRakamlar } from "@/lib/ogren/sayilar";
import { RAKAM_YOLLARI, kontrolNoktalari, type Nokta } from "@/lib/ogren/rakamYollari";
import { yeniIzleme, parmakGecti, hepsiBittiMi, type IzlemeDurumu } from "@/lib/ogren/izleme";
import { yildizEkle, ogeAnahtari } from "@/lib/ogren/yildiz";
import YaziTuvali from "./YaziTuvali";
import "./ogren.css";

// Kontrol noktalari birbirine bu kadar yakinsa elenir (tuval birimi).
const EN_AZ_ARALIK = 42;
// Parmak bir kontrol noktasina bu kadar yaklasirsa nokta gecilmis sayilir.
const TOLERANS = 34;

const RAKAMLAR = yazilabilirRakamlar();

/**
 * Sira, kontrol noktalari ve izleme durumu TEK BIR NESNEDE tutulur.
 *
 * Bunlari ayri state'lerde tutmak gercek bir hataya yol acmisti: rakam
 * degistiginde kontrol noktalari hemen yenilenirken izleme durumu bir
 * render boyunca eski kaliyordu. Tek vuruslu bir rakamdan (3) iki vuruslu
 * birine (4) gecerken durum.tamamlanan[1] tanimsiz oluyor ve uygulama
 * cokuyordu. Ucu birlikte uretilince boyle bir ara durum olusamaz.
 */
type OyunDurumu = {
  sira: number;
  kontroller: Nokta[][];
  izleme: IzlemeDurumu;
};

function oyunDurumuOlustur(sira: number): OyunDurumu {
  const rakam = RAKAMLAR[sira].rakam;
  const kontroller = RAKAM_YOLLARI[rakam].map((vurus) =>
    kontrolNoktalari(vurus, EN_AZ_ARALIK),
  );
  return { sira, kontroller, izleme: yeniIzleme(kontroller) };
}

export default function YazOyunu() {
  const [oyun, setOyun] = useState(() => oyunDurumuOlustur(0));
  // Kutlama kapatilabilir olmali; yoksa butun ekrani orttugu icin cocuk
  // bolume geri donemez, "Sonraki"ye basmak zorunda kalir.
  const [kutlamaKapatildi, setKutlamaKapatildi] = useState(false);
  // Cocuk hala ciziyorken kutlama acilirsa, hareketin ortasinda ekrani
  // ortuyor ve "birden bir sey cikti" hissi veriyor. Parmak kalkana kadar
  // bekletiyoruz; yildiz yine de aninda kazaniliyor.
  const [cizimSuruyor, setCizimSuruyor] = useState(false);

  const rakam = RAKAMLAR[oyun.sira].rakam;
  const vuruslar = RAKAM_YOLLARI[rakam];
  const bitti = hepsiBittiMi(oyun.izleme);

  // Bu ekran acikken sayfa kaydirilmaz ve ust bar gizlenir.
  // Sinif body uzerinde durur; ilgili kurallar app/globals.css icinde.
  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Rakam tamamlaninca yildiz kazanilir.
  useEffect(() => {
    if (bitti) yildizEkle(ogeAnahtari("sayi", String(rakam)), "yaz");
  }, [bitti, rakam]);

  function parmakHareketi(nokta: Nokta) {
    setOyun((onceki) => ({
      ...onceki,
      izleme: parmakGecti(onceki.izleme, onceki.kontroller, nokta, TOLERANS),
    }));
  }

  function bastanBasla() {
    setOyun((onceki) => oyunDurumuOlustur(onceki.sira));
    setKutlamaKapatildi(false);
  }

  function sonrakiRakam() {
    setOyun((onceki) => oyunDurumuOlustur((onceki.sira + 1) % RAKAMLAR.length));
    setKutlamaKapatildi(false);
  }

  return (
    <div className="yazOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>{RAKAMLAR[oyun.sira].ad}</h1>
      </div>

      <YaziTuvali
        vuruslar={vuruslar}
        kontroller={oyun.kontroller}
        durum={oyun.izleme}
        parmakHareketi={parmakHareketi}
        cizimDurumu={setCizimSuruyor}
        bitti={bitti}
      />

      <div className="oyunAltBar">
        <button
          type="button"
          className="oyunDugmesi"
          onClick={bastanBasla}
        >
          Baştan
        </button>
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiRakam}>
          Sonraki
        </button>
      </div>

      {bitti && !cizimSuruyor && !kutlamaKapatildi && (
        // Kutlamanin disina dokununca kapanir; cizim tamamlanmis olarak kalir.
        <div
          className="kutlama"
          role="status"
          onPointerDown={() => setKutlamaKapatildi(true)}
        >
          <div className="kutlamaIcerik" onPointerDown={(olay) => olay.stopPropagation()}>
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
