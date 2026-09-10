// Cocugun dizdigi bloklar: programin YAPISI.
//
// Haritadaki yol "ne olacak"i, bu cubuk "nasil yazdim"i gosterir. Ayrim
// kasitli: dongu kucaklari bu cubukta yasar, haritada acilmis haliyle
// gorunur.
//
// Bilesen durum TUTMAZ: acik kucak da, sayiyi degistirme de disaridan
// gelir. Kucagin acik olmasi "paletten gelen blok icine duser" demektir
// (docs/tasarim/kodlama-arayuz.md §5).
import { komutAnahtari } from "@/lib/kodla/labirent/komutlar";
import type { Blok, BlokYolu, KomutBloku } from "@/lib/kodla/program";
import { KOMUT_ADLARI, KOMUT_IKONLARI } from "./komutGorunumu";

function yolEsit(a: BlokYolu | null, b: BlokYolu): boolean {
  return a !== null && a.ust === b.ust && a.ic === b.ic;
}

/**
 * Seritteki tek blok. Dokunmak onu SILER.
 *
 * Tek dokunusla silmek, hata ayiklama duraklarinin on sartidir: cocuk
 * hazir gelen bozuk programdan yanlis blogu cikarabilmeli. Suruklemek bu
 * yasta calismiyor (4a karari), sondan silme dugmesi ise ortadaki blogu
 * hicbir zaman kurtarmiyor.
 *
 * Erisilebilir ad palettekinden AYRI ("... blogunu sil"): ayni olsaydi
 * paletteki "Saga git" ile seritteki "Saga git" ayirt edilemezdi.
 *
 * listitem rolu SARMALAYICIDA durur, dugmenin kendisinde degil: role
 * niteligi elemanin kendi rolunu EZER, yani dugmeye "listitem" yazmak onu
 * erisilebilirlik agacinda dugme olmaktan cikarirdi (ve dokunulamaz
 * yapardi).
 */
function KomutKutusu({
  blok,
  yol,
  vurgulanan,
  sonEklenen,
  kilitli,
  onDokun,
}: {
  blok: KomutBloku;
  yol: BlokYolu;
  vurgulanan: BlokYolu | null;
  sonEklenen: BlokYolu | null;
  kilitli: boolean;
  onDokun: (yol: BlokYolu) => void;
}) {
  const anahtar = komutAnahtari(blok.komut);
  return (
    <span role="listitem" className="programOgesi">
      <button
        type="button"
        aria-label={`${KOMUT_ADLARI[anahtar]} bloğunu sil`}
        disabled={kilitli}
        onClick={() => onDokun(yol)}
        className={
          `programBloku${yolEsit(vurgulanan, yol) ? " calisiyor" : ""}` +
          `${yolEsit(sonEklenen, yol) ? " yeni" : ""}`
        }
      >
        <span aria-hidden="true">{KOMUT_IKONLARI[anahtar]}</span>
      </button>
    </span>
  );
}

export default function ProgramSeridi({
  program,
  vurgulanan,
  sonEklenen,
  acikKutu,
  kilitli,
  onKucakDokun,
  onNoktalarDokun,
  onBlokDokun,
}: {
  program: Blok[];
  vurgulanan: BlokYolu | null;
  // Konuma gore TURETILMEZ: son blok silinince onceki blok konum olarak
  // "son" olur ama yeni eklenmis degildir. Cagiran taraf gercekten eklenen
  // blogun yolunu izler (bkz. BolumEkrani.tsx).
  sonEklenen: BlokYolu | null;
  /** Acik kucagin ust duzey sirasi; hicbiri acik degilse null. */
  acikKutu: number | null;
  /** Kosu sirasinda dokunma kapalidir. */
  kilitli: boolean;
  onKucakDokun: (ust: number) => void;
  onNoktalarDokun: (ust: number) => void;
  /** Seritteki bir bloga dokunuldu: o blok silinir. */
  onBlokDokun: (yol: BlokYolu) => void;
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
              kilitli={kilitli}
              onDokun={onBlokDokun}
            />
          );
        }

        const acik = acikKutu === ust;
        return (
          <span
            key={`${ust}-tekrar`}
            role="group"
            aria-label={`${blok.kez} kez tekrarla`}
            className={`tekrarKutusu${acik ? " acik" : ""}`}
          >
            {/* Kutunun basinda IKI ayri dokunma hedefi durur: simge kucagi
                acar kapatir, noktalar sayiyi degistirir. Tek hedef olsaydi
                cocuk sayiyi degistirmek isterken kucagi kapatirdi. */}
            <button
              type="button"
              className="tekrarSimgesi"
              aria-label={acik ? "Kucağı kapat" : "Kucağı aç"}
              aria-pressed={acik}
              disabled={kilitli}
              onClick={() => onKucakDokun(ust)}
            >
              <span aria-hidden="true">🔁</span>
            </button>
            {/* Yazi yok, rakam yok: nokta sayisi sayinin kendisidir. Bu
                yasta rakam tanima henuz guvenilir degil (kodlama-kapsam.md
                §6). Erisilebilir ad sayiyi yine de soyler. */}
            <button
              type="button"
              className="tekrarNoktalari"
              aria-label={`Kaç kez tekrarlansın: ${blok.kez}`}
              disabled={kilitli}
              onClick={() => onNoktalarDokun(ust)}
            >
              {Array.from({ length: blok.kez }, (_, nokta) => (
                <span key={nokta} className="tekrarNoktasi" aria-hidden="true" />
              ))}
            </button>
            {blok.govde.length === 0 ? (
              // Bos kucak, icinin doldurulacagini kendi gosterir: kesikli
              // bir bosluk olmasa cocuk kutunun ne istedigini goremez.
              <span className="tekrarBoslugu" aria-hidden="true" />
            ) : (
              blok.govde.map((govdeBloku, ic) => (
                <KomutKutusu
                  key={`${ic}-${komutAnahtari(govdeBloku.komut)}`}
                  blok={govdeBloku}
                  yol={{ ust, ic }}
                  vurgulanan={vurgulanan}
                  sonEklenen={sonEklenen}
                  kilitli={kilitli}
                  onDokun={onBlokDokun}
                />
              ))
            )}
          </span>
        );
      })}
    </div>
  );
}
