// Depoya kaynagi belirsiz veya bozuk bir boyama sayfasi girmesini engeller.
// Calistirmak icin: npm run kontrol
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

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

if (hatalar.length > 0) {
  console.error("Kontrol basarisiz:\n");
  for (const hata of hatalar) console.error("  - " + hata);
  process.exit(1);
}

console.log(`Kontrol tamam: ${katalog.length} boyama sayfasi dogrulandi.`);
