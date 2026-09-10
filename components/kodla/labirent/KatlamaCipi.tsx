// Seridin altinda usulca beliren katlama onerisi.
//
// Cocuk ayni komutu ust uste yazinca gorunur: "bunu bir kucakla da
// yazabilirdin". Dokunmazsa hicbir sey olmaz, bulmaca normal biter --
// uyari degil, teklif (docs/tasarim/kodlama-arayuz.md §5).
import { komutAnahtari } from "@/lib/kodla/labirent/komutlar";
import type { KatlamaOnerisi } from "@/lib/kodla/katlama";
import type { Blok } from "@/lib/kodla/program";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

export default function KatlamaCipi({
  oneri,
  program,
  onKatla,
}: {
  oneri: KatlamaOnerisi;
  program: Blok[];
  onKatla: () => void;
}) {
  const blok = program[oneri.ust];
  if (blok === undefined || blok.tur !== "komut") return null;
  const anahtar = komutAnahtari(blok.komut);

  return (
    <div className="katlamaSatiri">
      <button
        type="button"
        className="katlamaCipi"
        aria-label={`${oneri.kez} kez ${KOMUT_ADLARI[anahtar]}: tek kucağa topla`}
        onClick={onKatla}
      >
        <span aria-hidden="true">🔁</span>
        <span className="tekrarNoktalari" aria-hidden="true">
          {Array.from({ length: oneri.kez }, (_, nokta) => (
            <span key={nokta} className="tekrarNoktasi" />
          ))}
        </span>
        <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
        <span className="katlamaSoru" aria-hidden="true">
          ?
        </span>
      </button>
    </div>
  );
}
