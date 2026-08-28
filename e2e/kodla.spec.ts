import { test, expect, type Page } from "@playwright/test";
import { bulmacaBul, bulmacaHaritasi, kursBolumleri, type BolumVerisi } from "../lib/kodla/bolumler";
import { kursKarakterleri } from "../lib/kodla/karakterler";
import { enKisaCozumYolu } from "../lib/kodla/labirent/cozucu";
import { KOMUT_SETLERI, komutAnahtari } from "../lib/kodla/labirent/komutlar";
import { onizlemeYolu } from "../lib/kodla/labirent/onizleme";
import { EN_FAZLA_BLOK } from "../lib/kodla/program";
import { KOMUT_ADLARI } from "../components/kodla/labirent/komutGorunumu";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);
const KARAKTERLER = kursKarakterleri(KURS);

/** Bir bolumun istenen bulmacasinin en kisa cozumu. Sira verilmezse ilki. */
function bulmacaCozumu(bolum: BolumVerisi, sira = 0) {
  const bulmaca = bulmacaBul(bolum, sira)!;
  return enKisaCozumYolu(bulmacaHaritasi(bulmaca), bulmaca.komutSeti);
}

// Sozsuz ilk temas demosu ilk durakta kendi kendine bir blok ekleyip
// calistiriyor. Bu dosyadaki testler paleti kendileri surdugu
// icin demo devrede kalirsa programa beklenmedik bir blok karisir ve
// sonuclar kararsizlasir. Demo'nun kendisi kodla-demo.spec.ts icinde ayrica
// test ediliyor; burada sessizce kapatiyoruz.
//
// Ayni gerekce "Kiminle ucalim?" karakter secim ekrani icin de gecerli:
// goc haritasina ilk giriste secim yapilmamissa diyalog acilir ve haritanin
// USTUNU KAPLAR. Bu dosyadaki testlerin konusu secim ekrani degil (o,
// asagidaki "ilk giriste kus secimi sorulur..." testinde ayrica dogrulanir);
// digerleri haritayi/durak baglantilarini kullanabilsin diye secimi burada
// onceden yapilmis sayiyoruz. kodla:karakter'in sekli { [kursId]: karakterId
// } - karakterSec/seciliKarakterId bu duz haritayi okur (bkz.
// lib/kodla/yerelKayit.ts).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([kurs]) => {
      localStorage.setItem("kodla:demo", "evet");
      localStorage.setItem("kodla:karakter", JSON.stringify({ [kurs]: "turna" }));
    },
    [KURS],
  );
});

/**
 * "#rrggbb" -> "rgb(r, g, b)". getComputedStyle her zaman rgb() doner;
 * beklenen renkleri katalogdan turetebilmek icin ceviriyoruz.
 */
function rgbYaz(hex: string): string {
  const basamaklar = hex.replace("#", "");
  const [k, y, m] = [0, 2, 4].map((i) => parseInt(basamaklar.slice(i, i + 2), 16));
  return `rgb(${k}, ${y}, ${m})`;
}

/** Verilen komutlari paletten sirayla ekler. */
async function programiDiz(page: Page, anahtarlar: string[]) {
  for (const anahtar of anahtarlar) {
    await page.getByRole("button", { name: KOMUT_ADLARI[anahtar], exact: true }).click();
  }
}

test("ana sayfadan kodlama bolumu acilir", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Kodlama" }).click();
  await expect(page.getByRole("heading", { name: "Kaç yaşındasın?" })).toBeVisible();

  await page.getByRole("link", { name: /Turna'nın Yolu/ }).click();
  await expect(page.getByRole("heading", { name: "Turna'nın Yolu" })).toBeVisible();
});

test("baslangicta yalnizca ilk durak aciktir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/`);
  await expect(page.getByRole("link", { name: /1\. durak/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /2\. durak/ })).toHaveCount(0);
});

test("ilk bolum en kisa yolla bitirilince altin yildiz verilir", async ({ page }) => {
  const bolum = BOLUMLER[0];
  const yol = bulmacaCozumu(bolum)!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await programiDiz(page, yol.map(komutAnahtari));
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Harika! En kısa yol!")).toBeVisible({ timeout: 15000 });

  const ilerleme = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kodla:ilerleme") ?? "{}"),
  );
  expect(ilerleme[KURS][bolum.id]).toBe("altin");
});

test("fazladan blokla bitirmek normal yildiz verir ve cezalandirmaz", async ({ page }) => {
  const bolum = BOLUMLER[0];
  const yol = bulmacaCozumu(bolum)!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  // Sona fazladan blok: karakter hedefe varinca kalan bloklar calistirilmaz,
  // ama program uzunlugu idealAdim'i astigi icin altin yildiz verilmez.
  await programiDiz(page, [...yol.map(komutAnahtari), "git:sol"]);
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Aferin!")).toBeVisible({ timeout: 15000 });
  const ilerleme = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kodla:ilerleme") ?? "{}"),
  );
  expect(ilerleme[KURS][bolum.id]).toBe("yildiz");
});

test("bolum bitince sadece sonraki durak acilir", async ({ page }) => {
  const bolum = BOLUMLER[0];
  const yol = bulmacaCozumu(bolum)!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);
  await programiDiz(page, yol.map(komutAnahtari));
  await page.getByRole("button", { name: "Çalıştır" }).click();
  await expect(page.getByText(/En kısa yol|Aferin/)).toBeVisible({ timeout: 15000 });

  await page.goto(`/kodla/${KURS}/`);
  await expect(page.getByRole("link", { name: /2\. durak/ })).toBeVisible();
  // Kilit kurali tek adim acar: ucuncu durak hala kilitli kalmali.
  await expect(page.getByRole("link", { name: /3\. durak/ })).toHaveCount(0);
});

test("haritadaki yol, calistir sonucuyla ayni sayida parca cizer", async ({ page }) => {
  const bolum = BOLUMLER.find((b) => b.id === "kapadokya")!;
  const yol = bulmacaCozumu(bolum)!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  // Once bir carpma ekliyoruz ki onizlemenin carpmayi da cizdigi gorulsun.
  // Kapadokya'da karakter (1,2)'de "sag" bakarak baslar ve hemen saginda
  // (2,2) bir engel var: "git:sag" harita kenarina degil gercek bir
  // engele carpar. (Sultansazligi'nda ayni amacla denenen "git:yukari"
  // bos bir kareye yuruyordu; carpma hic uretmiyordu ve testin carpma
  // yarisi hicbir zaman basarisiz olamazdi.)
  await programiDiz(page, ["git:sag", ...yol.map(komutAnahtari)]);

  const beklenen = onizlemeYolu(
    [{ tur: "git", yon: "sag" }, ...yol],
    bulmacaHaritasi(bulmacaBul(bolum, 0)!),
  );
  const beklenenCarpma = beklenen.filter((p) => p.tur === "carpma").length;
  // Assertion'in gercekten bir seyi test ettigini kanitlar: sifirsa carpma
  // sinifi hicbir zaman aranmiyor demektir.
  expect(beklenenCarpma).toBeGreaterThan(0);
  await expect(page.locator(".kodlaYolParcasi")).toHaveCount(beklenen.length);
  await expect(page.locator(".kodlaYolParcasi.carpma")).toHaveCount(beklenenCarpma);

  // Sayim tek basina yeterli degil: dogru sayida ama yanlis yerde ok cizen
  // bir regresyon da bu noktaya kadar gecerdi. Ilk parcanin GEOMETRISINI de
  // dogruluyoruz: Sahne.tsx'teki ayni cizim formulunu (KARE=100 birim,
  // carpma icin orta nokta + yon basina %32'lik kisa cizgi) burada
  // BAGIMSIZCA yeniden hesaplayip DOM'daki gercek x1/y1/x2/y2 ile
  // karsilastiriyoruz.
  const ilkParca = beklenen[0];
  const KARE = 100;
  const beklenenKoordinat =
    ilkParca.tur === "carpma"
      ? (() => {
          const orta = { x: ilkParca.kare.x * KARE + 50, y: ilkParca.kare.y * KARE + 50 };
          const uc = KARE * 0.32;
          return {
            x1: orta.x,
            y1: orta.y,
            x2: orta.x + (ilkParca.yon === "sag" ? uc : ilkParca.yon === "sol" ? -uc : 0),
            y2: orta.y + (ilkParca.yon === "asagi" ? uc : ilkParca.yon === "yukari" ? -uc : 0),
          };
        })()
      : {
          x1: ilkParca.baslangic.x * KARE + 50,
          y1: ilkParca.baslangic.y * KARE + 50,
          x2: ilkParca.bitis.x * KARE + 50,
          y2: ilkParca.bitis.y * KARE + 50,
        };

  const gercekKoordinat = await page.locator(".kodlaYolParcasi").first().evaluate((oge) => ({
    x1: Number(oge.getAttribute("x1")),
    y1: Number(oge.getAttribute("y1")),
    x2: Number(oge.getAttribute("x2")),
    y2: Number(oge.getAttribute("y2")),
  }));
  expect(gercekKoordinat).toEqual(beklenenKoordinat);
});

