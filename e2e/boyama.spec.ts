import { test, expect } from "@playwright/test";

test("cocuk bir resmi boyar, geri alir ve cizim sayfa yenilenince durur", async ({ page }) => {
  await page.goto("/boyama/kedi/");
  await expect(page.getByRole("heading", { name: "Kedi" })).toBeVisible();

  // Kirmizi rengi sec ve govdeyi boya.
  await page.getByRole("button", { name: "Kırmızı" }).click();
  const govde = page.locator("#govde");
  await govde.click();
  await expect(govde).toHaveAttribute("fill", "#e74c3c");

  // Geri al calisiyor mu.
  await page.getByRole("button", { name: "Geri Al" }).click();
  await expect(govde).toHaveAttribute("fill", "#ffffff");

  // Yeniden boya ve sayfayi yenile; cizim durmali.
  await govde.click();
  await page.reload();
  await expect(page.locator("#govde")).toHaveAttribute("fill", "#e74c3c");
});

test("firca ile serbest cizim yapilir ve silgi cizgiyi kaldirir", async ({ page }) => {
  await page.goto("/boyama/balik/");

  await page.getByRole("button", { name: "Fırça" }).click();
  await page.getByRole("button", { name: "Mavi" }).click();

  // Tuval uzerinde parmak hareketini taklit et.
  const tuval = page.locator(".tuvalKapsayici");
  const kutu = (await tuval.boundingBox())!;
  await page.mouse.move(kutu.x + kutu.width * 0.3, kutu.y + kutu.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(kutu.x + kutu.width * 0.5, kutu.y + kutu.height * 0.6, { steps: 10 });
  await page.mouse.up();

  const cizgiler = page.locator(".fircaKatmani .fircaCizgisi");
  await expect(cizgiler).toHaveCount(1);

  // Silgi ile ayni cizgiye dokun.
  await page.getByRole("button", { name: "Silgi" }).click();
  await cizgiler.first().click({ force: true });
  await expect(page.locator(".fircaKatmani .fircaCizgisi")).toHaveCount(0);
});

test("galeriden resim secilir ve baslanan resim isaretlenir", async ({ page }) => {
  await page.goto("/boyama/");
  await expect(page.getByRole("heading", { name: "Hangi resmi boyayalım?" })).toBeVisible();

  await page.getByRole("link", { name: "Kedi" }).click();
  await expect(page.getByRole("heading", { name: "Kedi" })).toBeVisible();

  await page.locator("#kafa").click();
  await page.getByRole("link", { name: "Resimler" }).click();

  await expect(page.locator(".galeriKarti", { hasText: "Kedi" })
    .locator(".devamRozeti")).toBeVisible();
});
