// Depoya kaynagi belirsiz veya bozuk bir boyama sayfasi girmesini engeller.
// Calistirmak icin: npm run kontrol
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import ts from "typescript";
import { haritayiCoz } from "../lib/kodla/labirent/harita";
import { enKisaCozum } from "../lib/kodla/labirent/cozucu";
import type { KomutSeti, Yon } from "../lib/kodla/labirent/komutlar";
import { KOMUT_SETLERI } from "../lib/kodla/labirent/komutlar";
import { TEMALAR } from "../lib/kodla/labirent/temalar";
import { EN_FAZLA_BLOK } from "../lib/kodla/program";
// Uygulama icerigi lib/kodla/bolumler.ts icindeki KURS_BOLUMLERI kaydi
// uzerinden okur; bu dosya "yayinda" kurslari kendi tarafindan JSON'dan
// okur. Iki taraf ayni kurs kimligini gormezse yayinlanan bir kurs bos bir
// harita olarak sitede belirir, hicbir hata vermeden. Asagidaki kontrol bu
// kaymayi yakalar.
import { kursBolumleri } from "../lib/kodla/bolumler";

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
// Gecerli komut seti adlari calisma zamanindaki KOMUT_SETLERI kaydindan
// turetilir, elle tutulan ayri bir liste degil: boylece denetim
// kutuphaneden asla sapamaz.
const KOMUT_SETLERI_ADLARI = Object.keys(KOMUT_SETLERI);
// harita.bakis icin gecerli yonler burada sabit yazilir: Yon tip birlesimi
// calisma zamaninda listelenemez, SAAT_SIRASI de komutlar.ts disina acilmaz.
// Bu liste olmadan yanlis yazilmis (typo) bir bakis degeri sessizce
// varsayilan bir yone dusebilir; liste boyle bir kaymayi denetimde yakalar.
const GECERLI_YONLER: Yon[] = ["yukari", "asagi", "sol", "sag"];

// durak.x/y'nin sadece 0-100 araliginda olmasi yetmez: bir durak bu
// aralikta ama denizde de olabilir (bir kez, bu fazda, elle bakilarak
// yakalandi). Asagidaki kontrol public/kodla/turkiye.svg'deki kara
// parcasi(lari)na karsi bir "nokta poligon icinde mi" (ray casting)
// testi calistirir. Bir bolum "denizde" bulunursa denetim duragin adini
// vererek reddeder.
type Nokta = { x: number; y: number };

// SVG path'inin "d" ozniteligi tek harf komutu olmadan (M x y x y ... Z M
// ...) yaziliyor: M'den sonraki her sayi cifti dolayli bir L (cizgi)
// komutudur. Egri yok, bu yuzden ayristirma basit: her alt yolu (Z ile
// ayrilmis) kendi nokta listesine cevir.
function svgYolunuPoligonlaraCevir(d: string): Nokta[][] {
  const altYollar = d
    .split(/[Zz]/)
    .map((parca) => parca.trim())
    .filter(Boolean);

  return altYollar.map((altYol) => {
    const sayilar = altYol
      .replace(/^[Mm]/, "")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const noktalar: Nokta[] = [];
    for (let i = 0; i + 1 < sayilar.length; i += 2) {
      noktalar.push({ x: sayilar[i], y: sayilar[i + 1] });
    }
    return noktalar;
  });
}

// Standart ray-casting: noktadan saga dogru cizilen isinin poligonun kac
// kenariyla kesistigini sayar; tek sayida kesisim ise nokta icindedir.
function noktaPoligondaMi(nokta: Nokta, poligon: Nokta[]): boolean {
  let icinde = false;
  for (let i = 0, j = poligon.length - 1; i < poligon.length; j = i++) {
    const a = poligon[i];
    const b = poligon[j];
    const kesisiyorMu =
      a.y > nokta.y !== b.y > nokta.y &&
      nokta.x < ((b.x - a.x) * (nokta.y - a.y)) / (b.y - a.y) + a.x;
    if (kesisiyorMu) icinde = !icinde;
  }
  return icinde;
}

const TURKIYE_SVG_YOLU = join(KOK, "public", "kodla", "turkiye.svg");
const turkiyeSvg = readFileSync(TURKIYE_SVG_YOLU, "utf8");
const turkiyeViewBox = turkiyeSvg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
const turkiyeGenislik = turkiyeViewBox ? Number(turkiyeViewBox[1]) : 1000;
const turkiyeYukseklik = turkiyeViewBox ? Number(turkiyeViewBox[2]) : 422;
const turkiyeDEslesme = turkiyeSvg.match(/<path\s[^>]*\bd="([^"]+)"/);
const TURKIYE_POLIGONLARI = turkiyeDEslesme
  ? svgYolunuPoligonlaraCevir(turkiyeDEslesme[1])
  : [];

