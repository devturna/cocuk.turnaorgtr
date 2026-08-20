// Cocugun dizdigi bloklar: programin YAPISI.
//
// Haritadaki yol "ne olacak"i, bu cubuk "nasil yazdim"i gosterir. Ayrim
// kasitli: Faz 4c'de dongu kucaklari bu cubukta yasayacak ve haritada
// acilmis haliyle gorunecek.
import { komutAnahtari, type Komut } from "@/lib/kodla/labirent/komutlar";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

export default function ProgramSeridi({
  program,
  vurgulanan,
  sonEklenenSira,
}: {
  program: Komut[];
  vurgulanan: number | null;
  // Konuma gore (program.length - 1) TURETILMEZ: son blok silinince onceki
  // blok konum olarak "son" olur ama yeni eklenmis degildir. Cagiran taraf
  // gercekten eklenen blogun sirasini izler (bkz. BolumEkrani.tsx).
  sonEklenenSira: number | null;
}) {
  return (
    <div className="programSeridi" role="list" aria-label="Program">
      {program.map((komut, sira) => {
        const anahtar = komutAnahtari(komut);
        const sonEklenen = sira === sonEklenenSira;
        return (
          <span
            key={`${sira}-${anahtar}`}
            role="listitem"
            aria-label={KOMUT_ADLARI[anahtar]}
            className={
              `programBloku${vurgulanan === sira ? " calisiyor" : ""}` +
              `${sonEklenen ? " yeni" : ""}`
            }
          >
            <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
          </span>
        );
      })}
    </div>
  );
}