test("blok silinince haritadaki yol da kisalir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/sultansazligi/`);
  await programiDiz(page, ["git:sag", "git:sag"]);
  await expect(page.locator(".kodlaYolParcasi")).toHaveCount(2);

  await page.getByRole("button", { name: "Son bloğu sil" }).click();
  await expect(page.locator(".kodlaYolParcasi")).toHaveCount(1);
});

/** Verilen siradaki bulmacayi en kisa yolla cozup calistirir. */
async function bolumuCoz(page: Page, bolum: BolumVerisi, sira: number) {
  await programiDiz(page, bulmacaCozumu(bolum, sira)!.map(komutAnahtari));
  await page.getByRole("button", { name: "Çalıştır" }).click();
}

test("dizi durakta bulmacalar sirayla acilir, yildiz sonunda gelir", async ({ page }) => {
  const bolum = BOLUMLER.find((b) => b.id === "sultansazligi")!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  const noktalar = page.locator(".bulmacaNoktasi");
  await expect(noktalar).toHaveCount(bolum.bulmacalar.length);
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(1);

  // Ilk bulmacayi coz: kutlama DEGIL gecis gelmeli.
  await bolumuCoz(page, bolum, 0);
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
  await expect(page.locator(".kutlamaKutusu")).toBeHidden();

  // Gecis kendiliginden kapanir ve ikinci bulmaca acilir.
  await expect(page.getByText("Sıradaki bulmaca")).toBeHidden();
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(2);
  // Serit temiz baslar: onceki bulmacanin bloklari kalmamali.
  await expect(page.locator(".programBloku")).toHaveCount(0);

  await bolumuCoz(page, bolum, 1);
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
  await expect(page.getByText("Sıradaki bulmaca")).toBeHidden();

  // Son bulmaca bitince kutlama ve sonraki durak dugmesi gelir.
  await bolumuCoz(page, bolum, 2);
  await expect(page.locator(".kutlamaKutusu")).toBeVisible();
  await expect(page.getByRole("link", { name: /Sonraki durak/ })).toBeVisible();
});

// Onceki gorevlerde eklenen "sonrakiHazirlaniyor" penceresi (varis kutlamasi,
// bulmaca bitince gecis katmani acilmadan once ~500ms) daha once HICBIR
// testte calistirilmadi: tum duraklar tek bulmacaliydi, bu yuzden o pencere
// hicbir zaman girilmedi. Bu test dogrudan o pencereyi ve onu izleyen gecis
// katmanini hedefler: onceki gorevin incelemesinde tam bu boslukta elle
// yakalanan bir hata vardi (kontroller acik kalip haritanin degistigi anda
// eski programi yeni bulmacaya calistirip altin yildiz veriyordu).
test("bulmacalar arasi kutlama ve gecis penceresinde kontroller kilitli kalir", async ({ page }) => {
  const bolum = BOLUMLER.find((b) => b.id === "sultansazligi")!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await bolumuCoz(page, bolum, 0);

  // Kutlama pozu ve ardindan gecis katmani, kosu bitince toplam ~1.6sn'lik
  // (VARIS_BEKLEME_SURESI + GECIS_SURESI) kisa bir pencerede gelip gecer.
  // Bu pencereyi Playwright'in kendi tur-basi (round-trip) gecikmeli ayri
  // expect() cagrilariyla yakalamaya calismak, paralel calisan diger
  // testlerin CPU'yu paylastigi bir tam paket kosusunda kacirilabilir
  // (gozlemlendi). Bunun yerine TARAYICI ICINDE, kisa araliklarla orneklenen
  // bir dongu ile dogruluyoruz: pencere ne zaman baslarsa baslasin, HER
  // orneklemede "Calistir" dugmesi kilitli ve nabizsiz olmali.
  const sonuc = await page.evaluate(async () => {
    const ihlaller: string[] = [];
    let kutlamaGoruldu = false;
    let gecisGoruldu = false;
    const bitis = Date.now() + 6000;
    while (Date.now() < bitis) {
      const kutlama = document.querySelector(".kodlaKarakter.poz-kutlama");
      const gecis = document.querySelector(".bulmacaGecisi");
      if (kutlama) kutlamaGoruldu = true;
      if (gecis) gecisGoruldu = true;
      if (kutlama || gecis) {
        const dugme = document.querySelector(".calistirDugmesi") as HTMLButtonElement | null;
        if (!dugme?.disabled) ihlaller.push("dugme kilitli degildi");
        if (dugme?.classList.contains("nabiz")) ihlaller.push("dugme nabiz tasiyordu");
      }
      // Ikinci bulmaca acildiktan (gecis kapandiktan) sonra daha fazla
      // orneklemeye gerek yok.
      if (gecisGoruldu && !gecis) break;
      await new Promise((cozul) => setTimeout(cozul, 20));
    }
    return { ihlaller, kutlamaGoruldu, gecisGoruldu };
  });

  expect(sonuc.kutlamaGoruldu, "kutlama pozu hic gozlemlenemedi").toBe(true);
  expect(sonuc.gecisGoruldu, "gecis katmani hic gozlemlenemedi").toBe(true);
  expect(sonuc.ihlaller).toEqual([]);
});

// Perde artik SADECE bir onay isareti degil, ILERLEMENIN KENDISIDIR: nokta
// gostergesinin tek yuvasi ust bardaydi ama ust bar PERDENIN ALTINDA kalir -
// eskiden dolan nokta ancak perde kalkinca gorunurdu, yani "ilerledim"
// hissini veren tek an cocugun goremedigi andi. Simdi perde kendi nokta
// satirini tasiyor ve sonraki bulmacanin noktasi PERDE ACIKKEN doluyor.
test("gecis perdesi kendi nokta gostergesini tasir, sonraki nokta perde acikken doluyor", async ({
  page,
}) => {
  const bolum = BOLUMLER.find((b) => b.id === "sultansazligi")!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await bolumuCoz(page, bolum, 0);

  const perde = page.locator(".bulmacaGecisi");
  await expect(perde).toBeVisible();

  const perdeNoktalari = perde.locator(".bulmacaNoktasi");
  await expect(perdeNoktalari, "perdenin kendi nokta satiri yok").toHaveCount(
    bolum.bulmacalar.length,
  );
  // Perde henuz kapanmadan (arka planda bulmacaSirasi hala ESKI), ikinci
  // bulmacanin noktasi ZATEN dolu olmali - kapanmasini beklemeden.
  await expect(
    perde.locator(".bulmacaNoktasi.dolu"),
    "sonraki nokta perde acikken dolmadi",
  ).toHaveCount(2);

  await expect(perde).toBeHidden();
});

// Yuvanin dolmasi (.kodlaYuva.dolu + dolu yuva simgesi) sahnedeki EN NET
// sozsuz basari isaretidir. Bu isaret bir sure yalnizca duragin SON
// bulmacasinda yanmisti (vardi={durum.bitti !== null}; bitti yalnizca durak
// bitince yazilir), yani bu daldaki yedi bulmaca bitirmesinin besinde cocuk
// yuvaya konuyor ama yuva hic tepki vermiyordu. Geriye kalan tek geri
// bildirim 500ms'lik bir poz ile bir onay isareti ve "siradaki bulmaca"
// yazisiydi -
// hedef kitle okuyamiyor.
test("ara bulmacayi kazanmak da yuvayi doldurur", async ({ page }) => {
  const bolum = BOLUMLER.find((b) => b.id === "sultansazligi")!;
  expect(bolum.bulmacalar.length, "bu test ara bulmaca ister").toBeGreaterThan(1);
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await bolumuCoz(page, bolum, 0);

  // Kutlama penceresi kisa (VARIS_BEKLEME_SURESI, 500ms); ayri expect()
  // cagrilariyla kovalamak yerine tarayici icinde orneklemek daha kararli
  // (ayni gerekce yukaridaki kilit testinde de anlatiliyor).
  const sonuc = await page.evaluate(async () => {
    let kutlamaGoruldu = false;
    let yuvaDoluGoruldu = false;
    const bitis = Date.now() + 6000;
    while (Date.now() < bitis) {
      const kutlama = document.querySelector(".kodlaKarakter.poz-kutlama");
      if (kutlama) {
        kutlamaGoruldu = true;
        if (document.querySelector(".kodlaYuva.dolu")) yuvaDoluGoruldu = true;
      }
      if (kutlamaGoruldu && !kutlama) break;
      await new Promise((cozul) => setTimeout(cozul, 20));
    }
    return { kutlamaGoruldu, yuvaDoluGoruldu };
  });

  expect(sonuc.kutlamaGoruldu, "kutlama pozu hic gozlemlenemedi").toBe(true);
  expect(sonuc.yuvaDoluGoruldu, "ara bulmaca kazanildi ama yuva hic dolmadi").toBe(true);
});

