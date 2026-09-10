// Programi desen izgarasinda calistirir.
//
// Labirentteki calistir()'in karsiligi: animasyon degil VERI dondurur,
// adim adim ne oldugunun listesi. Onizleme ile gercek kosu ayni
// fonksiyondan uretilir, boylece ayrisamazlar.
import { komsuKare, saatTersine, saatYonunde, type Komut, type Yon } from "../labirent/komutlar";
import type { Blok, BlokYolu } from "../program";
import { kenarAnahtari, type Desen, type Kose } from "./desen";

export type CizimAdimi = {
  blokYolu: BlokYolu;
  karakter: { x: number; y: number; bakis: Yon };
  olay: "cizdi" | "dondu" | "carpti" | "bitti";
  /** "cizdi" adiminda cizilen kenarin anahtari. */
  kenar?: string;
};

export type CizimSonucu = {
  adimlar: CizimAdimi[];
  /** Cizilen butun kenarlar (hedefte olmayanlar dahil). */
  cizilenler: string[];
  basarili: boolean;
};

/** Kose izgaranin icinde mi. */
function icerideMi(desen: Desen, kose: Kose): boolean {
  return kose.x >= 0 && kose.x < desen.genislik && kose.y >= 0 && kose.y < desen.yukseklik;
}

export function ciz(program: Blok[], desen: Desen): CizimSonucu {
  let kose: Kose = { x: desen.baslangic.x, y: desen.baslangic.y };
  let bakis: Yon = desen.baslangic.bakis;
  const cizilenler = new Set<string>();
  const adimlar: CizimAdimi[] = [];

  const adimEkle = (blokYolu: BlokYolu, olay: CizimAdimi["olay"], kenar?: string) => {
    adimlar.push({ blokYolu, karakter: { x: kose.x, y: kose.y, bakis }, olay, kenar });
  };

  const desenTamam = () => [...desen.kenarlar].every((kenar) => cizilenler.has(kenar));

  // true donerse desen tamamlandi ve program biter.
  const komutuYurut = (komut: Komut, yol: BlokYolu): boolean => {
    if (komut.tur === "don") {
      bakis = komut.yon === "sag" ? saatYonunde(bakis) : saatTersine(bakis);
      adimEkle(yol, "dondu");
      return false;
    }

    // Cizimde mutlak yon komutu yoktur ama motor onu da yurutebilir:
    // "git" baktigi yonu degistirip yurur.
    if (komut.tur === "git") bakis = komut.yon;
    const hedef = komsuKare(kose, bakis);

    // Izgara disina cikmak cezalandirilmaz: komut etkisiz kalir, program
    // devam eder (labirentteki carpma kuralinin aynisi).
    if (!icerideMi(desen, hedef)) {
      adimEkle(yol, "carpti");
      return false;
    }

    const kenar = kenarAnahtari(kose, hedef);
    cizilenler.add(kenar);
    kose = hedef;
    adimEkle(yol, "cizdi", kenar);

    if (desenTamam()) {
      adimEkle(yol, "bitti");
      return true;
    }
    return false;
  };

  for (let ust = 0; ust < program.length; ust++) {
    const blok = program[ust];

    if (blok.tur === "komut") {
      if (komutuYurut(blok.komut, { ust, ic: null })) {
        return { adimlar, cizilenler: [...cizilenler], basarili: true };
      }
      continue;
    }

    for (let sayac = 0; sayac < blok.kez; sayac++) {
      for (let ic = 0; ic < blok.govde.length; ic++) {
        if (komutuYurut(blok.govde[ic].komut, { ust, ic })) {
          return { adimlar, cizilenler: [...cizilenler], basarili: true };
        }
      }
    }
  }

  return { adimlar, cizilenler: [...cizilenler], basarili: desenTamam() };
}
