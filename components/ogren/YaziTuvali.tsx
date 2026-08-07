"use client";

// Rakamin izlenecek yolunu gosteren ve parmagi takip eden tuval.
//
// Ekranda uc katman vardir:
//   1. Soluk hedef sekil (nereden gecilecegi)
//   2. Cocugun parmak izi
//   3. Kontrol noktalari; gecilen yesile doner
import { useEffect, useRef, useState } from "react";
import { TUVAL_BOYU, vurusYolu, type Nokta, type Vurus } from "@/lib/ogren/rakamYollari";
import type { IzlemeDurumu } from "@/lib/ogren/izleme";
import "./ogren.css";

type YaziTuvaliOzellikleri = {
  vuruslar: Vurus[];
  kontroller: Nokta[][];
  durum: IzlemeDurumu;
  parmakHareketi: (nokta: Nokta) => void;
  bitti: boolean;
};

export default function YaziTuvali({
  vuruslar,
  kontroller,
  durum,
  parmakHareketi,
  bitti,
}: YaziTuvaliOzellikleri) {
  const alanRef = useRef<HTMLDivElement>(null);
  const izRef = useRef<SVGPathElement>(null);
  const cizilenNoktalar = useRef<string[]>([]);
  const [kenar, setKenar] = useState(0);

  // Tuval kare olmali ve alana sigmali. Olcuyu kendimiz hesapliyoruz;
  // aspect-ratio veya container query kullanmak eski tarayicilarda tuvalin
  // kaybolmasina yol aciyor (bkz. components/boyama/Tuval.tsx).
  useEffect(() => {
    const alan = alanRef.current;
    if (!alan) return;

    const olc = () => setKenar(Math.min(alan.clientWidth, alan.clientHeight));
    olc();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", olc);
      return () => window.removeEventListener("resize", olc);
    }
    const gozlemci = new ResizeObserver(olc);
    gozlemci.observe(alan);
    return () => gozlemci.disconnect();
  }, []);

  /** Ekran koordinatini tuval koordinatina cevirir. */
  function tuvalNoktasi(olay: React.PointerEvent): Nokta {
    const cerceve = (olay.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: ((olay.clientX - cerceve.left) / cerceve.width) * TUVAL_BOYU,
      y: ((olay.clientY - cerceve.top) / cerceve.height) * TUVAL_BOYU,
    };
  }

  function izeEkle(nokta: Nokta, ilk: boolean) {
    cizilenNoktalar.current.push(`${ilk ? "M" : "L"}${nokta.x} ${nokta.y}`);
    izRef.current?.setAttribute("d", cizilenNoktalar.current.join(" "));
  }

  function asagiBasildi(olay: React.PointerEvent) {
    if (bitti) return;
    const nokta = tuvalNoktasi(olay);
    cizilenNoktalar.current = [];
    izeEkle(nokta, true);
    olay.currentTarget.setPointerCapture?.(olay.pointerId);
    parmakHareketi(nokta);
  }

  function hareketEdildi(olay: React.PointerEvent) {
    if (bitti || cizilenNoktalar.current.length === 0) return;
    const nokta = tuvalNoktasi(olay);
    izeEkle(nokta, false);
    parmakHareketi(nokta);
  }

  function kaldirildi() {
    // Parmak kalkinca iz silinir: cocuk yeniden deneyebilsin, ekran
    // karalamayla dolmasin. Tamamlanan kontrol noktalari korunur.
    cizilenNoktalar.current = [];
    izRef.current?.setAttribute("d", "");
  }

  return (
    <div className="yaziAlani" ref={alanRef}>
      <div
        className="yaziTuvali"
        style={kenar > 0 ? { width: kenar, height: kenar } : undefined}
        onPointerDown={asagiBasildi}
        onPointerMove={hareketEdildi}
        onPointerUp={kaldirildi}
        onPointerCancel={kaldirildi}
      >
        <svg viewBox={`0 0 ${TUVAL_BOYU} ${TUVAL_BOYU}`} className="yaziSvg">
          {/* Hedef sekil: nereden gecilecegini gosterir. */}
          {vuruslar.map((vurus, i) => (
            <path
              key={`hedef-${i}`}
              d={vurusYolu(vurus)}
              className={"hedefYol" + (i === durum.aktifVurus ? " aktif" : "")}
            />
          ))}

          {/* Cocugun parmak izi. */}
          <path ref={izRef} d="" className="parmakIzi" />

          {/* Kontrol noktalari: gecilen yesile doner. */}
          {kontroller.map((vurusKontrolleri, vi) =>
            vurusKontrolleri.map((nokta, ni) => (
              <circle
                key={`k-${vi}-${ni}`}
                cx={nokta.x}
                cy={nokta.y}
                r={vi === durum.aktifVurus && ni === 0 ? 16 : 9}
                className={
                  "kontrolNoktasi" +
                  (durum.tamamlanan[vi][ni] ? " gecildi" : "") +
                  (vi === durum.aktifVurus && ni === 0 ? " baslangic" : "")
                }
              />
            )),
          )}
        </svg>
      </div>
    </div>
  );
}