// Kutlama katmani tahtanin USTUNU orter ama tahtayi OLDURMEZDI: palet, ↺ ve
// ▶ hepsi etkin kalirdi. Parmak icin ortu yeterlidir, klavye ve yardimci
// teknoloji icin degil - Sekme ile calistir dugmesine gidip Enter'a basmak,
// zaten
// sayilmis bulmacayi ikinci kez oynatip bulmacaCozuldu'yu tekrar cagirirdi.
// Buradaki tiklama tam da o yolu taklit eder: ortunun geometrisini hic
// sormadan dogrudan dugmeye basar.
test("kutlama acikken tahta olur: bulmaca ikinci kez sayilamaz", async ({ page }) => {
  const bolum = BOLUMLER[0];
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await bolumuCoz(page, bolum, 0);
  await expect(page.locator(".kutlamaKutusu")).toBeVisible();

  const calistir = page.getByRole("button", { name: "Çalıştır" });
  await expect(calistir, "kutlama sirasinda calistir dugmesi etkin").toBeDisabled();
  await expect(calistir, "olu dugme hala nabiz atiyor").not.toHaveClass(/nabiz/);
  await expect(page.getByRole("button", { name: "Kuşu başa al" })).toBeDisabled();

  const kayitOku = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("kodla:bulmaca") ?? "{}"));
  const once = await kayitOku();

  // Ortuyu hic sormayan bir basis (klavye/erisilebilirlik yolu).
  await page.evaluate(() => {
    (document.querySelector(".calistirDugmesi") as HTMLButtonElement | null)?.click();
  });
  // Program yeniden oynatilsaydi son adim ~450ms sonra bulmacaCozuldu'yu
  // ikinci kez cagirirdi; olcumden once o pencereye rahat pay birakiyoruz.
  await page.waitForTimeout(2500);

  expect(await kayitOku(), "bulmaca ikinci kez sayildi").toEqual(once);
  await expect(page.locator(".kutlamaKutusu")).toBeVisible();
});

test("nokta gostergesi durak icindeki konumu izler, tek bulmacali durakta yoktur", async ({
  page,
}) => {
  const bolum = BOLUMLER.find((b) => b.id === "kapadokya")!;
  expect(bolum.bulmacalar.length, "bu test coklu ilerlemeyi gormek icin en az 3 bulmaca ister").toBeGreaterThanOrEqual(3);
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await expect(page.locator(".bulmacaNoktasi")).toHaveCount(bolum.bulmacalar.length);
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(1);

  for (let sira = 0; sira < bolum.bulmacalar.length - 1; sira++) {
    await bolumuCoz(page, bolum, sira);
    await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
    await expect(page.getByText("Sıradaki bulmaca")).toBeHidden();
    await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(sira + 2);
  }

  // Son bulmacaya varildiginda tum noktalar dolu olmali.
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(bolum.bulmacalar.length);

  // Tek bulmacali bir durakta gosterge hic gorunmemeli.
  const tekBulmacaliBolum = BOLUMLER.find((b) => b.bulmacalar.length === 1)!;
  await page.goto(`/kodla/${KURS}/${tekBulmacaliBolum.id}/`);
  await expect(page.locator(".bulmacaNoktasi")).toHaveCount(0);
});

test("durak ici ilerleme sayfa yenilenince korunur", async ({ page }) => {
  const bolum = BOLUMLER.find((b) => b.id === "sultansazligi")!;
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  await bolumuCoz(page, bolum, 0);
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
  await expect(page.getByText("Sıradaki bulmaca")).toBeHidden();
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(2);

  await page.reload();

  // Yeniden yuklemeden sonra cocuk ikinci bulmacada olmali, birinciye
  // donmemeli.
  await expect(page.locator(".bulmacaNoktasi.dolu")).toHaveCount(2);
  await bolumuCoz(page, bolum, 1);
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
});

