// Kilimin Izi kursunun icerigini uretir: motifleri PROGRAMDAN cizer,
// idealAdim'i cozucuye hesaplatir ve content/kodla/kilimin-izi.json'u yazar.
//
// Calistirmak icin: npm run uret
//
// Neden uretiliyor da elle yazilmiyor: bir desenin kenar listesini elle
// yazmak kolayca CIZILEMEZ bir sekil uretir (kus o kenarlari tek hatta
// dolasamaz). Motifi ureten programdan cizmek, hedefin cizilebilir
// oldugunu tanim geregi garanti eder. Yeni motif eklemek asagidaki
// listeye bir satir eklemektir.
import { writeFileSync } from "node:fs";
import { ciz } from "../lib/kodla/desen/ciz";
import { deseniCoz, type DesenVerisi } from "../lib/kodla/desen/desen";
import { enKisaDesenCozumu } from "../lib/kodla/desen/cozucu";
import { anahtarKomutu, type Yon } from "../lib/kodla/labirent/komutlar";
import { blokSayisi, komutBloku, type Blok } from "../lib/kodla/program";

type Motif = {
  genislik: number;
  yukseklik: number;
  baslangic: { x: number; y: number; bakis: Yon };
  kez: number;
  govde: string[];
};

/**
 * Motifi programindan cizer.
 *
 * Hedef olarak IZGARANIN BUTUN KENARLARI veriliyor: ciz() desen tamamlanir
 * tamamlanmaz programi durdurur, tek kenarlik bir yer tutucu verilseydi
 * program ilk hamlede biterdi (ve bir motif "tek cizgi" olarak uretilirdi).
 */
function tumKenarlar(genislik: number, yukseklik: number): string[] {
  const kenarlar: string[] = [];
  for (let y = 0; y < yukseklik; y++) {
    for (let x = 0; x < genislik; x++) {
      if (x + 1 < genislik) kenarlar.push(`${x},${y} ${x + 1},${y}`);
      if (y + 1 < yukseklik) kenarlar.push(`${x},${y} ${x},${y + 1}`);
    }
  }
  return kenarlar;
}

function motifKenarlari(motif: Motif): string[] {
  const bos: DesenVerisi = { ...motif, kenarlar: tumKenarlar(motif.genislik, motif.yukseklik) };
  const program: Blok[] = [
    { tur: "tekrar", kez: motif.kez, govde: motif.govde.map((a) => komutBloku(anahtarKomutu(a)!)) },
  ];
  return ciz(program, deseniCoz(bos)).cizilenler;
}

type BulmacaTanimi = {
  motif: Motif;
  sinir: number;
  asama?: "hazir" | "oneri" | "serbest";
  hazir?: (string | { kez: number; govde: string[] })[];
};

function bulmacaUret(tanim: BulmacaTanimi) {
  const kenarlar = motifKenarlari(tanim.motif);
  const desen = deseniCoz({ ...tanim.motif, kenarlar });
  const cozum = enKisaDesenCozumu(desen, "donusler", tanim.sinir);
  if (cozum === null) throw new Error(`Cozum yok: ${JSON.stringify(tanim.motif)}`);
  const bulmaca: Record<string, unknown> = {
    komutSeti: "donusler",
    idealAdim: blokSayisi(cozum),
  };
  if (tanim.asama) bulmaca.kucak = { asama: tanim.asama };
  if (tanim.hazir) bulmaca.baslangicProgrami = tanim.hazir;
  bulmaca.enFazlaBlok = tanim.sinir;
  bulmaca.desen = {
    genislik: tanim.motif.genislik,
    yukseklik: tanim.motif.yukseklik,
    baslangic: tanim.motif.baslangic,
    kenarlar,
  };
  return bulmaca;
}

const CIZGI: Motif = { genislik: 4, yukseklik: 2, baslangic: { x: 0, y: 1, bakis: "sag" }, kez: 3, govde: ["ileri"] };
const UZUN_CIZGI: Motif = { genislik: 5, yukseklik: 2, baslangic: { x: 0, y: 1, bakis: "sag" }, kez: 4, govde: ["ileri"] };
const KARE: Motif = { genislik: 3, yukseklik: 3, baslangic: { x: 0, y: 2, bakis: "sag" }, kez: 4, govde: ["ileri", "don:sol"] };
const BUYUK_KARE: Motif = { genislik: 3, yukseklik: 3, baslangic: { x: 0, y: 2, bakis: "sag" }, kez: 4, govde: ["ileri", "ileri", "don:sol"] };
const DEV_KARE: Motif = { genislik: 4, yukseklik: 4, baslangic: { x: 0, y: 3, bakis: "sag" }, kez: 4, govde: ["ileri", "ileri", "ileri", "don:sol"] };
const MERDIVEN: Motif = { genislik: 4, yukseklik: 4, baslangic: { x: 0, y: 3, bakis: "sag" }, kez: 3, govde: ["ileri", "don:sol", "ileri", "don:sag"] };
const CIFTE_MERDIVEN: Motif = { genislik: 5, yukseklik: 5, baslangic: { x: 0, y: 4, bakis: "sag" }, kez: 4, govde: ["ileri", "don:sol", "ileri", "don:sag"] };
const KANCA: Motif = { genislik: 4, yukseklik: 4, baslangic: { x: 0, y: 3, bakis: "yukari" }, kez: 3, govde: ["ileri", "ileri", "don:sag"] };
const KANCA_SOL: Motif = { genislik: 4, yukseklik: 4, baslangic: { x: 3, y: 3, bakis: "yukari" }, kez: 3, govde: ["ileri", "ileri", "don:sol"] };
const INIS_MERDIVEN: Motif = { genislik: 4, yukseklik: 4, baslangic: { x: 0, y: 0, bakis: "sag" }, kez: 3, govde: ["ileri", "don:sag", "ileri", "don:sol"] };

