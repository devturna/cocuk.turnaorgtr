"use client";

// Yaz oyunu: cocuk harfin veya rakamin uzerinden parmagiyla gecer.
//
// Yanlis yere cizmek cezalandirilmaz; o hareket sadece sayilmaz. Cocuk
// istedigi kadar deneyebilir, sure yoktur.
//
// Iki takim vardir (harfler ve rakamlar) ve ustteki iki dugmeyle
// degisirler. Ayri iki sayfa yapmak bolum girisini de ikiye bolerdi; oysa
// ogrenilen is aynidir, degisen yalnizca uzerinden gecilen sekil.
import { useEffect, useState } from "react";
import Link from "next/link";
import { yazilabilirRakamlar } from "@/lib/ogren/sayilar";
import { HARFLER } from "@/lib/ogren/harfler";
import { HARF_YOLLARI } from "@/lib/ogren/harfYollari";
import { RAKAM_YOLLARI, kontrolNoktalari, type Nokta, type Vurus } from "@/lib/ogren/rakamYollari";
import { yeniIzleme, parmakGecti, hepsiBittiMi, type IzlemeDurumu } from "@/lib/ogren/izleme";
import { yildizEkle, ogeAnahtari } from "@/lib/ogren/yildiz";
import YaziTuvali from "./YaziTuvali";
import "./ogren.css";

// Kontrol noktalari birbirine bu kadar yakinsa elenir (tuval birimi).
const EN_AZ_ARALIK = 42;
// Parmak bir kontrol noktasina bu kadar yaklasirsa nokta gecilmis sayilir.
const TOLERANS = 34;

const RAKAMLAR = yazilabilirRakamlar();

type Takim = "harf" | "rakam";

/** Takimdaki ogelerin sayisi. */
function takimUzunlugu(takim: Takim): number {
  return takim === "harf" ? HARFLER.length : RAKAMLAR.length;
}

/** Siradaki ogenin cizim yolu. */
function ogeVuruslari(takim: Takim, sira: number): Vurus[] {
  return takim === "harf" ? HARF_YOLLARI[HARFLER[sira].buyuk] : RAKAM_YOLLARI[RAKAMLAR[sira].rakam];
}

/** Ogenin yildiz kaydindaki turu ve degeri. */
function ogeDegeri(takim: Takim, sira: number): string {
  return takim === "harf" ? HARFLER[sira].buyuk : String(RAKAMLAR[sira].rakam);
}

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
  takim: Takim;
  sira: number;
  kontroller: Nokta[][];
  izleme: IzlemeDurumu;
};

function oyunDurumuOlustur(takim: Takim, sira: number): OyunDurumu {
  const kontroller = ogeVuruslari(takim, sira).map((vurus) =>
    kontrolNoktalari(vurus, EN_AZ_ARALIK),
  );
  return { takim, sira, kontroller, izleme: yeniIzleme(kontroller) };
}

export default function YazOyunu() {
  // Harfler once: bolumun adi da once harfleri soyluyor.
  const [oyun, setOyun] = useState(() => oyunDurumuOlustur("harf", 0));
  // Kutlama kapatilabilir olmali; yoksa butun ekrani orttugu icin cocuk
  // bolume geri donemez, "Sonraki"ye basmak zorunda kalir.
  const [kutlamaKapatildi, setKutlamaKapatildi] = useState(false);
  // Cocuk hala ciziyorken kutlama acilirsa, hareketin ortasinda ekrani
  // ortuyor ve "birden bir sey cikti" hissi veriyor. Parmak kalkana kadar
  // bekletiyoruz; yildiz yine de aninda kazaniliyor.
  const [cizimSuruyor, setCizimSuruyor] = useState(false);

  const vuruslar = ogeVuruslari(oyun.takim, oyun.sira);
  const bitti = hepsiBittiMi(oyun.izleme);
  const harf = oyun.takim === "harf" ? HARFLER[oyun.sira] : null;
  const baslik = harf !== null ? harf.buyuk : RAKAMLAR[oyun.sira].ad;

  // Bu ekran acikken sayfa kaydirilmaz ve ust bar gizlenir.
  // Sinif body uzerinde durur; ilgili kurallar app/globals.css icinde.
  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Harf veya rakam tamamlaninca yildiz kazanilir.
  useEffect(() => {
    if (!bitti) return;
    yildizEkle(
      ogeAnahtari(oyun.takim === "harf" ? "harf" : "sayi", ogeDegeri(oyun.takim, oyun.sira)),
      "yaz",
    );
  }, [bitti, oyun.takim, oyun.sira]);

  function parmakHareketi(nokta: Nokta) {
    setOyun((onceki) => ({
      ...onceki,
      izleme: parmakGecti(onceki.izleme, onceki.kontroller, nokta, TOLERANS),
    }));
  }

  function bastanBasla() {
    setOyun((onceki) => oyunDurumuOlustur(onceki.takim, onceki.sira));
    setKutlamaKapatildi(false);
  }

  function sonrakiOge() {
    setOyun((onceki) =>
      oyunDurumuOlustur(onceki.takim, (onceki.sira + 1) % takimUzunlugu(onceki.takim)),
    );
    setKutlamaKapatildi(false);
  }

  function takimDegistir(takim: Takim) {
    setOyun((onceki) => (onceki.takim === takim ? onceki : oyunDurumuOlustur(takim, 0)));
    setKutlamaKapatildi(false);
  }

  return (
    <div className="yazOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>{baslik}</h1>
        {/* Ornek kelimenin simgesi: okuyamayan cocuk icin harfin hatirlatici
            resmi. Rakamlarda karsiligi yok, o yuzden yalnizca harflerde. */}
        {harf !== null ? (
          <span className="yazOrnek" aria-label={harf.ornekKelime}>
            {harf.simge}
          </span>
        ) : null}
        <div className="yazTakimlari" role="group" aria-label="Ne yazalım?">
          <button
            type="button"
            className={`yazTakimDugmesi${oyun.takim === "harf" ? " secili" : ""}`}
            aria-pressed={oyun.takim === "harf"}
            onClick={() => takimDegistir("harf")}
          >
            ABÇ
          </button>
          <button
            type="button"
            className={`yazTakimDugmesi${oyun.takim === "rakam" ? " secili" : ""}`}
            aria-pressed={oyun.takim === "rakam"}
            onClick={() => takimDegistir("rakam")}
          >
            123
          </button>
        </div>
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
        <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiOge}>
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
            <button type="button" className="oyunDugmesi vurgulu" onClick={sonrakiOge}>
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
