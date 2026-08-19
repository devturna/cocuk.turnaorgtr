// Cocugun dizdigi bloklar. Calisan blok buyuyup renklenir: bolumun en onemli
// ogretici ani, "bu kutu su hareketi yaptirdi" bagini burada kuruyor.
import { komutAnahtari, type Komut } from "@/lib/kodla/labirent/komutlar";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

export default function ProgramSeridi({
  program,
  vurgulanan,
}: {
  program: Komut[];
  vurgulanan: number | null;
}) {
  return (
    <div className="programSeridi" role="list" aria-label="Program">
      {program.map((komut, sira) => {
        const anahtar = komutAnahtari(komut);
        return (
          <span
            key={`${sira}-${anahtar}`}
            role="listitem"
            aria-label={KOMUT_ADLARI[anahtar]}
            className={`programBloku${vurgulanan === sira ? " calisiyor" : ""}`}
          >
            <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
          </span>
        );
      })}
    </div>
  );
}
