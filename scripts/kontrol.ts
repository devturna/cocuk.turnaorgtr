// Depoya kaynagi belirsiz veya bozuk bir boyama sayfasi girmesini engeller.
// Calistirmak icin: npm run kontrol
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { haritayiCoz } from "../lib/kodla/labirent/harita";
import { enKisaCozum } from "../lib/kodla/labirent/cozucu";
import type { KomutSeti, Yon } from "../lib/kodla/labirent/komutlar";
import { KOMUT_SETLERI } from "../lib/kodla/labirent/komutlar";
import { TEMALAR } from "../lib/kodla/labirent/temalar";
import { EN_FAZLA_BLOK } from "../lib/kodla/program";

type Girdi = Record<string, unknown>;

const KOK = process.cwd();
const SVG_KLASORU = join(KOK, "public", "boyama");
const ZORUNLU_ALANLAR = ["id", "ad", "kategori", "dosya", "lisans", "kaynak", "kaynakUrl"];

const hatalar: string[] = [];

const katalog = JSON.parse(
  readFileSync(join(KOK, "content", "boyama-katalogu.json"), "utf8"),
) as Girdi[];

const gorulenKimlikler = new Set<string>();
const katalogDosyalari = new Set<string>();

for (const girdi of katalog) {
  const kimlik = String(girdi.id ?? "(kimliksiz)");

  for (const alan of ZORUNLU_ALANLAR) {
    const deger = girdi[alan];
    if (typeof deger !== "string" || deger.trim() === "") {
      hatalar.push(`${kimlik}: "${alan}" alani bos veya eksik`);
    }
  }

  if (gorulenKimlikler.has(kimlik)) hatalar.push(`${kimlik}: bu kimlik birden fazla kez kullanilmis`);
  gorulenKimlikler.add(kimlik);

  const dosyaAdi = String(girdi.dosya ?? "");
  katalogDosyalari.add(dosyaAdi);

  let svg: string;
  try {
    svg = readFileSync(join(SVG_KLASORU, dosyaAdi), "utf8");
  } catch {
    hatalar.push(`${kimlik}: "${dosyaAdi}" dosyasi public/boyama altinda bulunamadi`);
    continue;
  }

  if (!svg.includes('class="boyanabilir"')) {
    hatalar.push(
      `${kimlik}: hic boyanabilir bolge yok. ` +
        `Hazirlama adimlari icin docs/boyama-sayfasi-hazirlama.md dosyasina bak.`,
    );
  }
  if (!/viewBox="[^"]+"/.test(svg)) {
    hatalar.push(`${kimlik}: SVG'de viewBox yok, tuval olceklenemez`);
  }
}

// Klasorde durup katalogda olmayan dosyalar lisanssiz gorsel demektir.
for (const dosya of readdirSync(SVG_KLASORU)) {
  if (dosya.endsWith(".svg") && !katalogDosyalari.has(dosya)) {
    hatalar.push(`${dosya}: dosya var ama katalogda kaydi yok`);
  }
}

// --- Kodlama bolumu ---
//
// Cozulemeyen ya da idealAdim degeri yanlis olan bir bolum depoya girmemeli.
// Boyama tarafindaki "her resmin her bolgesi boyanabiliyor mu" denetiminin
// karsiligi budur.
const KODLA_KLASORU = join(KOK, "content", "kodla");
const KURS_ZORUNLU = ["id", "ad", "yas", "ikon", "durum"];
const BOLUM_ZORUNLU = ["id", "ad", "mekanik", "komutSeti", "tema", "ipucu"];
// Derive valid command set names from the runtime record, not a static copy.
const KOMUT_SETLERI_ADLARI = Object.keys(KOMUT_SETLERI);
// Valid directions for harita.bakis are hard-coded here: the Yon type union
// is not enumerable at runtime, and SAAT_SIRASI is not exported from komutlar.
const GECERLI_YONLER: Yon[] = ["yukari", "asagi", "sol", "sag"];

const kurslar = JSON.parse(
  readFileSync(join(KODLA_KLASORU, "kurslar.json"), "utf8"),
) as Girdi[];

let denetlenenBolum = 0;
const gorulenKurslar = new Set<string>();

