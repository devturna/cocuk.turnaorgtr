// Dokunulunca programa blok ekleyen dugmeler.
//
// Arti duzeninde diziliyorlar: bir sira halindeki dort ok cocugun her
// ikonu COZMESINI gerektirir, arti duzeninde yon dugmenin YERINDEN anlasilir.
// Bu yasta mekansal esleme, simge cozmeden once gelir.
import {
  KOMUT_SETLERI,
  komutAnahtari,
  type Komut,
  type KomutSeti,
} from "@/lib/kodla/labirent/komutlar";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

// Her komutun arti duzenindeki yeri. Izgara alan adlariyla veriliyor.
const YERLESIM: Record<string, string> = {
  "git:yukari": "ust",
  "git:asagi": "alt",
  "git:sol": "sol",
  "git:sag": "sag",
  ileri: "ust",
  "don:sol": "sol",
  "don:sag": "sag",
};

export default function KomutPaleti({
  seti,
  kilitli,
  onEkle,
  hayalet,
}: {
  seti: KomutSeti;
  kilitli: boolean;
  onEkle: (komut: Komut) => void;
  hayalet: string | null;
}) {
  return (
    <div className="komutPaleti" role="group" aria-label="Komutlar">
      {KOMUT_SETLERI[seti].map((komut) => {
        const anahtar = komutAnahtari(komut);
        return (
          <button
            key={anahtar}
            type="button"
            className={
              `komutDugmesi yer-${YERLESIM[anahtar]}` +
              `${hayalet === anahtar ? " hayaletli" : ""}`
            }
            aria-label={KOMUT_ADLARI[anahtar]}
            disabled={kilitli}
            onClick={() => onEkle(komut)}
          >
            <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
          </button>
        );
      })}
    </div>
  );
}
