// Desen sahnesi: izgara koseleri, hedef desen ve cizilen cizgiler.
//
// Labirent sahnesinin karsiligi ama olcusu farkli: orada kus KARELERDE
// durur, burada KOSELERDE. Cizgi de kareye degil, iki kosenin arasindaki
// kenara duser (docs/tasarim/kodlama-cizim.md §3).
import { anahtarKenari, type Desen } from "@/lib/kodla/desen/desen";
import type { Tema } from "@/lib/kodla/labirent/temalar";
import type { Yon } from "@/lib/kodla/labirent/komutlar";
import { KarakterSimgesi, type KarakterPaleti, type KarakterPozu } from "../labirent/Simgeler";

// Iki kose arasi, labirentteki bir kare kadar: iki mekanik ayni olcegi
// paylasir, kus ikisinde de ayni buyuklukte gorunur.
const ADIM = 100;

// Kus, kendi 100x100 kutusunun ortasinda cizilir; kutuyu yarim adim geri
// kaydirinca kus KOSENIN ustune oturur.
const KUS_KAYMASI = -ADIM / 2;

function KenarCizgisi({
  anahtar,
  sinif,
}: {
  anahtar: string;
  sinif: string;
}) {
  const kenar = anahtarKenari(anahtar);
  if (kenar === null) return null;
  const [a, b] = kenar;
  return (
    <line
      className={sinif}
      x1={a.x * ADIM}
      y1={a.y * ADIM}
      x2={b.x * ADIM}
      y2={b.y * ADIM}
    />
  );
}

export default function DesenSahne({
  desen,
  tema,
  onizleme,
  cizilenler,
  karakterKonumu,
  poz,
  bulmacaSirasi,
  palet,
  bekliyor,
  bitti,
  bolumAdi,
}: {
  desen: Desen;
  /** Zemin ve kose renkleri duraga gore degisir; engel cizimi burada
      kullanilmaz (desende engel yoktur). */
  tema: Tema;
  /** Program calistirilsa cizilecek kenarlar; kosu sirasinda gosterilmez. */
  onizleme: string[];
  /** Su ana kadar gercekten cizilmis kenarlar. */
  cizilenler: string[];
  karakterKonumu: { x: number; y: number; bakis: Yon };
  poz: KarakterPozu;
  bulmacaSirasi: number;
  palet: KarakterPaleti;
  bekliyor: boolean;
  bitti: boolean;
  bolumAdi: string;
}) {
  const genislik = (desen.genislik - 1) * ADIM;
  const yukseklik = (desen.yukseklik - 1) * ADIM;
  const cizilenKume = new Set(cizilenler);
  const koseler = Array.from({ length: desen.yukseklik }, (_, y) =>
    Array.from({ length: desen.genislik }, (_, x) => ({ x, y })),
  ).flat();

  return (
    <svg
      className={`kodlaSahne desenSahne${bitti ? " bitti" : ""}`}
      viewBox={`${KUS_KAYMASI} ${KUS_KAYMASI} ${genislik + ADIM} ${yukseklik + ADIM}`}
      role="img"
      aria-label={`${bolumAdi} deseni`}
      style={{ background: tema.zeminRengi }}
    >
      {/* Hedef desen soluk durur: cocuk ne cizecegini gorur, ustunden
          gecer. Cizilmis olan kenar hedefte de olsa artik KALIN cizilir,
          o yuzden hedef katmani once basiliyor. */}
      {[...desen.kenarlar].map((anahtar) => (
        <KenarCizgisi key={`hedef-${anahtar}`} anahtar={anahtar} sinif="desenHedef" />
      ))}

      {koseler.map((kose) => (
        <circle
          key={`kose-${kose.x},${kose.y}`}
          className="desenKose"
          fill={tema.cizgiRengi}
          cx={kose.x * ADIM}
          cy={kose.y * ADIM}
          r="7"
        />
      ))}

      {/* Onizleme: program calistirilmadan once ne cizilecegi. Labirentteki
          yol onizlemesinin karsiligi; aynen onun gibi gercek motordan
          uretilir, ayri bir kural tasimaz. */}
      {bekliyor
        ? onizleme
            .filter((anahtar) => !cizilenKume.has(anahtar))
            .map((anahtar) => (
              <KenarCizgisi key={`onizleme-${anahtar}`} anahtar={anahtar} sinif="desenOnizleme" />
            ))
        : null}

      {cizilenler.map((anahtar) => (
        <KenarCizgisi key={`cizgi-${anahtar}`} anahtar={anahtar} sinif="desenCizgi" />
      ))}

      {/* Konum ve donus stile yaziliyor, gecisi CSS yapiyor; labirent
          sahnesindeki .kodlaKarakter ile ayni sozlesme (kodla.css). */}
      <g transform={`translate(${KUS_KAYMASI} ${KUS_KAYMASI})`}>
        <g
          key={bulmacaSirasi}
          className={`kodlaKarakter poz-${poz}${bekliyor ? " bekliyor" : ""}`}
          style={
            {
              "--kare-x": karakterKonumu.x,
              "--kare-y": karakterKonumu.y,
            } as React.CSSProperties
          }
        >
          <KarakterSimgesi yon={karakterKonumu.bakis} poz={poz} palet={palet} />
        </g>
      </g>
    </svg>
  );
}
