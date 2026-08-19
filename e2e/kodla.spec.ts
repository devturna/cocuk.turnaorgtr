import { test, expect, type Page } from "@playwright/test";
import { kursBolumleri, bolumHaritasi } from "../lib/kodla/bolumler";
import { enKisaCozumYolu } from "../lib/kodla/labirent/cozucu";
import { KOMUT_SETLERI, komutAnahtari } from "../lib/kodla/labirent/komutlar";
import { EN_FAZLA_BLOK } from "../lib/kodla/program";
import { KOMUT_ADLARI } from "../components/kodla/labirent/komutGorunumu";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);

// Sozsuz ilk temas demosu ilk durakta kendi kendine bir blok ekleyip
// calistiriyor (Gorev 9). Bu dosyadaki testler paleti kendileri surdugu
// icin demo devrede kalirsa programa beklenmedik bir blok karisir ve
// sonuclar kararsizlasir. Demo'nun kendisi kodla-demo.spec.ts icinde ayrica
// test ediliyor; burada sessizce kapatiyoruz.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kodla:demo", "evet"));
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

  // Sona fazladan blok: Turna hedefe varinca kalan bloklar calistirilmaz,
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

  const tasma = await page.evaluate(() => ({
    dikey: document.documentElement.scrollHeight - window.innerHeight,
    yatay: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(tasma.dikey, "dolu seritte dikey tasma var").toBeLessThanOrEqual(1);
  expect(tasma.yatay, "dolu seritte yatay tasma var").toBeLessThanOrEqual(1);
});