for (const kurs of kurslar) {
  const kursId = String(kurs.id ?? "(kimliksiz)");

  for (const alan of KURS_ZORUNLU) {
    const deger = kurs[alan];
    if (typeof deger !== "string" || deger.trim() === "") {
      hatalar.push(`kurs ${kursId}: "${alan}" alani bos veya eksik`);
    }
  }
  if (gorulenKurslar.has(kursId)) hatalar.push(`kurs ${kursId}: kimlik birden fazla kez kullanilmis`);
  gorulenKurslar.add(kursId);

  if (kurs.durum !== "yayinda" && kurs.durum !== "yakinda") {
    hatalar.push(`kurs ${kursId}: "durum" yalnizca "yayinda" veya "yakinda" olabilir`);
  }
  // Yakinda olan kursun icerik dosyasi henuz olmayabilir.
  if (kurs.durum !== "yayinda") continue;

  let bolumler: Girdi[];
  try {
    bolumler = JSON.parse(readFileSync(join(KODLA_KLASORU, `${kursId}.json`), "utf8")) as Girdi[];
  } catch {
    hatalar.push(`kurs ${kursId}: content/kodla/${kursId}.json bulunamadi`);
    continue;
  }

  if (bolumler.length === 0) {
    hatalar.push(`kurs ${kursId}: yayindaki kursun en az bir bolumu olmali`);
  }

  const gorulenBolumler = new Set<string>();

  for (const bolum of bolumler) {
    const bolumId = `${kursId}/${String(bolum.id ?? "(kimliksiz)")}`;
    denetlenenBolum++;

    for (const alan of BOLUM_ZORUNLU) {
      const deger = bolum[alan];
      if (typeof deger !== "string" || deger.trim() === "") {
        hatalar.push(`${bolumId}: "${alan}" alani bos veya eksik`);
      }
    }

    if (gorulenBolumler.has(String(bolum.id))) {
      hatalar.push(`${bolumId}: kimlik bu kursta birden fazla kez kullanilmis`);
    }
    gorulenBolumler.add(String(bolum.id));

    if (bolum.mekanik !== "labirent") {
      hatalar.push(`${bolumId}: bilinmeyen mekanik "${String(bolum.mekanik)}"`);
      continue;
    }
    if (!KOMUT_SETLERI_ADLARI.includes(String(bolum.komutSeti))) {
      hatalar.push(`${bolumId}: "komutSeti" yonler veya donusler olmali`);
      continue;
    }
    if (!Object.keys(TEMALAR).includes(String(bolum.tema))) {
      hatalar.push(
        `${bolumId}: "${String(bolum.tema)}" temasi tanimli degil ` +
          `(lib/kodla/labirent/temalar.ts icinde tanimla)`,
      );
    }

    const durak = bolum.durak as { x?: unknown; y?: unknown } | undefined;
    for (const eksen of ["x", "y"] as const) {
      const deger = durak?.[eksen];
      if (typeof deger !== "number" || deger < 0 || deger > 100) {
        hatalar.push(`${bolumId}: durak.${eksen} 0-100 arasi bir sayi olmali`);
      }
    }

    const haritaVerisi = bolum.harita as { bakis?: unknown; satirlar?: unknown } | undefined;
    if (!Array.isArray(haritaVerisi?.satirlar)) {
      hatalar.push(`${bolumId}: "harita.satirlar" bir dizi olmali`);
      continue;
    }

    if (!GECERLI_YONLER.includes(haritaVerisi.bakis as Yon)) {
      hatalar.push(`${bolumId}: "harita.bakis" gecersiz yon "${String(haritaVerisi.bakis)}"`);
      continue;
    }

    let harita;
    try {
      harita = haritayiCoz(haritaVerisi.satirlar as string[], haritaVerisi.bakis as never);
    } catch (sorun) {
      hatalar.push(`${bolumId}: ${(sorun as Error).message}`);
      continue;
    }

    const enKisa = enKisaCozum(harita, bolum.komutSeti as KomutSeti);
    if (enKisa === null) {
      hatalar.push(`${bolumId}: bu bolumun cozumu yok, Turna hedefe ulasamiyor`);
      continue;
    }
    if (bolum.idealAdim !== enKisa) {
      hatalar.push(`${bolumId}: idealAdim ${String(bolum.idealAdim)} yazilmis ama en kisa cozum ${enKisa} adim`);
    }
    if (enKisa > EN_FAZLA_BLOK) {
      hatalar.push(`${bolumId}: en kisa cozum ${enKisa} adim, program siniri ${EN_FAZLA_BLOK} blok`);
    }
  }
}

if (hatalar.length > 0) {
  console.error("Kontrol basarisiz:\n");
  for (const hata of hatalar) console.error("  - " + hata);
  process.exit(1);
}

console.log(
  `Kontrol tamam: ${katalog.length} boyama sayfasi ve ${denetlenenBolum} kodlama bolumu dogrulandi.`,
);
