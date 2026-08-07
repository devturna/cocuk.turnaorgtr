import { test, expect } from "@playwright/test";
import katalog from "../content/boyama-katalogu.json";

// Her resmin her bolgesinin gercekten boyanabildigini dogrular.
for (const resim of katalog) {
  test(`${resim.id}: butun bolgeler boyanabiliyor`, async ({ page }) => {
    await page.goto(`/boyama/${resim.id}/`);
    await page.getByRole("button", { name: "Kırmızı" }).click();

    const bolgeler = page.locator(".cizgiKatmani .boyanabilir");
    const adet = await bolgeler.count();
    expect(adet, `${resim.id} icin boyanabilir bolge bulunamadi`).toBeGreaterThan(0);

    // Bolgeler ust uste binebildigi icin merkeze tiklamak yanlis bolgeyi secebilir.
    // Bu yuzden olayi dogrudan bolgenin kendisine gonderiyoruz.
    for (let i = 0; i < adet; i++) {
      const bolge = bolgeler.nth(i);
      await bolge.dispatchEvent("pointerdown", { bubbles: true });
      await expect(bolge, `${resim.id} bolge ${i} boyanmadi`).toHaveAttribute("fill", "#e74c3c");
    }
  });
}
