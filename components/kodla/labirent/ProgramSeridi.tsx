// Cocugun dizdigi bloklar: programin YAPISI.
//
// Haritadaki yol "ne olacak"i, bu cubuk "nasil yazdim"i gosterir. Ayrim
// kasitli: Faz 4c'de dongu kucaklari bu cubukta yasayacak ve haritada
// acilmis haliyle gorunecek.
import { komutAnahtari } from "@/lib/kodla/labirent/komutlar";
import type { Blok, BlokYolu, KomutBloku } from "@/lib/kodla/program";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

function yolEsit(a: BlokYolu | null, b: BlokYolu): boolean {
  return a !== null && a.ust === b.ust && a.ic === b.ic;
}

function KomutKutusu({
  blok,
  yol,
  vurgulanan,
  sonEklenen,
}: {
  blok: KomutBloku;
  yol: BlokYolu;
  vurgulanan: BlokYolu | null;
  sonEklenen: BlokYolu | null;
}) {
  const anahtar = komutAnahtari(blok.komut);
  return (
    <span
      role="listitem"
      aria-label={KOMUT_ADLARI[anahtar]}
      className={
        `programBloku${yolEsit(vurgulanan, yol) ? " calisiyor" : ""}` +
        `${yolEsit(sonEklenen, yol) ? " yeni" : ""}`
      }
    >
      <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
    </span>
  );
}

export default function ProgramSeridi({
  program,
  vurgulanan,
  sonEklenen,
}: {
  program: Blok[];
  vurgulanan: BlokYolu | null;
  // Konuma gore TURETILMEZ: son blok silinince onceki blok konum olarak
  // "son" olur ama yeni eklenmis degildir. Cagiran taraf gercekten eklenen
  // blogun yolunu izler (bkz. BolumEkrani.tsx).
  sonEklenen: BlokYolu | null;
}) {
  return (
    <div className="programSeridi" role="list" aria-label="Program">
      {program.map((blok, ust) => {
        if (blok.tur === "komut") {
          return (
            <KomutKutusu
              key={`${ust}-${komutAnahtari(blok.komut)}`}
              blok={blok}
              yol={{ ust, ic: null }}
              vurgulanan={vurgulanan}
              sonEklenen={sonEklenen}
            />
          );
        }
        return (
          <span
            key={`${ust}-tekrar`}
            role="listitem"
            aria-label={`${blok.kez} kez tekrarla`}
            className="tekrarKutusu"
          >
            {blok.govde.map((govdeBloku, ic) => (
              <KomutKutusu
                key={`${ic}-${komutAnahtari(govdeBloku.komut)}`}
                blok={govdeBloku}
                yol={{ ust, ic }}
                vurgulanan={vurgulanan}
                sonEklenen={sonEklenen}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
