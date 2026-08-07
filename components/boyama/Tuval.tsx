"use client";

// Cizgi resmi gosteren ve dokunmayi dinleyen tuval.
//
// Iki katman ust uste durur:
//   1. Alt katman: dosyadan gelen ham SVG (bolgeler + cizgiler)
//   2. Ust katman: firca cizgileri, React tarafindan cizilir
//
// Ust katman pointer-events almaz; dokunmalar alttaki bolgelere gecer.
import { useEffect, useRef } from "react";
import type { BoyamaDurumu, FircaCizgisi } from "@/lib/boyama/durum";
import "./tuval.css";

export type Arac = "kova" | "firca" | "silgi";

type TuvalOzellikleri = {
  svgIcerigi: string;
  viewBox: string;
  durum: BoyamaDurumu;
  arac: Arac;
  renk: string;
  kalinlik: number;
  bolgeyeDokunuldu: (bolgeId: string) => void;
  cizgiTamamlandi: (cizgi: FircaCizgisi) => void;
  cizgiyeDokunuldu: (indeks: number) => void;
};

export default function Tuval({
  svgIcerigi,
  viewBox,
  durum,
  arac,
  renk,
  kalinlik,
  bolgeyeDokunuldu,
  cizgiTamamlandi,
  cizgiyeDokunuldu,
}: TuvalOzellikleri) {
  const cizgiKatmaniRef = useRef<HTMLDivElement>(null);
  const geciciCizgiRef = useRef<SVGPathElement>(null);
  // Cizim suruyorken biriken noktalar. Her karede React'i yenilemeyelim diye ref'te tutulur.
  const cizilenNoktalar = useRef<string[]>([]);

  // Durum degistikce ham SVG'deki bolgelerin rengini guncelle.
  useEffect(() => {
    const katman = cizgiKatmaniRef.current;
    if (!katman) return;

    katman.querySelectorAll<SVGElement>(".boyanabilir").forEach((bolge) => {
      bolge.setAttribute("fill", durum.dolgular[bolge.id] ?? "#ffffff");
    });
  }, [durum, svgIcerigi]);

  /**
   * Ekran koordinatini SVG viewBox koordinatina cevirir.
   * Tuval ile viewBox ayni en boy oranina sahip oldugu icin basit oran yeterli.
   */
  function tuvalNoktasi(olay: React.PointerEvent): { x: number; y: number } {
    const cerceve = (olay.currentTarget as HTMLElement).getBoundingClientRect();
    const [, , genislik, yukseklik] = viewBox.split(/\s+/).map(Number);
    return {
      x: ((olay.clientX - cerceve.left) / cerceve.width) * genislik,
      y: ((olay.clientY - cerceve.top) / cerceve.height) * yukseklik,
    };
  }

  function asagiBasildi(olay: React.PointerEvent) {
    const hedef = olay.target as SVGElement;

    // Kova ve silgi, dokunulan bolgeyi ust katmana bildirir; ne yapilacagina orasi karar verir.
    if (arac === "kova" || arac === "silgi") {
      if (hedef.classList?.contains("boyanabilir")) bolgeyeDokunuldu(hedef.id);
      return;
    }

    const nokta = tuvalNoktasi(olay);
    cizilenNoktalar.current = [`M${nokta.x} ${nokta.y}`];
    // Parmak tuvalden cikssa bile olaylar bize gelmeye devam etsin.
    olay.currentTarget.setPointerCapture?.(olay.pointerId);
  }

  function hareketEdildi(olay: React.PointerEvent) {
    if (arac !== "firca" || cizilenNoktalar.current.length === 0) return;
    const nokta = tuvalNoktasi(olay);
    cizilenNoktalar.current.push(`L${nokta.x} ${nokta.y}`);
    // Cizim bitene kadar gecici yol dogrudan guncellenir; React'i her karede yormayiz.
    geciciCizgiRef.current?.setAttribute("d", cizilenNoktalar.current.join(" "));
  }

  function kaldirildi() {
    if (arac !== "firca" || cizilenNoktalar.current.length === 0) return;

    // Tek noktaya dokunmak da gorunur bir iz biraksin diye nokta tekrarlanir.
    const noktalar =
      cizilenNoktalar.current.length === 1
        ? [cizilenNoktalar.current[0], cizilenNoktalar.current[0].replace("M", "L")]
        : cizilenNoktalar.current;

    cizgiTamamlandi({ d: noktalar.join(" "), renk, kalinlik });
    cizilenNoktalar.current = [];
    geciciCizgiRef.current?.setAttribute("d", "");
  }

  return (
    <div
      className="tuvalKapsayici"
      onPointerDown={asagiBasildi}
      onPointerMove={hareketEdildi}
      onPointerUp={kaldirildi}
      onPointerCancel={kaldirildi}
    >
      <div
        ref={cizgiKatmaniRef}
        className="cizgiKatmani"
        dangerouslySetInnerHTML={{ __html: svgIcerigi }}
      />
      <svg className="fircaKatmani" viewBox={viewBox} aria-hidden="true">
        {durum.fircaCizgileri.map((cizgi, indeks) => (
          <path
            key={indeks}
            d={cizgi.d}
            stroke={cizgi.renk}
            strokeWidth={cizgi.kalinlik}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="fircaCizgisi"
            // Sadece silgi modunda tek tek cizgilere dokunulabilir.
            style={{ pointerEvents: arac === "silgi" ? "stroke" : "none" }}
            onPointerDown={() => arac === "silgi" && cizgiyeDokunuldu(indeks)}
          />
        ))}
        <path
          ref={geciciCizgiRef}
          className="geciciCizgi"
          d=""
          stroke={renk}
          strokeWidth={kalinlik}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
