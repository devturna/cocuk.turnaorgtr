import { test, expect } from "@playwright/test";

// Cocuklar boya ve firca secmek icin sayfayi kaydirmak zorunda kalmamali.
// Bu test, boyama ekraninin gercekten tek ekrana sigdigini dogrular.

const EKRANLAR = [
  { ad: "tablet dikey", genislik: 820, yukseklik: 1180 },
  { ad: "tablet yatay", genislik: 1180, yukseklik: 820 },
  { ad: "kucuk tablet yatay", genislik: 1024, yukseklik: 768 },
  { ad: "telefon dikey", genislik: 390, yukseklik: 844 },
];

for (const ekran of EKRANLAR) {
  test(`${ekran.ad}: boyama ekraninda kaydirma yok`, async ({ page }) => {
    await page.setViewportSize({ width: ekran.genislik, height: ekran.yukseklik });
    await page.goto("/boyama/kedi/");

    // Sayfa icerigi ekrandan tasmamali.
    const tasma = await page.evaluate(() => ({
      dikey: document.documentElement.scrollHeight - window.innerHeight,
      yatay: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect(tasma.dikey, "dikey tasma var").toBeLessThanOrEqual(1);
    expect(tasma.yatay, "yatay tasma var").toBeLessThanOrEqual(1);

    // Butun araclar ve renkler kaydirmadan gorunur olmali.
    for (const ad of ["Boya", "Fırça", "Silgi", "Geri Al", "Baştan Başla"]) {
      await expect(page.getByRole("button", { name: ad }), `${ad} gorunmuyor`).toBeInViewport();
    }
    for (const renk of ["Kırmızı", "Mavi", "Sarı", "Siyah", "Beyaz"]) {
      await expect(page.getByRole("button", { name: renk }), `${renk} gorunmuyor`).toBeInViewport();
    }

    // Tuval de tamamen gorunur olmali.
    await expect(page.locator(".tuvalKapsayici")).toBeInViewport({ ratio: 0.99 });
  });
}

test("dokunma hedefleri en az 48 piksel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/boyama/kedi/");

  const dugmeler = page.locator(".aracDugmesi, .renkDugmesi, .kalinlikDugmesi");
  const adet = await dugmeler.count();

  for (let i = 0; i < adet; i++) {
    const kutu = (await dugmeler.nth(i).boundingBox())!;
    const etiket = await dugmeler.nth(i).getAttribute("aria-label");
    expect(Math.min(kutu.width, kutu.height), `${etiket ?? i} cok kucuk`).toBeGreaterThanOrEqual(48);
  }
});
