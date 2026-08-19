// Programi haritada calistirir.
//
// Bu fonksiyon animasyon degil VERI dondurur: adim adim ne oldugunun listesi.
// Bileseni ilgilendiren tek sey o listeyi sirayla oynatmaktir. Boylece
// "Turna hedefe vardi mi, kac adimda vardi" sorulari tarayici acmadan test
// edilir.
import {
  komsuKare,
  saatTersine,
  saatYonunde,
  type Komut,
  type Yon,
} from "./komutlar";
import {
  engelMi,
  haritaDisiMi,
  kareAnahtari,
  kareEsit,
  type Harita,
  type Kare,
} from "./harita";

export type Adim = {
  /** Bu adimi ureten blogun program icindeki sirasi. Arayuz onu vurgular. */
  blokSirasi: number;
  turna: { x: number; y: number; bakis: Yon };
  olay: "yurudu" | "dondu" | "carpti" | "topladi" | "vardi";
};

export type Sonuc = {
  adimlar: Adim[];
  basarili: boolean;
};

export function calistir(program: Komut[], harita: Harita): Sonuc {
  let kare: Kare = harita.baslangic;
  let bakis: Yon = harita.bakis;
  const toplananlar = new Set<string>();
  const adimlar: Adim[] = [];

  const adimEkle = (blokSirasi: number, olay: Adim["olay"]) => {
    adimlar.push({ blokSirasi, turna: { x: kare.x, y: kare.y, bakis }, olay });
  };

  const hepsiToplandi = () => toplananlar.size === harita.basaklar.length;

  for (let sira = 0; sira < program.length; sira++) {
    const komut = program[sira];

    if (komut.tur === "don") {
      bakis = komut.yon === "sag" ? saatYonunde(bakis) : saatTersine(bakis);
      adimEkle(sira, "dondu");
      continue;
    }

    // "git" mutlak yon verir ve Turna o yone doner; "ileri" baktigi yone yurur.
    if (komut.tur === "git") bakis = komut.yon;
    const hedefKare = komsuKare(kare, bakis);

    // Carpma cezalandirilmaz: komut etkisiz kalir, program devam eder.
    if (haritaDisiMi(harita, hedefKare) || engelMi(harita, hedefKare)) {
      adimEkle(sira, "carpti");
      continue;
    }

    kare = hedefKare;
    adimEkle(sira, "yurudu");

    const basakVar = harita.basaklar.some((basak) => kareEsit(basak, kare));
    if (basakVar && !toplananlar.has(kareAnahtari(kare))) {
      toplananlar.add(kareAnahtari(kare));
      adimEkle(sira, "topladi");
    }

    if (kareEsit(kare, harita.hedef) && hepsiToplandi()) {
      adimEkle(sira, "vardi");
      return { adimlar, basarili: true };
    }
  }

  return { adimlar, basarili: false };
}