function durakKaradaMi(x: number, y: number): boolean {
  const nokta = { x: (x / 100) * turkiyeGenislik, y: (y / 100) * turkiyeYukseklik };
  return TURKIYE_POLIGONLARI.some((poligon) => noktaPoligondaMi(nokta, poligon));
}

const kurslar = JSON.parse(
  readFileSync(join(KODLA_KLASORU, "kurslar.json"), "utf8"),
) as Girdi[];

const karakterKatalogu = JSON.parse(
  readFileSync(join(KODLA_KLASORU, "karakterler.json"), "utf8"),
) as Record<string, unknown[]>;

let denetlenenBolum = 0;
let denetlenenKarakter = 0;
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

  const karakterler = (karakterKatalogu[kursId] ?? []) as Girdi[];
  if (karakterler.length === 0) {
    hatalar.push(
      `kurs ${kursId}: yayindaki kursun en az bir karakteri olmali ` +
        `(content/kodla/karakterler.json icine ekle)`,
    );
  }

  const gorulenKarakterler = new Set<string>();
  for (const karakter of karakterler) {
    const kimlik = `${kursId}/${String(karakter.id ?? "(kimliksiz)")}`;
    denetlenenKarakter++;

    for (const alan of ["id", "ad", "bilgi"]) {
      const deger = karakter[alan];
      if (typeof deger !== "string" || deger.trim() === "") {
        hatalar.push(`karakter ${kimlik}: "${alan}" alani bos veya eksik`);
      }
    }

    if (gorulenKarakterler.has(String(karakter.id))) {
      hatalar.push(`karakter ${kimlik}: kimlik bu kursta birden fazla kez kullanilmis`);
    }
    gorulenKarakterler.add(String(karakter.id));

    const palet = karakter.palet as Record<string, unknown> | undefined;
    for (const alan of ["govde", "gaga", "bacak"]) {
      const renk = palet?.[alan];
      if (typeof renk !== "string" || !/^#[0-9a-f]{6}$/i.test(renk)) {
        hatalar.push(`karakter ${kimlik}: palet.${alan} "#rrggbb" biciminde olmali`);
      }
    }
  }

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

  // lib/kodla/bolumler.ts kursBolumleri() bilinmeyen bir kurs kimligi icin
  // hata atmaz, sessizce bos dizi doner (KURS_BOLUMLERI[kursId] ?? []).
  // Bu yuzden "kayit yok" ile "gercekten bolumu yok" ayni sekilde gorunur;
  // ilkini burada ayirt ediyoruz.
  if (kursBolumleri(kursId).length === 0) {
    hatalar.push(
      `kurs ${kursId}: durum "yayinda" ama lib/kodla/bolumler.ts icindeki ` +
        `KURS_BOLUMLERI kaydinda "${kursId}" yok. content/kodla/${kursId}.json ` +
        `dosyasini import edip KURS_BOLUMLERI nesnesine "${kursId}" anahtariyla ` +
        `ekleyin ("turna-yolu" girdisiyle ayni desen). Eklenmezse ` +
        `generateStaticParams bu kursun sayfalarini hic uretmez ve site bos ` +
        `bir haritayla yayina cikar.`,
    );
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
    let durakKonumuGecerli = true;
    for (const eksen of ["x", "y"] as const) {
      const deger = durak?.[eksen];
      if (typeof deger !== "number" || deger < 0 || deger > 100) {
        hatalar.push(`${bolumId}: durak.${eksen} 0-100 arasi bir sayi olmali`);
        durakKonumuGecerli = false;
      }
    }
    // Poligon testi yalnizca gecerli (0-100) bir konumla anlamli.
    if (durakKonumuGecerli && !durakKaradaMi(durak!.x as number, durak!.y as number)) {
      hatalar.push(
        `${bolumId}: durak (x=${String(durak?.x)}, y=${String(durak?.y)}) turkiye.svg'deki ` +
          `kara parcasinin disinda gorunuyor (denizde olabilir)`,
      );
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

// --- Turkce karakter denetimi (kod/yorum) ---
//
// Gelistirici rehberi kurali: tanimlayicilar ve yorumlar Turkce
// KARAKTERSIZ yazilir (bolgeyiDoldur, fircaCizgileri gibi), kullaniciya
// gorunen metinler ise TAM Turkcedir. Ikisini ayirmak icin gercek
// TypeScript/TSX ayristiricisini (derleme zamaninda zaten bagimlilik olan
// "typescript" paketi) kullaniyoruz: elle yazilmis bir regex, JSX
// metnini (duz Turkce metin icerebilir) kod/tanimlayicidan guvenilir
// bicimde ayiramaz (ozellikle bir JSX ifadesiyle { } karisik metinlerde,
// ornegin `{kurs.yas} yas` gibi). Ayristirici agacinda StringLiteral,
// TemplateHead/Middle/Tail, JsxText ve RegularExpressionLiteral
// dugumleri (kullaniciya gorunen metin veya gercek arayuz metnini
// eslestiren test duzenli ifadeleri) MUAF tutulur; geri kalan her
// yaprak dugum (tanimlayicilar, anahtar kelimeler) ve her yorum
// denetlenir. Boylece "her seyi Turkce karakter icin tara" gibi kaba bir
// kurala kiyasla yanlis alarm vermez.
const TURKCE_KARAKTER = /[çğıöşüÇĞİÖŞÜ]/;

function dosyalariTara(kok: string, uzantilar: string[]): string[] {
  const sonuc: string[] = [];
  for (const ad of readdirSync(kok)) {
    const tamYol = join(kok, ad);
    const bilgi = statSync(tamYol);
    if (bilgi.isDirectory()) {
      sonuc.push(...dosyalariTara(tamYol, uzantilar));
    } else if (uzantilar.includes(extname(tamYol))) {
      sonuc.push(tamYol);
    }
  }
  return sonuc;
}

function turkceIhlalleriBul(dosyaYolu: string): string[] {
  const kaynak = readFileSync(dosyaYolu, "utf8");
  const scriptTuru = dosyaYolu.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const kaynakDosya = ts.createSourceFile(
    dosyaYolu,
    kaynak,
    ts.ScriptTarget.Latest,
    true,
    scriptTuru,
  );
  const ihlaller: string[] = [];
  const bildirilenYorumlar = new Set<number>();

  function satirNoVer(konum: number): number {
    return kaynakDosya.getLineAndCharacterOfPosition(konum).line + 1;
  }

  function dugumDenetle(dugum: ts.Node) {
    const yorumAralikari = ts.getLeadingCommentRanges(kaynak, dugum.getFullStart()) ?? [];
    for (const aralik of yorumAralikari) {
      if (bildirilenYorumlar.has(aralik.pos)) continue;
      bildirilenYorumlar.add(aralik.pos);
      const metin = kaynak.slice(aralik.pos, aralik.end);
      if (TURKCE_KARAKTER.test(metin)) {
        ihlaller.push(`${dosyaYolu}:${satirNoVer(aralik.pos)}: yorumda turkce karakter: ${metin.trim()}`);
      }
    }

    const muaf =
      ts.isStringLiteral(dugum) ||
      ts.isNoSubstitutionTemplateLiteral(dugum) ||
      ts.isTemplateHead(dugum) ||
      ts.isTemplateMiddle(dugum) ||
      ts.isTemplateTail(dugum) ||
      ts.isJsxText(dugum) ||
      ts.isRegularExpressionLiteral(dugum);

    if (!muaf && dugum.getChildCount(kaynakDosya) === 0) {
      const metin = dugum.getText(kaynakDosya);
      if (TURKCE_KARAKTER.test(metin)) {
        ihlaller.push(
          `${dosyaYolu}:${satirNoVer(dugum.getStart(kaynakDosya))}: kodda/tanimlayicida turkce karakter: "${metin}"`,
        );
      }
    }

    dugum.forEachChild(dugumDenetle);
  }

  dugumDenetle(kaynakDosya);
  return ihlaller;
}

const turkceTaranacakDosyalar = [
  ...dosyalariTara(join(KOK, "lib", "kodla"), [".ts", ".tsx"]),
  ...dosyalariTara(join(KOK, "components", "kodla"), [".ts", ".tsx"]),
  // app/kodla/**: kodlama bolumunun Next.js rota dosyalari
  // ([kursId]/page.tsx gibi). Bunlar da lib/kodla ve components/kodla ile
  // ayni kurala tabidir; unutulmalari bir yorumun sessizce sizmasina yol
  // acardi.
  ...dosyalariTara(join(KOK, "app", "kodla"), [".ts", ".tsx"]),
  join(KOK, "e2e", "kodla.spec.ts"),
  join(KOK, "e2e", "kodla-demo.spec.ts"),
];

for (const dosya of turkceTaranacakDosyalar) {
  hatalar.push(...turkceIhlalleriBul(dosya));
}

if (hatalar.length > 0) {
  console.error("Kontrol basarisiz:\n");
  for (const hata of hatalar) console.error("  - " + hata);
  process.exit(1);
}

console.log(
  `Kontrol tamam: ${katalog.length} boyama sayfasi, ${denetlenenBolum} kodlama bolumu, ` +
    `${denetlenenKarakter} kodlama karakteri ve ${turkceTaranacakDosyalar.length} kodlama ` +
    `kaynak dosyasi (turkce karakter) dogrulandi.`,
);
