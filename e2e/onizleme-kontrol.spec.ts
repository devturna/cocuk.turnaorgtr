import { test, expect } from "@playwright/test";

test("her kategoride onizlemeler gercekten yukleniyor", async ({ page }) => {
  await page.goto("/boyama/");

  for (const kategori of ["Hayvanlar", "Köpekler", "Araçlar", "Doğa", "Şekiller"]) {
    await page.getByRole("button", { name: kategori }).click();

    const resimler = page.locator(".galeriOnizleme");
    const adet = await resimler.count();
    expect(adet, `${kategori} bos`).toBeGreaterThan(0);

    for (let i = 0; i < adet; i++) {
      const img = resimler.nth(i);
      const ad = await img.getAttribute("alt");
      await expect
        .poll(
          () => img.evaluate((e: HTMLImageElement) => e.naturalWidth),
          { message: `${kategori} / ${ad} onizlemesi yuklenmedi` },
        )
        .toBeGreaterThan(0);
    }
  }
});

// Galeri ekrandan uzun olabilir; boyle bir sayfada alt bilgi resimlerin
// uzerine binmemeli. Bir kez body'ye sabit yukseklik verildigi icin tam
// olarak bu olmustu.
test("galeri uzadiginda alt bilgi resimlerin uzerine binmez", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/boyama/");

  const izgara = (await page.locator(".galeriIzgara").boundingBox())!;
  const altBilgi = (await page.locator(".altBilgi").boundingBox())!;

  expect(altBilgi.y, "alt bilgi izgaranin icinde kaliyor").toBeGreaterThanOrEqual(
    izgara.y + izgara.height,
  );
});