const bolumler = [
  {
    id: "iznik",
    ad: "İznik",
    mekanik: "desen",
    tema: "beyaz",
    durak: { x: 21, y: 29 },
    ipucu: "İznik çinisi beş yüz yıldır aynı mavi beyazla tekrarlanan desenlerden yapılır.",
    bulmacalar: [
      bulmacaUret({ motif: CIZGI, sinir: 2, asama: "hazir", hazir: [{ kez: 3, govde: [] }] }),
      bulmacaUret({ motif: KARE, sinir: 3, asama: "hazir", hazir: [{ kez: 4, govde: [] }] }),
      bulmacaUret({ motif: UZUN_CIZGI, sinir: 3, asama: "oneri" }),
      bulmacaUret({ motif: BUYUK_KARE, sinir: 4, asama: "serbest" }),
    ],
  },
  {
    id: "kutahya",
    ad: "Kütahya",
    mekanik: "desen",
    tema: "bozkir",
    durak: { x: 22, y: 44 },
    ipucu: "Kütahya'nın çini atölyeleri motifi bir kez çizer, sonra tekrar tekrar tekrarlar.",
    bulmacalar: [
      bulmacaUret({ motif: BUYUK_KARE, sinir: 4, asama: "serbest" }),
      bulmacaUret({ motif: DEV_KARE, sinir: 5, asama: "serbest" }),
      bulmacaUret({ motif: KANCA, sinir: 4, asama: "serbest" }),
      bulmacaUret({ motif: KANCA_SOL, sinir: 4, asama: "serbest" }),
    ],
  },
  {
    id: "usak",
    ad: "Uşak",
    mekanik: "desen",
    tema: "kayalik",
    durak: { x: 20, y: 56 },
    ipucu: "Uşak halılarının yıldızlı göbeği yüzyıllardır Avrupa saraylarında serilidir.",
    bulmacalar: [
      bulmacaUret({ motif: MERDIVEN, sinir: 5, asama: "serbest" }),
      bulmacaUret({ motif: INIS_MERDIVEN, sinir: 5, asama: "serbest" }),
      bulmacaUret({ motif: CIFTE_MERDIVEN, sinir: 5, asama: "serbest" }),
      // Bozuk program: kucak hazir ama tekrar sayisi eksik.
      bulmacaUret({
        motif: KARE,
        sinir: 3,
        asama: "hazir",
        hazir: [{ kez: 2, govde: ["ileri", "don:sol"] }],
      }),
    ],
  },
  {
    id: "milas",
    ad: "Milas",
    mekanik: "desen",
    tema: "antiktas",
    durak: { x: 11, y: 77 },
    ipucu: "Milas kilimlerinde tekrar eden kanca motifi 'bereket' anlamına gelir.",
    bulmacalar: [
      bulmacaUret({ motif: DEV_KARE, sinir: 5, asama: "serbest" }),
      // Bozuk program: govdedeki donus yanlis yone.
      bulmacaUret({
        motif: MERDIVEN,
        sinir: 5,
        asama: "hazir",
        hazir: [{ kez: 3, govde: ["ileri", "don:sag", "ileri", "don:sag"] }],
      }),
      bulmacaUret({ motif: CIFTE_MERDIVEN, sinir: 5, asama: "serbest" }),
      bulmacaUret({ motif: KANCA_SOL, sinir: 4, asama: "serbest" }),
    ],
  },
];

writeFileSync("content/kodla/kilimin-izi.json", JSON.stringify(bolumler, null, 2) + "\n");
console.log(
  "yazildi:",
  bolumler.map((b) => `${b.id}(${b.bulmacalar.length})`).join(" "),
  "- toplam",
  bolumler.reduce((t, b) => t + b.bulmacalar.length, 0),
);
