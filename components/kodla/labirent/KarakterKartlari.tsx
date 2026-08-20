"use client";

// "Kiminle ucalim?" ekrani: kursa girerken bir kez sorulur.
//
// Cocuk yaziyi okumaz, kusa bakar ve secer. Karttaki ad ve bilgi
// yanindaki buyuge yazilmistir.
import type { Karakter } from "@/lib/kodla/karakterler";
import { KarakterSimgesi } from "./Simgeler";

export default function KarakterKartlari({
  karakterler,
  onSec,
}: {
  karakterler: Karakter[];
  onSec: (karakterId: string) => void;
}) {
  return (
    <div className="karakterSecimi" role="dialog" aria-label="Kiminle uçalım?">
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