// Onceki surum yalnizca .kodlaTurna'yi orneklerdi (bu sinif daha sonra
// .kodlaKarakter olarak adlandirildi): kodla.css'teki
// prefers-reduced-motion blogunda BUNUN disinda on bes ayri sinif/durum
// daha var, ve bu fazda tam olarak orada dort ayri CSS ozgulluk hatasi
// bulundu. Tek bir secici, sonrakinin de yakalanacagini garanti etmez; bu
// yuzden burada kod.css'teki reduced-motion kurallarinin ETKILEDIGI HER
// sinifi tek tek denetliyoruz. Bazi durumlar (poz-adim, poz-carpma, .dolu,
// .programBloku.yeni, kutlama) yalnizca oyun surerken var olur; bu yuzden
// test bir program kurup calistiriyor ve kazaniyor. Ulasilamayanlar test
// sonunda ayrica belgeleniyor.
test("prefers-reduced-motion acikken kodla.css'teki ilgili tum sinif/durumlarda gecis ve animasyon yok", async ({
  browser,
}) => {
  test.setTimeout(45000);
  const baglam = await browser.newContext({ reducedMotion: "reduce" });
  const sayfa = await baglam.newPage();
  await sayfa.addInitScript(() => {
    try {
      localStorage.setItem("kodla:demo", "evet");
    } catch {
      // yok sayilir
    }
  });

  // Efes hem toplanacak bir basak ("o") hem T'nin hemen saginda bir engel
  // ("#") barindirir: tek bolumde hem carpma hem basak-toplama/kazanma
  // durumlarina ulasilabiliyor.
  const bolum = BOLUMLER.find((b) => b.id === "efes")!;

  /** transitionDuration/animationName'i bir secici DOM'da BELIRIR belirmez
   * (ayni tarayici tikinde) yakalar; ayri bir "bul, sonra oku" adimi state
   * gecici oldugunda (orn. poz-carpma ~400ms surer) yarisamayi onler. */
  async function anlikYakala(
    secici: string,
  ): Promise<{ gecis: string; animasyon: string; goruntu: string }> {
    const tutamac = await sayfa.waitForFunction(
      (sec) => {
        const el = document.querySelector(sec);
        if (!el) return null;
        const s = getComputedStyle(el);
        return { gecis: s.transitionDuration, animasyon: s.animationName, goruntu: s.display };
      },
      secici,
      { timeout: 5000 },
    );
    // waitForFunction yalnizca predicate DOGRUYSA (null degilse) cozulur;
    // bu noktada deger asla null degildir.
    const deger = await tutamac.jsonValue();
    return deger as { gecis: string; animasyon: string; goruntu: string };
  }

  function gecisYok(deger: { gecis: string }, secici: string) {
    expect(deger.gecis, secici).toBe("0s");
  }
  function animasyonYok(deger: { animasyon: string }, secici: string) {
    expect(deger.animasyon, secici).toBe("none");
  }

  // --- Karakter secim ekrani: bu baglam BILEREK kodla:karakter kurmaz, bu
  // yuzden goc haritasina ilk giriste "Kiminle ucalim?" diyalogu acar.
  // .karakterKarti ve .karakterMadalyonu gecisleri daha once hicbir e2e
  // testinde reducedMotion baglaminda dogrulanmiyordu (bu test dogrudan
  // bolum ekranina giderdi, haritaya hic ugramazdi) - burada haritayi da
  // ziyaret ederek o boslugu kapatiyoruz.
  await sayfa.goto(`/kodla/${KURS}/`);
  const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });
  await expect(diyalog).toBeVisible();
  gecisYok(await anlikYakala(".karakterKarti"), ".karakterKarti");
  // Diyalog acikken madalyon da varsayilan kusla ekranda olabilir
  // (kartlar sorulurken bile secili-gorunen bir kus gosterilir); butonu
  // KART icinden secmek icin araniyoruz, aksi halde "Turna" adi hem karta
  // hem "Kusu degistir: Turna" madalyonuna eslesip strict mode'u kirar.
  await diyalog.getByRole("button", { name: "Turna" }).click();
  await expect(diyalog).toBeHidden();
  gecisYok(await anlikYakala(".karakterMadalyonu"), ".karakterMadalyonu");

  await sayfa.goto(`/kodla/${KURS}/${bolum.id}/`);

  // --- Kosuya gerek olmadan, sayfa acilir acilmaz erisilebilen durumlar ---
  animasyonYok(await anlikYakala(".kodlaKarakter"), ".kodlaKarakter (animation)");
  gecisYok(await anlikYakala(".kodlaKarakter"), ".kodlaKarakter (transition)");
  // Baslangic hali zaten "bekliyor" + "poz-durus": kosu gerekmez.
  animasyonYok(
    await anlikYakala(".kodlaKarakter.bekliyor.poz-durus"),
    ".kodlaKarakter.bekliyor.poz-durus",
  );
  gecisYok(await anlikYakala(".kodlaBasak"), ".kodlaBasak");
  animasyonYok(await anlikYakala(".kodlaYuva"), ".kodlaYuva");
  animasyonYok(await anlikYakala(".komutPaleti.nabiz"), ".komutPaleti.nabiz (program bos)");
  for (const sec of [".komutDugmesi", ".kodlaYardimciDugme", ".calistirDugmesi"]) {
    gecisYok(await anlikYakala(sec), sec);
  }

  // --- Carpma: tek bir komutla duvara surulmesini tetikler ---
  await programiDiz(sayfa, ["git:sag"]);
  animasyonYok(await anlikYakala(".kodlaYolParcasi"), ".kodlaYolParcasi");
  await sayfa.getByRole("button", { name: "Çalıştır" }).click();
  animasyonYok(await anlikYakala(".kodlaKarakter.poz-carpma"), ".kodlaKarakter.poz-carpma");
  animasyonYok(await anlikYakala(".kodlaToz"), ".kodlaToz");

  // Tahtayi kazanma denemesi icin sifirla.
  await sayfa.getByRole("button", { name: "Kuşu başa al" }).click();
  await sayfa.getByRole("button", { name: "Hepsini temizle" }).click();
  await expect(sayfa.locator(".programBloku")).toHaveCount(0);

  // --- Kazanma: en kisa cozumle calistirip altin yildiz + kutlamaya ulas ---
  const yol = bulmacaCozumu(bolum)!;
  expect(yol.length, "bu testin ikinci yarisi en az iki blok gerektirir").toBeGreaterThan(1);
  await programiDiz(sayfa, yol.map(komutAnahtari));

  const yeniBlokDeger = await anlikYakala(".programBloku.yeni");
  animasyonYok(yeniBlokDeger, ".programBloku.yeni (animation)");
  gecisYok(yeniBlokDeger, ".programBloku.yeni (transition)");
  // .yeni tasimayan bir .programBloku'yu AYRICA sorguluyoruz: kural
  // ".programBloku, .programBloku.yeni { animation: none; transition:
  // none; }" seklinde iki secicili tek bir listedir; yalnizca ".yeni"
  // tasiyan ogeyi sorgulamak, biri ".programBloku.yeni" TEK BASINA
  // kalacak sekilde daraltilsa bile testin yesil kalmasina yol acardi —
  // oysa calisirken vurgulanan (.calisiyor tasiyan ama .yeni tasimayan)
  // diger bloklar geri gecisi/animasyonu kaybederdi. `yol` en az iki
  // komuttan olustugu icin (yukaridaki expect bunu garanti eder) burada
  // hep en az bir ".yeni" tasimayan blok vardir.
  const eskiBlokDeger = await anlikYakala(".programBloku:not(.yeni)");
  animasyonYok(eskiBlokDeger, ".programBloku (yeni olmayan) (animation)");
  gecisYok(eskiBlokDeger, ".programBloku (yeni olmayan) (transition)");

  animasyonYok(await anlikYakala(".calistirDugmesi.nabiz"), ".calistirDugmesi.nabiz (program dolu)");

  await sayfa.getByRole("button", { name: "Çalıştır" }).click();
  animasyonYok(await anlikYakala(".kodlaKarakter.poz-adim"), ".kodlaKarakter.poz-adim");
  await expect(sayfa.getByText("Harika! En kısa yol!")).toBeVisible({ timeout: 15000 });

  animasyonYok(await anlikYakala(".kodlaYuva.dolu"), ".kodlaYuva.dolu");
  animasyonYok(await anlikYakala(".kodlaKutlamaYildiz.altin"), ".kodlaKutlamaYildiz.altin");
  const konfeti = await anlikYakala(".kodlaKonfeti");
  expect(konfeti.goruntu, ".kodlaKonfeti (display)").toBe("none");

  // --- Bulmacalar arasi gecis katmani ---
  //
  // .bulmacaGecisi yalnizca COKLU bulmacali bir durakta, bir ara bulmaca
  // kazanildiginda belirir; yukaridaki bolum (efes) tek bulmacalik oldugu
  // icin bu sinif bu testte hic var olmuyordu ve reduced-motion bildirimi
  // (bulmacaGecisBelir'i iptal eden kural) hicbir e2e testinde
  // calistirilmiyordu - oysa testin basligi "ilgili TUM sinif/durumlar"
  // diyor. Bir gecis daha oynatarak boslugu kapatiyoruz.
  const diziBolum = BOLUMLER.find((b) => b.bulmacalar.length > 1)!;
  await sayfa.goto(`/kodla/${KURS}/${diziBolum.id}/`);
  await programiDiz(sayfa, bulmacaCozumu(diziBolum, 0)!.map(komutAnahtari));
  await sayfa.getByRole("button", { name: "Çalıştır" }).click();
  animasyonYok(await anlikYakala(".bulmacaGecisi"), ".bulmacaGecisi");
  // Perdenin kendi nokta gostergesindeki "yeni dolan" nokta da bir
  // animasyonla belirir; bu da reduced-motion altinda iptal edilmeli.
  animasyonYok(await anlikYakala(".bulmacaNoktasi.yeniDolan"), ".bulmacaNoktasi.yeniDolan");

  // --- Bu testte ULASILAMAYAN reduced-motion bildirimleri ---
  // .komutDugmesi.hayaletli::after, .calistirDugmesi.hayaletli::after:
  // yalnizca sessiz demo surerken var olurlar; bu dosyadaki beforeEach
  // demoyu KASITLI kapatir (diger testlerin kararli kalmasi icin, bkz.
  // dosya basindaki yorum), demo'nun kendisi e2e/kodla-demo.spec.ts'te
  // ayrica test edilir ama o dosya reducedMotion baglami kurmaz. Bu ikisi
  // bu haliyle hicbir e2e testinde "reduced motion + hayalet" birlikte
  // denetlenmiyor.

  await baglam.close();
});

