// Programi haritada calistirir.
//
// Bu fonksiyon animasyon degil VERI dondurur: adim adim ne oldugunun listesi.
// Bileseni ilgilendiren tek sey o listeyi sirayla oynatmaktir. Boylece
// "Karakter hedefe vardi mi, kac adimda vardi" sorulari tarayici acmadan test
// edilir.
import {
  komsuKare,
  saatTersine,
  saatYonunde,
  type Komut,
  type Yon,
} from "./komutlar";
import type { Blok, BlokYolu } from "../program";
import {
  engelMi,
  haritaDisiMi,
  kareAnahtari,
  kareEsit,
  type Harita,
  type Kare,
} from "./harita";

export type Adim = {
  /** Bu adimi ureten blogun program icindeki YOLU. Arayuz onu vurgular. */
  blokYolu: BlokYolu;
  karakter: { x: number; y: number; bakis: Yon };
  olay: "yurudu" | "dondu" | "carpti" | "topladi" | "vardi";
};

export type Sonuc = {
  adimlar: Adim[];
  basarili: boolean;
};

export function calistir(program: Blok[], harita: Harita): Sonuc {
  let kare: Kare = harita.baslangic;
  let bakis: Yon = harita.bakis;
  const toplananlar = new Set<string>();
  const adimlar: Adim[] = [];

  const adimEkle = (blokYolu: BlokYolu, olay: Adim["olay"]) => {
    adimlar.push({ blokYolu, karakter: { x: kare.x, y: kare.y, bakis }, olay });
  };

  const hepsiToplandi = () => toplananlar.size === harita.basaklar.length;

  // true donerse hedefe varildi ve program biter.
  const komutuYurut = (komut: Komut, yol: BlokYolu): boolean => {
    if (komut.tur === "don") {
      bakis = komut.yon === "sag" ? saatYonunde(bakis) : saatTersine(bakis);
      adimEkle(yol, "dondu");
      return false;
    }

    // "git" mutlak yon verir ve karakter o yone doner; "ileri" baktigi yone yurur.
    if (komut.tur === "git") bakis = komut.yon;
    const hedefKare = komsuKare(kare, bakis);

    // Carpma cezalandirilmaz: komut etkisiz kalir, program devam eder.
    if (haritaDisiMi(harita, hedefKare) || engelMi(harita, hedefKare)) {
      adimEkle(yol, "carpti");
      return false;
    }

    kare = hedefKare;
    adimEkle(yol, "yurudu");

    const basakVar = harita.basaklar.some((basak) => kareEsit(basak, kare));
    if (basakVar && !toplananlar.has(kareAnahtari(kare))) {
      toplananlar.add(kareAnahtari(kare));
      adimEkle(yol, "topladi");
    }

    if (kareEsit(kare, harita.hedef) && hepsiToplandi()) {
      adimEkle(yol, "vardi");
      return true;
    }

    return false;
  };

  for (let ust = 0; ust < program.length; ust++) {
    const blok = program[ust];

    if (blok.tur === "komut") {
      if (komutuYurut(blok.komut, { ust, ic: null })) return { adimlar, basarili: true };
      continue;
    }

    // Dongu, govdeyi kez defa ACARAK yurur; uretilen Adim listesi duz
    // programdakiyle ayni bicimdedir, sahne ve oynatma degismez.
    for (let sayac = 0; sayac < blok.kez; sayac++) {
      for (let ic = 0; ic < blok.govde.length; ic++) {
        if (komutuYurut(blok.govde[ic].komut, { ust, ic })) return { adimlar, basarili: true };
      }
    }
  }

  return { adimlar, basarili: false };
}
