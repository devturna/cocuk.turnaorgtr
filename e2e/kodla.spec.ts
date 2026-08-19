import { test, expect, type Page } from "@playwright/test";
import { kursBolumleri, bolumHaritasi } from "../lib/kodla/bolumler";
import { enKisaCozumYolu } from "../lib/kodla/labirent/cozucu";
import { komutAnahtari } from "../lib/kodla/labirent/komutlar";
import { KOMUT_ADLARI } from "../components/kodla/labirent/komutGorunumu";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);

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

    const dugmeler = page.locator(".komutDugmesi, .kodlaYardimciDugme, .calistirDugmesi");
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
