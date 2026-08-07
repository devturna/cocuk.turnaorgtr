"use client";

// Kova, firca, silgi, geri al ve bastan basla dugmeleri.
//
// Cocuk henuz okumayi bilmeyebilir; bu yuzden her dugmenin anlamini yazi
// degil ikon tasir. Yazi sadece destek olarak altta durur.
import { useState } from "react";
import { FIRCA_KALINLIKLARI } from "@/lib/boyama/renkler";
import type { Arac } from "./Tuval";
import {
  KovaIkonu,
  FircaIkonu,
  SilgiIkonu,
  GeriIkonu,
  CopIkonu,
  TikIkonu,
  CarpiIkonu,
} from "./Ikonlar";
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

const ARACLAR: { deger: Arac; ad: string; Ikon: () => React.ReactElement }[] = [
  { deger: "kova", ad: "Boya", Ikon: KovaIkonu },
  { deger: "firca", ad: "Fırça", Ikon: FircaIkonu },
  { deger: "silgi", ad: "Silgi", Ikon: SilgiIkonu },
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
      {/* En cok kullanilan araclar: buyuk ve one cikan dugmeler. */}
      <div className="aracGrubu">
        {ARACLAR.map(({ deger, ad, Ikon }) => (
          <button
            key={deger}
            type="button"
            className={"aracDugmesi" + (deger === arac ? " secili" : "")}
            aria-pressed={deger === arac}
            onClick={() => aracSecildi(deger)}
          >
            <Ikon />
            <span className="aracAd">{ad}</span>
          </button>
        ))}
      </div>

      {/* Kalinlik secimi hep ayni yerde durur; sadece firca secilince etkinlesir. */}
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
            <span className="kalinlikNoktasi" style={{ width: secenek, height: secenek }} />
          </button>
        ))}
      </div>

      {/* Geri al ve bastan basla ayri bir grupta ve daha sakin renkte durur.
          Bastan basla cizimin tamamini siler; yanlislikla basilmamali. */}
      <div className="yardimciGrup">
        <button
          type="button"
          className="yardimciDugme"
          disabled={!geriAlinabilir}
          onClick={geriAlIstendi}
        >
          <GeriIkonu />
          <span className="aracAd">Geri Al</span>
        </button>

        <button
          type="button"
          className="yardimciDugme tehlikeli"
          onClick={() => setOnaySoruluyor(true)}
        >
          <CopIkonu />
          <span className="aracAd">Temizle</span>
        </button>
      </div>

      {onaySoruluyor && (
        <div className="onayKutusu" role="dialog" aria-label="Çizimi silmek istiyor musun?">
          <div className="onayIcerik">
            <p>Bütün çizimin silinsin mi?</p>
            <div className="onaySecenekler">
              <button
                type="button"
                className="onayDugmesi evet"
                aria-label="Evet, sil"
                onClick={() => {
                  bastanBaslaIstendi();
                  setOnaySoruluyor(false);
                }}
              >
                <TikIkonu />
              </button>
              <button
                type="button"
                className="onayDugmesi hayir"
                aria-label="Hayır, vazgeç"
                onClick={() => setOnaySoruluyor(false)}
              >
                <CarpiIkonu />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
