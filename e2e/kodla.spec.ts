import { test, expect, type Page } from "@playwright/test";
import { kursBolumleri, bolumHaritasi } from "../lib/kodla/bolumler";
import { kursKarakterleri } from "../lib/kodla/karakterler";
import { enKisaCozumYolu } from "../lib/kodla/labirent/cozucu";
import { KOMUT_SETLERI, komutAnahtari } from "../lib/kodla/labirent/komutlar";
import { onizlemeYolu } from "../lib/kodla/labirent/onizleme";
import { EN_FAZLA_BLOK } from "../lib/kodla/program";
import { KOMUT_ADLARI } from "../components/kodla/labirent/komutGorunumu";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);
const KARAKTERLER = kursKarakterleri(KURS);

// Sozsuz ilk temas demosu ilk durakta kendi kendine bir blok ekleyip
// calistiriyor (Gorev 9). Bu dosyadaki testler paleti kendileri surdugu
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
  const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti)!;
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
  const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti)!;
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
  const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti)!;
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
  const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti)!;
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
    bolumHaritasi(bolum),
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
  test.setTimeout(30000);
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
  // Gorev 5'te eklenen .karakterKarti ve .karakterMadalyonu gecisleri daha
  // once hicbir e2e testinde reducedMotion baglaminda dogrulanmiyordu (bu
  // test dogrudan bolum ekranina giderdi, haritaya hic ugramazdi) - burada
  // haritayi da ziyaret ederek o boslugu kapatiyoruz.
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
  const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti)!;
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
// hangisi oldugu dogrudan gorunsun diye her bolum ayri bir testtir.
for (const bolum of BOLUMLER) {
  test(`${bolum.ad} bolumu cozumle bitirilebilir`, async ({ page }) => {
    const yol = enKisaCozumYolu(bolumHaritasi(bolum), bolum.komutSeti);
    expect(yol, `${bolum.id} icin cozum bulunamadi`).not.toBeNull();

    await page.goto(`/kodla/${KURS}/${bolum.id}/`);
    await programiDiz(page, yol!.map(komutAnahtari));
    await page.getByRole("button", { name: "Çalıştır" }).click();

    await expect(page.getByText("Harika! En kısa yol!"), `${bolum.id} tamamlanamadi`).toBeVisible({
      timeout: 20000,
    });
  });
}

test("bolum ekraninda kaydirma yok ve dokunma hedefleri en az 64 piksel", async ({ page }) => {
  for (const ekran of [
    { g: 820, y: 1180 },
    { g: 1180, y: 820 },
    { g: 1024, y: 768 },
    { g: 390, y: 844 },
  ]) {
    await page.setViewportSize({ width: ekran.g, height: ekran.y });
    await page.goto(`/kodla/${KURS}/${BOLUMLER[0].id}/`);

    // Tam ekran duzeni bir useEffect icinde body'ye sinif ekleyerek kuruluyor;
    // hydration bitmeden olcum yapmak, ust bar ve alt bilgi hala ekrandayken
    // olcmek demektir. Yavas bir makinede bu yarisi kaybediyoruz (CI'da tam
    // olarak bu oldu), o yuzden once kosulu bekliyoruz.
    await expect(page.locator("body")).toHaveClass(/tamEkran/);

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

  // Yonlendirilen madde 1: hicbir e2e testi haritadaki duraga TIKLAMIYORDU,
  // yani secim ekraninin haritanin ustunu kapatmasi yalnizca tesadufen
  // zararsizdi - acik/kilitli duraklarin gercekten tiklanabilir oldugunu
  // hicbir test korumuyordu. Secim kapandiktan sonra ilk durak gercekten
  // tiklanabilmeli ve bolum ekranina goturmeli.
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

// Duzeltme turu 1 (review): §11 madde 1'in "secim yapilmadan harita
// kullanilamiyor" yarisi daha once HICBIR kalici teste baglanmamisti -
// yalnizca elle, bir kerelik bir denemeyle dogrulanip test dosyasi
// silinmisti. Bu invaryant tamamen CSS'e dayanir (kodla.css'teki
// .karakterSecimi: position:fixed, inset:0, z-index:20, opak arkaplan);
// GocHaritasi.tsx'teki durak <Link>'i DOM'dan hic kaldirmaz, yalnizca
// gorsel/etkilesimsel olarak ustunu orter. z-index, position veya arkaplan
// gelecekte degistirilirse hicbir committed test bunu yakalamazdi. Kalici
// hale getiriyoruz.
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

    // Duzeltme turu 1 (review): kart sayisi yalnizca >0 degil, katalogdaki
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
    }

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

test("secilen kus bolum ekraninda gercekten cizilir", async ({ browser }) => {
  const { baglam, sayfa } = await temizBaglamAc(browser);

  await sayfa.goto(`/kodla/${KURS}/`);
  await sayfa.getByRole("button", { name: "Flamingo" }).click();
  await sayfa.goto(`/kodla/${KURS}/${BOLUMLER[0].id}/`);

  // Govde rengi secilen karakterin paletiyle eslesmeli. Renk karsilastirmasi
  // kirilgan gorunur ama tam bu yuzden degerlidir: "flamingo sectim, hala
  // beyaz kus yuruyor" hatasini baska hicbir test yakalamaz.
  const govdeRengi = await sayfa
    .locator(".kodlaKarakter ellipse")
    .first()
    .evaluate((o) => getComputedStyle(o).fill);
  console.log(`  govde rengi: ${govdeRengi}`);
  expect(govdeRengi).toBe("rgb(242, 162, 184)");

  await baglam.close();
});
