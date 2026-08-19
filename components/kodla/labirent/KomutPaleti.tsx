// Dokunulunca programa blok ekleyen dugmeler.
// Dokunma tek jesttir ve iskalanmaz; bu yasta surukleme tek yol olamaz.
import { KOMUT_SETLERI, komutAnahtari, type Komut, type KomutSeti } from "@/lib/kodla/labirent/komutlar";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

export default function KomutPaleti({
  seti,
  kilitli,
  onEkle,
}: {
  seti: KomutSeti;
  kilitli: boolean;
  onEkle: (komut: Komut) => void;
}) {
  return (
    <div className="komutPaleti">
      {KOMUT_SETLERI[seti].map((komut) => {
        const anahtar = komutAnahtari(komut);
        return (
          <button
            key={anahtar}
            type="button"
            className="komutDugmesi"
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