test("yon dugmeleri arti duzeninde: yukari ustte, asagi altta", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/sultansazligi/`);
  const yukari = (await page.getByRole("button", { name: "Yukarı git" }).boundingBox())!;
  const asagi = (await page.getByRole("button", { name: "Aşağı git" }).boundingBox())!;
  const sol = (await page.getByRole("button", { name: "Sola git" }).boundingBox())!;
  const sag = (await page.getByRole("button", { name: "Sağa git" }).boundingBox())!;

  expect(yukari.y).toBeLessThan(asagi.y);
  expect(sol.x).toBeLessThan(sag.x);
  // Yukari ve asagi ayni sutunda, sol ve sag ayni satirda olmali.
  expect(Math.abs(yukari.x - asagi.x)).toBeLessThan(4);
  expect(Math.abs(sol.y - sag.y)).toBeLessThan(4);
});

// Her bolum gercekten oynanabiliyor mu? Bir bolumun haritasi bozulursa
// hangisi oldugu dogrudan gorunsun diye her bolum ayri bir testtir. Durakta
// birden fazla bulmaca varsa (bir durak boyle bir dizi tasimadan once bu hic
// olmuyordu) TUMU
// sirayla cozulur, aralardaki gecis katmani her seferinde beklenir: yalnizca
// ilk bulmacayi cozmek durak icinde ikinci bulmacaya birakir, "Harika!" hic
// gorunmez.
for (const bolum of BOLUMLER) {
  test(`${bolum.ad} bolumu cozumle bitirilebilir`, async ({ page }) => {
    await page.goto(`/kodla/${KURS}/${bolum.id}/`);

    for (let sira = 0; sira < bolum.bulmacalar.length; sira++) {
      const yol = bulmacaCozumu(bolum, sira);
      expect(yol, `${bolum.id} - ${sira}. bulmaca icin cozum bulunamadi`).not.toBeNull();
      await programiDiz(page, yol!.map(komutAnahtari));
      await page.getByRole("button", { name: "Çalıştır" }).click();

      if (sira < bolum.bulmacalar.length - 1) {
        await expect(page.getByText("Sıradaki bulmaca")).toBeVisible();
        await expect(page.getByText("Sıradaki bulmaca")).toBeHidden();
      }
    }

    await expect(page.getByText("Harika! En kısa yol!"), `${bolum.id} tamamlanamadi`).toBeVisible({
      timeout: 20000,
    });
  });
}

// Duraklarin yalnizca bir kismi coklu bulmacali; nokta gostergesi (ust
// barda, bolum adinin yaninda) SADECE onlarda cizilir. Bu test hep
// BOLUMLER[0]'i (tek bulmacali Goksu Deltasi) acardi, yani gostergenin
// oldugu duzen hicbir ekran boyutunda olculmemisti. En dar ekrani -ust
// barin tasmaya en yakin oldugu yeri- en cok bulmacali duraga ceviriyoruz.
const COK_BULMACALI = BOLUMLER.reduce((enUzun, bolum) =>
  bolum.bulmacalar.length > enUzun.bulmacalar.length ? bolum : enUzun,
);

test("bolum ekraninda kaydirma yok ve dokunma hedefleri en az 64 piksel", async ({ page }) => {
  expect(COK_BULMACALI.bulmacalar.length, "nokta gostergesini goren bir durak yok").toBeGreaterThan(
    1,
  );
  for (const ekran of [
    { g: 820, y: 1180, bolum: BOLUMLER[0] },
    { g: 1180, y: 820, bolum: BOLUMLER[0] },
    { g: 1024, y: 768, bolum: BOLUMLER[0] },
    { g: 390, y: 844, bolum: COK_BULMACALI },
  ]) {
    await page.setViewportSize({ width: ekran.g, height: ekran.y });
    await page.goto(`/kodla/${KURS}/${ekran.bolum.id}/`);

    // Tam ekran duzeni bir useEffect icinde body'ye sinif ekleyerek kuruluyor;
    // hydration bitmeden olcum yapmak, ust bar ve alt bilgi hala ekrandayken
    // olcmek demektir. Yavas bir makinede bu yarisi kaybediyoruz (CI'da tam
    // olarak bu oldu), o yuzden once kosulu bekliyoruz.
    await expect(page.locator("body")).toHaveClass(/tamEkran/);

    // Ust barin genisligi yukaridaki scrollWidth olcumuyle KORUNMAZ:
    // body.tamEkran overflow:hidden verir, yani tasan bir ust bar belgeyi
    // buyutmez - sessizce kirpilir. Cocuk icin sonuc "kaydirilamayan bir
    // sayfa" degil, "yarisi olmayan bir baslik/gosterge" olur. Bu yuzden
    // barin KENDI ic tasmasini ve nokta gostergesinin gercekten goruntu
    // alaninda oldugunu ayrica soruyoruz.
    const ustBarTasmasi = await page
      .locator(".bolumUstBar")
      .evaluate((oge) => oge.scrollWidth - oge.clientWidth);
    expect(ustBarTasmasi, `ust bar kendi icinde tasiyor (${ekran.g}x${ekran.y})`).toBeLessThanOrEqual(
      1,
    );

    const noktalar = page.locator(".bulmacaNoktalari");
    if (ekran.bolum.bulmacalar.length > 1) {
      await expect(noktalar, `nokta gostergesi yok (${ekran.g}x${ekran.y})`).toHaveCount(1);
      await expect(
        noktalar,
        `nokta gostergesi goruntu alanindan tasti (${ekran.g}x${ekran.y})`,
      ).toBeInViewport({ ratio: 0.99 });
      await expect(
        page.locator(".bolumAdi"),
        `bolum adi goruntu alanindan tasti (${ekran.g}x${ekran.y})`,
      ).toBeInViewport({ ratio: 0.99 });
    }

    const tasma = await page.evaluate(() => ({
      dikey: document.documentElement.scrollHeight - window.innerHeight,
      yatay: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect(tasma.dikey, `dikey tasma var (${ekran.g}x${ekran.y})`).toBeLessThanOrEqual(1);
    expect(tasma.yatay, `yatay tasma var (${ekran.g}x${ekran.y})`).toBeLessThanOrEqual(1);

    const dugmeler = page.locator(".komutDugmesi, .kodlaYardimciDugme, .calistirDugmesi, .geriDugmesi");
    const adet = await dugmeler.count();
    for (let i = 0; i < adet; i++) {
      const kutu = (await dugmeler.nth(i).boundingBox())!;
      const etiket = await dugmeler.nth(i).getAttribute("aria-label");
      expect(
        Math.min(kutu.width, kutu.height),
        `${etiket ?? i} cok kucuk (${ekran.g}x${ekran.y})`,
      ).toBeGreaterThanOrEqual(64);
    }
  }
});

// Yukaridaki test bos bir seritle olculuyor. Serit 20 bloga dolunca
// bekleneni buyur, alt satira sarar; body.tamEkran overflow: hidden
// verdigi icin bir gerileme kaydirma degil kirpilma uretir. Bu yuzden dolu
// seritte de tasma olmadigini ayrica dogrulamak gerekir.
test("serit 20 bloga dolunca da sayfada tasma olmaz", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/kodla/${KURS}/${BOLUMLER[0].id}/`);

  const ilkKomut = KOMUT_SETLERI["yonler"][0];
  const dugme = page.getByRole("button", { name: KOMUT_ADLARI[komutAnahtari(ilkKomut)], exact: true });
  for (let i = 0; i < EN_FAZLA_BLOK; i++) {
    await dugme.click();
  }
  await expect(page.locator(".programBloku")).toHaveCount(EN_FAZLA_BLOK);

  // Tam ekran duzeni bir useEffect icinde body'ye sinif ekleyerek kuruluyor;
  // hydration bitmeden olcum yapmak, ust bar ve alt bilgi hala ekrandayken
  // olcmek demektir. Yavas bir makinede bu yarisi kaybediyoruz (CI'da tam
  // olarak bu oldu), o yuzden once kosulu bekliyoruz.
  await expect(page.locator("body")).toHaveClass(/tamEkran/);

  const tasma = await page.evaluate(() => ({
    dikey: document.documentElement.scrollHeight - window.innerHeight,
    yatay: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(tasma.dikey, "dolu seritte dikey tasma var").toBeLessThanOrEqual(1);
  expect(tasma.yatay, "dolu seritte yatay tasma var").toBeLessThanOrEqual(1);
});

// BOSTA_SURESI (BolumEkrani.tsx) 12 saniye: cocuk hicbir sey yapmazsa demo
// hatirlatma olarak tekrar oynar, ama YALNIZCA ilk durakta. Bu testin kendisi
// 12 saniyeden uzun surer; bilerek boyle - zamanlayiciyi taklit etmenin
// baska yolu yok ve bu, suitte boyle uzun bekleyen tek test.
test("cocuk uzun sure dokunmazsa demo yalnizca ilk durakta tekrar oynar", async ({ page }) => {
  // Iki bosta bekleyisin toplami varsayilan 30sn test suresini asabilir.
  test.setTimeout(45000);

  // Once ilk durak DISI bir durakta bosta kaliyoruz: zamanlayici burada hic
  // kurulmamali (ilkDurakDegil kontrolu bunu engeller). Regresyon bu kontrolu
  // atlarsa program burada da kendiliginden dolar.
  await page.goto(`/kodla/${KURS}/${BOLUMLER[1].id}/`);
  await page.waitForTimeout(13000);
  await expect(page.locator(".programBloku")).toHaveCount(0);

  // Simdi ilk durakta ayni sure bosta kalinca demo hatirlatma olarak
  // kendiliginden tekrar baslamali: hayaletin ekledigi blok belirir.
  await page.goto(`/kodla/${KURS}/${BOLUMLER[0].id}/`);
  // 12sn zamanlayiciya karsi rahat bir pay birakiyoruz; yuklu bir makinede
  // 14sn'lik bir sinir kararsizliga yol acabilir.
  await expect(page.locator(".programBloku")).toHaveCount(1, { timeout: 18000 });
});

// --- Karakter secimi ---
//
// Yukaridaki testler beforeEach'te secimi onceden yapilmis sayarak
// haritayi kullanir (bkz. dosya basindaki yorum); secim ekraninin KENDISI
// burada, temiz bir tarayici baglaminda dogrulanir. browser.newContext()
// kullanilmasinin nedeni: `page` fixture'ina addInitScript ile kurulan
// beforeEach, yalnizca o fixture'in kullandigi baglama yazilir - Playwright
// context'ler birbirinden izole depolama (localStorage) tasir, bu yuzden
// browser.newContext() ile acilan taze bir baglam beforeEach'in
// addInitScript'inden ETKILENMEZ ve kodla:karakter bos baslar. Bu, testin
// yazilmadan once elle dogrulanmistir (bkz. gorev-7-report.md).
//
// Bu bolumdeki her test kendi temiz baglamini `temizBaglamAc` ile acar.
// Sozsuz ilk temas demosu (dosya basindaki yorumda anlatilan, 12sn bosta
// kalinca kendiliginden calisan demo) beforeEach'te KASITLI kapatiliyordu;
// ayni gerekce burada da gecerli - demo bu testlerin konusu degil, kendi
// dosyasinda (kodla-demo.spec.ts) test ediliyor - bu yuzden temiz
// baglamlarda da demo bayragini onceden kapatiyoruz.
async function temizBaglamAc(
  browser: import("@playwright/test").Browser,
  secenekler?: Parameters<import("@playwright/test").Browser["newContext"]>[0],
) {
  const baglam = await browser.newContext(secenekler);
  const sayfa = await baglam.newPage();
  await sayfa.addInitScript(() => {
    try {
      localStorage.setItem("kodla:demo", "evet");
    } catch {
      // yok sayilir
    }
  });
  return { baglam, sayfa };
}

test("ilk giriste kus secimi sorulur, secim hatirlanir, secilen durak tiklanabilir", async ({
  browser,
}) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeVisible();

  await sayfa.getByRole("button", { name: "Flamingo" }).click();
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeHidden();

  // Kapanis turu (review): diyalog kapaninca odak bir yere KONULMALI, yoksa
  // <body>'ye duser ve klavye kullanan cocuk belgenin basindan yeniden
  // sekmelemek zorunda kalir. Ilk giriste geri donulecek bir "cagiran" yok
  // (madalyona tiklanmadi, secim karttan yapildi) - odagi ilk duraga
  // koymayi sectik: cocugun bir sonraki dogal adimi zaten oraya gitmek,
  // madalyon ise yalnizca "kusu degistir" gibi ikincil bir eylem.
  await expect(sayfa.getByRole("link", { name: /1\. durak/ })).toBeFocused();

  // Hicbir e2e testi haritadaki duraga TIKLAMIYORDU, yani secim ekraninin
  // haritanin ustunu kapatmasi yalnizca tesadufen zararsizdi - acik/kilitli
  // duraklarin gercekten tiklanabilir oldugunu hicbir test korumuyordu.
  // Secim kapandiktan sonra ilk durak gercekten tiklanabilmeli ve bolum
  // ekranina goturmeli.
  await sayfa.getByRole("link", { name: /1\. durak/ }).click();
  await expect(sayfa.getByRole("heading", { name: BOLUMLER[0].ad })).toBeVisible();

  // Ikinci acilista sorulmaz.
  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeHidden();

  // Madalyon secimi yeniden acar.
  await sayfa.getByRole("button", { name: /Kuşu değiştir/ }).click();
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeVisible();

  await baglam.close();
});

