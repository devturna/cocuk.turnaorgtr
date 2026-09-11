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
import {
  eslestirHarfTurSayisi,
  eslestirHarfTuruUret,
  eslestirTurSayisi,
  eslestirTuruUret,
} from "@/lib/ogren/eslestir";
import { harfBul } from "@/lib/ogren/harfler";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, yildizEkle } from "@/lib/ogren/yildiz";
import "./ogren.css";

/** ogren.css'teki sallanma animasyonuyla ayni. */
const SALLANMA_SURESI = 500;

type Takim = "harf" | "rakam";

// Turun iki yani da METIN olarak tutuluyor: rakam turunde sag taraf nokta
// grubudur ve sayinin kendisi anahtar olur, harf turunde sag taraf kucuk
// harftir. Ikisini tek sekle indirgeyince ekranin geri kalani (secme,
// eslesme, yildiz) tek bir kod yolunda kaliyor.
type Durum = {
  takim: Takim;
  sira: number;
  /** Secili sol oge; hicbiri secili degilse null. */
  secili: string | null;
  /** Eslesmis SOL ogeler: iki taraf da sabitlenir. */
  eslesenler: string[];
  /** Yanlis secilen sag oge; sallanma bitince temizlenir. */
  yanlis: string | null;
};

function yeniDurum(takim: Takim, sira: number): Durum {
  return { takim, sira, secili: null, eslesenler: [], yanlis: null };
}

function turSayisi(takim: Takim): number {
  return takim === "harf" ? eslestirHarfTurSayisi() : eslestirTurSayisi();
}

/** Turun ciftleri: sol taraf sirali, sag taraf karisik. */
function turCiftleri(takim: Takim, sira: number): { sol: string[]; sag: string[] } {
  if (takim === "harf") return eslestirHarfTuruUret(sira);
  const tur = eslestirTuruUret(sira);
  return { sol: tur.sol.map(String), sag: tur.sag.map(String) };
}

/** Sag taraftaki oge, soldaki ogenin karsiligi mi. */
function esMi(takim: Takim, sol: string, sag: string): boolean {
  return takim === "harf" ? harfBul(sol)?.kucuk === sag : sol === sag;
}

function sayiAdi(rakam: number): string {
  return SAYILAR.find((sayi) => sayi.rakam === rakam)?.ad ?? String(rakam);
}

/** Soldaki ogenin okunabilir adi. */
function solAdi(takim: Takim, oge: string): string {
  return takim === "harf" ? oge : sayiAdi(Number(oge));
}

/** Sagdaki ogenin okunabilir adi. */
function sagAdi(takim: Takim, oge: string): string {
  return takim === "harf" ? `küçük ${oge}` : `${sayiAdi(Number(oge))} nokta`;
}

export default function EslestirOyunu() {
  // Harfler once: bolumun adi da once harfleri soyluyor.
  const [durum, setDurum] = useState(() => yeniDurum("harf", 0));
  const tur = turCiftleri(durum.takim, durum.sira);
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

  function solSecildi(oge: string) {
    if (durum.eslesenler.includes(oge)) return;
    setDurum((onceki) => ({ ...onceki, secili: oge }));
  }

  function sagSecildi(oge: string) {
    if (durum.eslesenler.some((eslesen) => esMi(durum.takim, eslesen, oge))) return;
    // Once sol taraf secilmeli: kural "sunu suna bagliyorum" seklinde okunur.
    if (durum.secili === null) return;
    if (!esMi(durum.takim, durum.secili, oge)) {
      setDurum((onceki) => ({ ...onceki, yanlis: oge }));
      return;
    }
    const secilen = durum.secili;
    yildizEkle(
      ogeAnahtari(durum.takim === "harf" ? "harf" : "sayi", secilen),
      "eslestir",
    );
    setDurum((onceki) => ({
      ...onceki,
      eslesenler: [...onceki.eslesenler, secilen],
      secili: null,
      yanlis: null,
    }));
  }

  function sonrakiTur() {
    setDurum((onceki) => yeniDurum(onceki.takim, (onceki.sira + 1) % turSayisi(onceki.takim)));
  }

  function takimDegistir(takim: Takim) {
    setDurum((onceki) => (onceki.takim === takim ? onceki : yeniDurum(takim, 0)));
  }

  return (
    <div className="eslestirOyunu">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>Eşleştir</h1>
        <div className="yazTakimlari" role="group" aria-label="Ne eşleştirelim?">
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

      <div className="eslestirAlani">
        <div
          className="eslestirSutunu"
          role="group"
          aria-label={durum.takim === "harf" ? "Büyük harfler" : "Rakamlar"}
        >
          {tur.sol.map((oge) => (
            <button
              key={oge}
              type="button"
              className={
                `eslestirRakami${durum.secili === oge ? " secili" : ""}` +
                `${durum.eslesenler.includes(oge) ? " eslesti" : ""}`
              }
              aria-label={solAdi(durum.takim, oge)}
              onClick={() => solSecildi(oge)}
            >
              <span aria-hidden="true">{oge}</span>
            </button>
          ))}
        </div>

        <div
          className="eslestirSutunu"
          role="group"
          aria-label={durum.takim === "harf" ? "Küçük harfler" : "Noktalar"}
        >
          {tur.sag.map((oge) => (
            <button
              key={oge}
              type="button"
              className={
                `eslestirGrubu${durum.yanlis === oge ? " yanlis" : ""}` +
                `${durum.eslesenler.some((eslesen) => esMi(durum.takim, eslesen, oge)) ? " eslesti" : ""}`
              }
              aria-label={sagAdi(durum.takim, oge)}
              onClick={() => sagSecildi(oge)}
            >
              {durum.takim === "harf" ? (
                <span aria-hidden="true">{oge}</span>
              ) : (
                Array.from({ length: Number(oge) }, (_, sira) => (
                  <span key={sira} className="eslestirNoktasi" aria-hidden="true" />
                ))
              )}
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
