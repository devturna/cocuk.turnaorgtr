"use client";

// Kova, firca, silgi, geri al ve bastan basla dugmeleri.
import { useState } from "react";
import { FIRCA_KALINLIKLARI } from "@/lib/boyama/renkler";
import type { Arac } from "./Tuval";
import "./kontroller.css";

type AracCubuguOzellikleri = {
  arac: Arac;
  kalinlik: number;
  geriAlinabilir: boolean;
  aracSecildi: (arac: Arac) => void;
  kalinlikSecildi: (kalinlik: number) => void;
  geriAlIstendi: () => void;
  bastanBaslaIstendi: () => void;
};

const ARACLAR: { deger: Arac; ad: string; ikon: string }[] = [
  { deger: "kova", ad: "Boya", ikon: "🪣" },
  { deger: "firca", ad: "Fırça", ikon: "🖌️" },
  { deger: "silgi", ad: "Silgi", ikon: "🧽" },
];

export default function AracCubugu({
  arac,
  kalinlik,
  geriAlinabilir,
  aracSecildi,
  kalinlikSecildi,
  geriAlIstendi,
  bastanBaslaIstendi,
}: AracCubuguOzellikleri) {
  const [onaySoruluyor, setOnaySoruluyor] = useState(false);

  return (
    <div className="aracCubugu">
      {ARACLAR.map((secenek) => (
        <button
          key={secenek.deger}
          type="button"
          className={"aracDugmesi" + (secenek.deger === arac ? " secili" : "")}
          aria-pressed={secenek.deger === arac}
          onClick={() => aracSecildi(secenek.deger)}
        >
          <span className="aracIkon" aria-hidden="true">{secenek.ikon}</span>
          <span className="aracAd">{secenek.ad}</span>
        </button>
      ))}

      {/* Kalinlik secimi her zaman ayni yerde durur; sadece firca secilince
          etkinlesir. Boylece arac degistiginde dugmeler yer degistirmez. */}
      <div className="kalinlikSecimi" role="group" aria-label="Fırça kalınlığı">
        {FIRCA_KALINLIKLARI.map((secenek) => (
          <button
            key={secenek}
            type="button"
            className={"kalinlikDugmesi" + (secenek === kalinlik ? " secili" : "")}
            aria-label={`Kalınlık ${secenek}`}
            aria-pressed={secenek === kalinlik}
            disabled={arac !== "firca"}
            onClick={() => kalinlikSecildi(secenek)}
          >
            <span
              className="kalinlikNoktasi"
              style={{ width: secenek, height: secenek }}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="aracDugmesi"
        disabled={!geriAlinabilir}
        onClick={geriAlIstendi}
      >
        <span className="aracIkon" aria-hidden="true">↩️</span>
        <span className="aracAd">Geri Al</span>
      </button>

      {onaySoruluyor ? (
        <div className="onayKutusu">
          <p>Her şey silinecek. Emin misin?</p>
          <button
            type="button"
            className="aracDugmesi"
            onClick={() => {
              bastanBaslaIstendi();
              setOnaySoruluyor(false);
            }}
          >
            <span className="aracAd">Evet, sil</span>
          </button>
          <button
            type="button"
            className="aracDugmesi"
            onClick={() => setOnaySoruluyor(false)}
          >
            <span className="aracAd">Vazgeç</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="aracDugmesi"
          onClick={() => setOnaySoruluyor(true)}
        >
          <span className="aracIkon" aria-hidden="true">🗑️</span>
          <span className="aracAd">Baştan Başla</span>
        </button>
      )}
    </div>
  );
}