// (review) "secim yapilmadan harita kullanilamiyor" kurali daha once
// HICBIR kalici teste baglanmamisti - yalnizca elle, bir kerelik bir
// denemeyle dogrulanip test dosyasi silinmisti. Bu invaryant tamamen
// CSS'e dayanir (kodla.css'teki .karakterSecimi: position:fixed, inset:0,
// z-index:20, opak arkaplan);
// GocHaritasi.tsx'teki durak <Link>'i DOM'dan hic kaldirmaz, yalnizca
// gorsel/etkilesimsel olarak ustunu orter. z-index veya position
// gelecekte degistirilirse hicbir committed test bunu yakalamazdi. Kalici
// hale getiriyoruz. Arkaplanin opakligi tiklama denemesiyle DEGIL, testin
// sonundaki ayri bir olcumle korunuyor (gerekcesi orada).
//
// Formulasyon: gercek bir tiklama denemesi kisa bir timeout ile yapiliyor
// ve REDDETMESI bekleniyor. Playwright'in actionability kontrolu, hedef
// baska bir eleman tarafindan kapatildigi surece asla "tiklanabilir" hale
// gelmeyecegi icin click() suresiz beklerdi; bu yuzden kisa bir timeout
// (2000ms) veriyoruz ki test suitesi gereksiz uzamasin. force:true KULLANMA
// - o, actionability kontrolunu tamamen atlar ve tam da test etmek
// istedigimiz "gercekten tiklanamiyor" durumunu gizler. Bu formulasyon
// tercih edildi cunku ne zamanlayiciya ne animasyona bagli - tek kararsizlik
// kaynagi olabilecek sey sayfanin ilk yuklenmesidir, o da yukaridaki
// `toBeVisible()` beklemesiyle zaten senkronize ediliyor.
test("secim yapilmadan durak tiklanamaz, diyalog acik ve url degismez kalir", async ({
  browser,
}) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeVisible();

  await expect(
    sayfa.getByRole("link", { name: /1\. durak/ }).click({ timeout: 2000 }),
  ).rejects.toThrow();

  // Tiklama denemesi basarisiz olmus OLMALI ama sayfa hicbir yere gitmemis
  // OLMALI da: diyalog hala acik, url hala goc haritasinda.
  await expect(sayfa.getByRole("dialog", { name: "Kiminle uçalım?" })).toBeVisible();
  await expect(sayfa).toHaveURL(new RegExp(`/kodla/${KURS}/$`));

  // (review) yukaridaki tiklama denemesi yalnizca GEOMETRIYI olcer -
  // Playwright "tiklanacak noktada baska bir eleman var mi" diye bakar, o
  // elemanin gorunur olup olmadigina bakmaz.
  // Arkaplani seffaflastiran bir gerileme testi YESIL birakirdi, oysa
  // cocuk secim kartlarinin arkasindan haritayi gorurdu. Bu yuzden
  // ortunun gercekten opak oldugunu ayrica dogruluyoruz: rgb(...) ya da
  // alfasi 1 olan bir rgba(...) - "transparent" ve alfasi 1'den kucuk
  // her sey reddedilir.
  const ortuArkaplani = await sayfa
    .locator(".karakterSecimi")
    .evaluate((oge) => getComputedStyle(oge).backgroundColor);
  const alfa = ortuArkaplani.startsWith("rgba(")
    ? Number(ortuArkaplani.slice(5, -1).split(",")[3])
    : ortuArkaplani.startsWith("rgb(")
      ? 1
      : 0;
  expect(alfa, `secim ekraninin arkaplani opak degil: ${ortuArkaplani}`).toBe(1);

  await baglam.close();
});

