"use client";

// "Kiminle ucalim?" ekrani: kursa girerken bir kez sorulur.
//
// Cocuk yaziyi okumaz, kusa bakar ve secer. Karttaki ad ve bilgi
// yanindaki buyuge yazilmistir.
//
// Ekran bir GECITTIR, yalnizca bir ortu degil. Ustunu ortmek fareyi
// durdurur ama klavyeyi durdurmaz: arkadaki durak baglantilari sekmede
// kalirsa cocuk (ya da ekran okuyucu) kus secmeden bolume girebilir. Bu
// yuzden iki sey birlikte yapilir: arkadaki harita `inert` ile kapatilir
// (bkz. GocHaritasi.tsx) ve acilir acilmaz ilk karta odaklanilir.
import { useEffect, useRef } from "react";
import type { Karakter } from "@/lib/kodla/karakterler";
import { KarakterSimgesi } from "./Simgeler";

export default function KarakterKartlari({
  karakterler,
  onSec,
  kapatilabilir = false,
  onKapat,
}: {
  karakterler: Karakter[];
  onSec: (karakterId: string) => void;
  /**
   * Escape ekrani kapatabilir mi? Ilk giriste HAYIR: arkada gecerli bir
   * durum yok, kapatan cocuk kussuz bir haritada kalirdi. Madalyondan
   * yeniden acildiginda ise secim zaten var, vazgecmek gecerli bir
   * cevaptir.
   */
  kapatilabilir?: boolean;
  onKapat?: () => void;
}) {
  const kutu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Acilista odak ilk karta gider: klavyeyle gelen biri once kuslari
    // bulur, sekme sirasinin basindaki site basligini degil.
    kutu.current?.querySelector<HTMLButtonElement>(".karakterKarti")?.focus();
  }, []);

  return (
    <div
      ref={kutu}
      className="karakterSecimi"
      role="dialog"
      aria-modal="true"
      aria-label="Kiminle uçalım?"
      onKeyDown={(olay) => {
        if (olay.key === "Escape" && kapatilabilir) onKapat?.();
      }}
    >
      <h2 className="karakterBaslik">Kiminle uçalım?</h2>
      <div className="karakterKartlari">
        {karakterler.map((karakter) => (
          <button
            key={karakter.id}
            type="button"
            className="karakterKarti"
            aria-label={karakter.ad}
            onClick={() => onSec(karakter.id)}
          >
            <svg viewBox="0 0 100 100" className="karakterCizim" aria-hidden="true">
              <KarakterSimgesi yon="sag" poz="durus" palet={karakter.palet} />
            </svg>
            <span className="karakterAd">{karakter.ad}</span>
            <span className="karakterBilgi">{karakter.bilgi}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
