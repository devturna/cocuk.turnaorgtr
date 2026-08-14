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