// (review) yukaridaki test yalnizca FARE yolunu kapatir. role="dialog" +
// aria-modal="true" bir sozdur, uygulama degil: odak yonetimi yapilmazsa
// harita DOM'da durur, durak <Link>'leri sekme
// sirasindan cikmaz ve Tab-Tab-Enter kus secmeden bir bolume girer.
// Duzeltme iki parcali (bkz. GocHaritasi.tsx ve KarakterKartlari.tsx):
// haritanin ustune `inert` konur ve acilista ilk karta odaklanilir.
test("secim yapilmadan durak klavyeyle de acilamaz", async ({ browser }) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);
  const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });
  const kartlar = sayfa.locator(".karakterKarti");

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(diyalog).toBeVisible();

  /** Odaktaki ogeyi, haritanin icindeyse isaretleyerek betimler. */
  const odakBetimi = () =>
    sayfa.evaluate(() => {
      const oge = document.activeElement as HTMLElement | null;
      if (!oge) return "(odak yok)";
      const harita = oge.closest(".gocHaritasi") ? "HARITA:" : "";
      const etiket = oge.getAttribute("aria-label") ?? "";
      return `${harita}${oge.tagName}.${oge.className || "-"}${etiket ? `[${etiket}]` : ""}`;
    });

  // 1. Ileri ve geri sekmede odak bir kez bile haritanin icine girmemeli.
  //    Sekiz basis, iki tam turdan fazlasini kapsar (ortu kapaliyken
  //    odaklanabilir ogeler: iki kart, alt bilgi baglantisi, ust bar
  //    logosu).
  const zincir: string[] = [await odakBetimi()];
  for (let i = 0; i < 8; i++) {
    await sayfa.keyboard.press("Tab");
    zincir.push(await odakBetimi());
  }
  for (let i = 0; i < 8; i++) {
    await sayfa.keyboard.press("Shift+Tab");
    zincir.push(await odakBetimi());
  }
  expect(
    zincir.filter((betim) => betim.startsWith("HARITA:")),
    `odak haritaya girdi. zincir: ${zincir.join(" -> ")}`,
  ).toEqual([]);

  // 2. Sekme sirasindan cikmak yetmez: durak baglantisi PROGRAMATIK
  //    olarak da odak alamamali. Bu, sekme sirasindaki oge sayisindan
  //    bagimsiz, dogrudan `inert`i olcen kontrol.
  //    (review) asagidaki .focus() denemesi yalnizca ilk durak bir <a>
  //    OLDUGU icin anlamli - o her zaman aciktir (bkz. dosya basi), ama bu
  //    garanti gelecekte degisebilir.
  //    Kilitli bir ilk durak <div> olarak render edilir (bkz.
  //    GocHaritasi.tsx) ve <div>.focus() sessizce hicbir sey yapmaz -
  //    o zaman asagidaki expect, `inert` hic uygulanmasa da YANLISLIKLA
  //    yesile donerdi. Once elemanin gercekten odaklanabilir bir <a>
  //    oldugunu dogruluyoruz, sonra focus() denemesinin etkisiz oldugunu.
  const ilkDurak = sayfa.locator(".gocDuragi").first();
  const ilkDurakEtiketi = await ilkDurak.evaluate((oge) => oge.tagName);
  expect(
    ilkDurakEtiketi,
    "ilk durak <a> degil - asagidaki focus() denemesi anlamsiz olurdu",
  ).toBe("A");
  const durakOdaklandi = await ilkDurak.evaluate((oge) => {
    (oge as HTMLElement).focus();
    return document.activeElement === oge;
  });
  expect(durakOdaklandi, "durak baglantisi hala odak alabiliyor").toBe(false);

  // 3. Senaryonun kendisi: karti sekmeyle yeniden bulup Enter'a basmak.
  //    (review) sabit bir Tab sayisi yerine, odak PROGRAMATIK olarak ilk
  //    karta geri donene kadar SINIRLI sayida Tab basiyoruz ve yol boyunca
  //    haritaya hic girmemis olmasini
  //    dogruluyoruz. Sabit sayi kirilgandi: karakterler.json'a ucuncu bir
  //    kus eklenmesi, alt bilgiye/ust bara yeni bir baglanti eklenmesi,
  //    diyaloga bir kapatma dugmesi eklenmesi ya da bu ekranin
  //    body.tamEkran'a gecmesi (bkz. kodla.spec.ts'teki diger testler)
  //    zincirin uzunlugunu degistirir ve testi YANLISLIKLA kirmiziya
  //    dondururdu - hicbiri gercek bir gerileme degil. Onemli olan tek
  //    sey, hangi yoldan olursa olsun odagin haritaya HIC UGRAMADAN
  //    kartlara donmesidir.
  //
  //    `inert` kaldirilirsa gercek zincir (odak ilk karttan baslar):
  //    kart, kart, alt bilgi baglantisi, belge (body'ye sarar), logo,
  //    madalyon (5. Tab), durak (6. Tab) - asagidaki ilk expect tam bu
  //    HARITA:... girdisini yakalayip kirmiziya doner (bkz. rapor).
  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(diyalog).toBeVisible();
  // Mount effect'in odagi ilk karta tasimasini BEKLEMEDEN sekmeye
  // baslamak, yavas bir flush'ta butun zinciri bir kaydirirdi; bu
  // assertion hem o yarisi giderir hem de "acilista ilk karta odaklan"
  // davranisina kendi basina, dolayli olmayan bir test kazandirir.
  await expect(kartlar.first()).toBeFocused();

  const EN_FAZLA_SEKME = 20;
  const izlenenZincir: string[] = [];
  let ilkKartaDondu = false;
  for (let i = 0; i < EN_FAZLA_SEKME; i++) {
    await sayfa.keyboard.press("Tab");
    const betim = await odakBetimi();
    izlenenZincir.push(betim);
    if (betim.startsWith("HARITA:")) break;
    if (await kartlar.first().evaluate((oge) => oge === document.activeElement)) {
      ilkKartaDondu = true;
      break;
    }
  }
  expect(
    izlenenZincir.filter((betim) => betim.startsWith("HARITA:")),
    `odak haritaya girdi. zincir: ${izlenenZincir.join(" -> ")}`,
  ).toEqual([]);
  expect(
    ilkKartaDondu,
    `odak ${EN_FAZLA_SEKME} basista ilk karta donmedi. zincir: ${izlenenZincir.join(" -> ")}`,
  ).toBe(true);
  await sayfa.keyboard.press("Enter");

  // Enter bir KUS secmis olmali: adres degismedi, harita yerinde ve
  // kayitta bir kus var. Klavyeyle gelen cocuk gecerli bir duruma varir.
  await expect(sayfa).toHaveURL(new RegExp(`/kodla/${KURS}/$`));
  await expect(diyalog).toBeHidden();
  const secim = await sayfa.evaluate(() =>
    JSON.parse(localStorage.getItem("kodla:karakter") ?? "{}"),
  );
  expect(KARAKTERLER.map((k) => k.id)).toContain(secim[KURS]);

  await baglam.close();
});

// Escape: ilk giriste KAPATMAZ, madalyondan yeniden acildiginda kapatir.
// Gerekce ekranin ne oldugunda: ilk giriste bu bir gecittir, arkasinda
// gecerli bir durum yoktur - kapanirsa cocuk kussuz bir haritada kalirdi.
// Madalyondan acildiginda ise secim zaten yapilmistir; vazgecmek gecerli
// bir cevaptir ve cocugu bulundugu yerde birakir.
test("Escape ilk giriste kapatmaz, madalyondan acilinca kapatir", async ({ browser }) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);
  const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(diyalog).toBeVisible();
  await sayfa.keyboard.press("Escape");
  await expect(diyalog).toBeVisible();

  await diyalog.getByRole("button", { name: "Turna" }).click();
  await expect(diyalog).toBeHidden();
  // Kapanis turu (review): ilk giriste cagiran yok, odak ilk duraga gider.
  await expect(sayfa.getByRole("link", { name: /1\. durak/ })).toBeFocused();

  await sayfa.getByRole("button", { name: /Kuşu değiştir/ }).click();
  await expect(diyalog).toBeVisible();
  await sayfa.keyboard.press("Escape");
  await expect(diyalog).toBeHidden();
  // Vazgecmek secimi degistirmez.
  await expect(sayfa.getByRole("button", { name: "Kuşu değiştir: Turna" })).toBeVisible();
  // Kapanis turu (review): odak standart sozlesmeye gore CAGIRANA doner -
  // burada madalyon, cunku bu yol madalyona tiklanarak acilmisti. Odak
  // <body>'de kalsaydi klavye kullanan cocuk belgenin basindan yeniden
  // sekmelemek zorunda kalirdi.
  await expect(sayfa.getByRole("button", { name: "Kuşu değiştir: Turna" })).toBeFocused();

  await baglam.close();
});

// (review) Escape'i .karakterSecimi DIV'ine (yani diyalogun kendisine)
// baglamak, yalnizca odak diyalogun ICINDEYKEN calisir. Ortuye (bosluga)
// dokunmak odagi <body>'ye tasir -
// klavye olayi artik diyalogun altindan gecmez, cunku <body> diyalogun
// ATASI degil (kardesi/ustu), bubbling ona hic ugramaz. Tablet gercek
// senaryosunu simule ediyoruz: tiklama diyalogun kendi YUZEYINE (baslik
// metni - odaklanabilir degil) dusuyor, boylece hem "yuzeye tiklamak
// kapatmaz" hem de "odak <body>'ye dustukten sonra da Escape calisir"
// ayni testte dogrulanmis oluyor.
test("diyalogun yuzeyine tiklamak kapatmaz, odak body'ye dusse de Escape calisir", async ({
  browser,
}) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);
  const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(diyalog).toBeVisible();
  await diyalog.getByRole("button", { name: "Turna" }).click();
  await expect(diyalog).toBeHidden();

  // Madalyondan yeniden ac: bu yolda Escape kapatabilir olmali.
  await sayfa.getByRole("button", { name: /Kuşu değiştir/ }).click();
  await expect(diyalog).toBeVisible();

  // Baslik metnine tikla: odaklanabilir bir oge degil, dolayisiyla
  // tarayici odagi <body>'ye dusurur - ama bu diyalogun KENDI YUZEYI,
  // ortu degil, kapatmamali.
  await sayfa.locator(".karakterBaslik").click();
  await expect(diyalog).toBeVisible();
  const odakBodyMi = await sayfa.evaluate(() => document.activeElement === document.body);
  expect(odakBodyMi, "baslik tiklamasi odagi body'ye tasimadi, senaryo kurulamadi").toBe(true);

  // Odak body'deyken Escape hala calismali (document seviyesinde dinleniyor).
  await sayfa.keyboard.press("Escape");
  await expect(diyalog).toBeHidden();

  await baglam.close();
});

