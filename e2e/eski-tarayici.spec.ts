import { test, expect } from "@playwright/test";

// Eski tarayicilarda tuvalin kaybolmasini engeller.
//
// Tuvalin boyutu bir donem yalnizca container query birimlerine (cqw/cqh) ve
// aspect-ratio'ya baglıydi. Bu ozellikler Chrome 105 ve Chrome 88 ile geldi;
// daha eski bir tarayicida tuval 0 piksel olup ekranda kucuk bir nokta olarak
// goruluyordu. Asagidaki test o ozellikleri kapatarak eski tarayiciyi taklit
// eder ve tuvalin yine de gorunur ve kare oldugunu dogrular.
// Eski tarayicida aspect-ratio ve container query yoktur. Asagidaki override
// ikisini de kapatir; geriye yalnizca Tuval.tsx'in kendi olctugu boyut kalir.
// Not: width/height burada ezilmez, cunku gercek tarayicida da satir ici
// stil gecerlidir; ezersek testin olctugu sey gerceklikten kopar.
const ESKI_TARAYICI_CSS = `
  .tuvalAlani { container-type: normal !important; }
  .tuvalKapsayici { aspect-ratio: auto !important; }
`;

for (const ekran of [
  { ad: "tablet dikey", g: 820, y: 1180 },
  { ad: "tablet yatay", g: 1180, y: 820 },
  { ad: "telefon", g: 390, y: 844 },
]) {
  test(`${ekran.ad}: container query ve aspect-ratio olmadan tuval gorunur`, async ({ page }) => {
    await page.setViewportSize({ width: ekran.g, height: ekran.y });
    await page.goto("/boyama/kedi/");
    await page.addStyleTag({ content: ESKI_TARAYICI_CSS });

    const tuval = page.locator(".tuvalKapsayici");
    const kutu = (await tuval.boundingBox())!;

    expect(kutu.width, "tuval genisligi cok kucuk").toBeGreaterThan(200);
    expect(kutu.height, "tuval yuksekligi cok kucuk").toBeGreaterThan(200);
    expect(
      Math.abs(kutu.width - kutu.height),
      "tuval kare degil",
    ).toBeLessThanOrEqual(2);

    // Cizgi resmi de gercekten gorunur olmali.
    await expect(tuval.locator("svg").first()).toBeVisible();
    await expect(tuval).toBeInViewport({ ratio: 0.99 });
  });
}

// Ust barin gizlenmesi ve kaydirmanin kapanmasi bir donem CSS'in :has()
// secicisine baglıydı; :has() da yeni bir ozellik oldugu icin eski
// tarayicida kaydirma geri geliyordu. Artik sinifi bilesen ekliyor.
test("boyama ekrani acilinca body sinifi eklenir, cikinca kalkar", async ({ page }) => {
  await page.goto("/boyama/");
  await expect(page.locator("body")).not.toHaveClass(/tamEkran/);

  await page.getByRole("link", { name: "Kedi" }).click();
  await expect(page.locator("body")).toHaveClass(/tamEkran/);
  await expect(page.locator(".ustBar")).toBeHidden();

  await page.getByRole("link", { name: "Resimler" }).click();
  await expect(page.locator("body")).not.toHaveClass(/tamEkran/);
  await expect(page.locator(".ustBar")).toBeVisible();
});