// Yukaridaki testle ayni gerekceyle: tabletin Escape tusu yok, kapatma
// dugmesi de yok - madalyon yolunda "vazgecmek" ancak ortuye (bosluga)
// dokunarak mumkun olmali. Ilk giriste ise ortu HICBIR SEY yapmamali
// (secim zorunlu).
test("bos ortuye dokunmak madalyon yolunda kapatir, ilk giriste hicbir sey yapmaz", async ({
  browser,
}) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);
  const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });

  await sayfa.goto(`/kodla/${KURS}/`);
  await expect(diyalog).toBeVisible();

  // Ilk giriste ortuye dokunmak hicbir sey yapmamali: secim zorunlu,
  // arkada gecerli bir durum yok. Diyalogun kendi kutusunun sol-ust kosesi
  // - baslik/kartlardan uzak, guvenle "ortu" sayilabilecek bir nokta.
  await sayfa.locator(".karakterSecimi").click({ position: { x: 10, y: 10 } });
  await expect(diyalog).toBeVisible();

  await diyalog.getByRole("button", { name: "Turna" }).click();
  await expect(diyalog).toBeHidden();

  // Madalyondan yeniden ac: bu yolda ortuye dokunmak vazgecmek demektir.
  await sayfa.getByRole("button", { name: /Kuşu değiştir/ }).click();
  await expect(diyalog).toBeVisible();
  await sayfa.locator(".karakterSecimi").click({ position: { x: 10, y: 10 } });
  await expect(diyalog).toBeHidden();
  // Vazgecmek secimi degistirmez.
  await expect(sayfa.getByRole("button", { name: "Kuşu değiştir: Turna" })).toBeVisible();

  await baglam.close();
});

// Diger dokunma hedefi testi ("bolum ekraninda kaydirma yok...") daima
// beforeEach'in karakter secimini onceden yapmis sayan baglaminda calisir,
// yani secim ekranina hic girmez. .karakterMadalyonu tam 64px (CSS'te sabit
// genislik/yukseklik) - sinirda oldugu icin ayrica olculmesi gerekir;
// .karakterKarti ise vw/vh'ye gore kuculebilen bir olcek tasir, dar/kisa
// ekranlarda da 64px'in altina dusmedigini burada dogruluyoruz.
test("karakter secim ekraninda dokunma hedefleri en az 64 piksel", async ({ browser }) => {
  for (const ekran of [
    { g: 820, y: 1180 },
    { g: 1180, y: 820 },
    { g: 1024, y: 768 },
    { g: 390, y: 844 },
    { g: 844, y: 390 },
  ]) {
    const { baglam, sayfa } = await temizBaglamAc(browser, {
      viewport: { width: ekran.g, height: ekran.y },
    });
    await sayfa.goto(`/kodla/${KURS}/`);
    const diyalog = sayfa.getByRole("dialog", { name: "Kiminle uçalım?" });
    await expect(diyalog).toBeVisible();

    // (review) kart sayisi yalnizca >0 degil, katalogdaki
    // karakter sayisiyla TAM eslesmeli - katalogdaki listeden turetiliyor
    // (KARAKTERLER.length), 2 olarak sabitlenmiyor; yarin uculu bir kurs
    // eklenirse test kendiliginden yeni beklentiye uyar.
    const kartlar = sayfa.locator(".karakterKarti");
    await expect(kartlar, `${ekran.g}x${ekran.y}`).toHaveCount(KARAKTERLER.length);
    const adet = await kartlar.count();
    for (let i = 0; i < adet; i++) {
      const kutu = (await kartlar.nth(i).boundingBox())!;
      expect(
        Math.min(kutu.width, kutu.height),
        `karakterKarti ${i} cok kucuk (${ekran.g}x${ekran.y})`,
      ).toBeGreaterThanOrEqual(64);
      // "Kaydirma yok" kurali bu ekranda scrollHeight ile OLCULEMEZ:
      // .karakterSecimi position:fixed'dir, yani ekrandan tasan icerik
      // documentElement.scrollHeight'i buyutmez. Kaydirma cubugu da
      // cikmaz; kart sessizce ustten/alttan kirpilir ve cocugun ikinci
      // kusa ulasmasinin hicbir yolu kalmaz. kodla.css'teki kart blogunun
      // yorumu tam olarak bu tehlikeyi anlatiyor ama hicbir test
      // korumuyordu. Gercek soru "sayfa kaydiriliyor mu" degil, "kart
      // GORUNUM ALANINDA mi" - onu soruyoruz.
      await expect(
        kartlar.nth(i),
        `karakterKarti ${i} gorunum alanindan tasti (${ekran.g}x${ekran.y})`,
      ).toBeInViewport({ ratio: 0.99 });
    }
    await expect(
      sayfa.locator(".karakterBaslik"),
      `karakterBaslik gorunum alanindan tasti (${ekran.g}x${ekran.y})`,
    ).toBeInViewport({ ratio: 0.99 });

    // Diyalog acikken varsayilan kusla eslesen bir madalyon da ekranda
    // olabilir; karti karakterKarti icinden seciyoruz (bkz. yukaridaki
    // reduced-motion testindeki ayni gerekce).
    await diyalog.getByRole("button", { name: "Turna" }).click();
    const madalyonKutu = (await sayfa.locator(".karakterMadalyonu").boundingBox())!;
    expect(
      Math.min(madalyonKutu.width, madalyonKutu.height),
      `karakterMadalyonu cok kucuk (${ekran.g}x${ekran.y})`,
    ).toBeGreaterThanOrEqual(64);

    await baglam.close();
  }
});

// Madalyon gorsel olarak yalnizca bir kus + daire: "buraya dokunursan kus
// degisir" bilgisi hicbir yazida tasinmiyordu, aria-label bile
// ("Kusu degistir") okuyamayan bir cocuga hicbir sey soylemez. Rozet bu
// bosluklu bilgiyi SEKILDE tasir; kendi bir dugme gibi OKUNMAMALI, yani
// madalyonun erisilebilir adi rozetle DEGISMEMELI.
test("kus madalyonu degisim rozeti tasir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/`);
  const madalyon = page.locator(".karakterMadalyonu");
  await expect(madalyon).toBeVisible();
  await expect(madalyon.locator(".madalyonRozeti"), "madalyon rozet tasimiyor").toBeVisible();
  await expect(madalyon).toHaveAccessibleName("Kuşu değiştir: Turna");
});

test("secilen kus bolum ekraninda gercekten cizilir", async ({ browser }) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);

  await sayfa.goto(`/kodla/${KURS}/`);
  await sayfa.getByRole("button", { name: "Flamingo" }).click();
  await sayfa.goto(`/kodla/${KURS}/${BOLUMLER[0].id}/`);

  // Govde rengi secilen karakterin paletiyle eslesmeli. Renk karsilastirmasi
  // kirilgan gorunur ama tam bu yuzden degerlidir: "flamingo sectim, hala
  // beyaz kus yuruyor" hatasini baska hicbir test yakalamaz.
  //
  // Iki incelik:
  //
  // 1. Beklenen renk KATALOGDAN turetilir, elle yazilmaz. Elle yazilan bir
  //    hex, flamingo'nun paleti degisince testi "yanlis ama yesil" birakir
  //    ya da alakasiz bir yerde kirmiziya dondururdu.
  // 2. Beklenti yeniden denenen bir assertion olmali. Sunucuda uretilen
  //    HTML zaten bir <ellipse> icerir ve VARSAYILAN (turna) rengiyle
  //    gelir; flamingo paleti ancak hydration'dan sonra, bir useEffect ile
  //    yerine oturur. locator.evaluate yalnizca ogenin DOM'a girmesini
  //    bekler, hydration'i beklemez - yuklu bir makinede turna rengi
  //    okunurdu. Bu depoda ayni yaris body.tamEkran ile bir kez yasandi
  //    (bkz. yukaridaki iki yorum).
  const flamingo = KARAKTERLER.find((k) => k.id === "flamingo")!;
  await expect(sayfa.locator(".kodlaKarakter ellipse").first()).toHaveCSS(
    "fill",
    rgbYaz(flamingo.palet.govde),
  );

  await baglam.close();
});
