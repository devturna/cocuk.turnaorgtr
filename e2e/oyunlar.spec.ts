// Oyunlar bolumu: kaybetmenin olmadigi kisa oyunlar.
import { test, expect } from "@playwright/test";
import { desteUret, turdakiKartSayisi } from "../lib/oyunlar/hafiza";

test("ana sayfadan Oyunlar bolumu acilir", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Oyunlar" }).click();
  await expect(page.getByRole("heading", { name: "Hangi oyun?" })).toBeVisible();
});

test("Hafiza oyunu dort kapali kartla acilir", async ({ page }) => {
  await page.goto("/oyunlar/");
  await page.getByRole("link", { name: "Hafıza" }).click();

  await expect(page.getByRole("heading", { name: "Hafıza" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kapalı kart" })).toHaveCount(4);
});

test("acilan kart simgesini gosterir, ucuncu kart acilmaz", async ({ page }) => {
  await page.goto("/oyunlar/hafiza/");
  const kartlar = page.locator(".hafizaKarti");

  await kartlar.nth(0).click();
  await expect(page.getByRole("button", { name: /Açık kart/ })).toHaveCount(1);

  await kartlar.nth(1).click();
  await expect(page.getByRole("button", { name: /Açık kart/ })).toHaveCount(2);

  // Iki kart acikken ucuncusune dokunmak bir sey yapmaz: karar
  // verilmeden yeni kart acilmaz.
  await kartlar.nth(2).click();
  await expect(page.getByRole("button", { name: /Açık kart/ })).toHaveCount(2);
});

test("eslesmeyen kartlar kapanir, eslesenler acik kalir", async ({ page }) => {
  await page.goto("/oyunlar/hafiza/");
  const deste = desteUret(0);
  const kartlar = page.locator(".hafizaKarti");

  // Eslesmeyen bir cift: kisa bekleyisten sonra ikisi de kapanir.
  const farkli = deste.findIndex((kart) => kart.simge !== deste[0].simge);
  await kartlar.nth(0).click();
  await kartlar.nth(farkli).click();
  await expect(page.getByRole("button", { name: "Kapalı kart" })).toHaveCount(4, {
    timeout: 5000,
  });

  // Eslesen cift acik kalir.
  const esi = deste.findIndex((kart, sira) => sira !== 0 && kart.simge === deste[0].simge);
  await kartlar.nth(0).click();
  await kartlar.nth(esi).click();
  await expect(page.locator(".hafizaKarti.bulundu")).toHaveCount(2, { timeout: 5000 });
});

test("butun ciftler bulununca kutlama cikar ve sonraki tur buyur", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/oyunlar/hafiza/");
  const deste = desteUret(0);
  const kartlar = page.locator(".hafizaKarti");

  // Desteyi biliyoruz: ciftleri sirayla aciyoruz.
  const acilanlar = new Set<number>();
  for (const kart of deste) {
    if (acilanlar.has(kart.sira)) continue;
    const esi = deste.find((aday) => aday.sira !== kart.sira && aday.simge === kart.simge)!;
    acilanlar.add(kart.sira);
    acilanlar.add(esi.sira);
    await kartlar.nth(kart.sira).click();
    await kartlar.nth(esi.sira).click();
    await expect(page.locator(".hafizaKarti.bulundu")).toHaveCount(acilanlar.size, {
      timeout: 5000,
    });
  }

  await expect(page.getByText("Hepsini buldun!")).toBeVisible();
  // Kutlamanin kendi "Sonraki" dugmesi; alt bardaki de ayni adi tasiyor.
  await page.getByRole("status").getByRole("button", { name: "Sonraki" }).click();
  await expect(page.locator(".hafizaKarti")).toHaveCount(turdakiKartSayisi(1));
});

// --- Golge oyunu ---

test("Golge oyunu bir nesne ve dort golge gosterir", async ({ page }) => {
  await page.goto("/oyunlar/");
  await page.getByRole("link", { name: "Gölge" }).click();

  await expect(page.getByRole("heading", { name: "Gölge" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Bunun gölgesini bul" })).toBeVisible();
  await expect(page.locator(".golgeSecenegi")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Doğru gölge" })).toHaveCount(1);
});

test("yanlis golge turu bitirmez, dogru golge kutlanir", async ({ page }) => {
  await page.goto("/oyunlar/golge/");

  await page.getByRole("button", { name: "Gölge", exact: true }).first().click();
  await expect(page.getByText("Buldun!")).toHaveCount(0);

  await page.getByRole("button", { name: "Doğru gölge" }).click();
  await expect(page.getByText("Buldun!")).toBeVisible();

  await page.getByRole("status").getByRole("button", { name: "Sonraki" }).click();
  await expect(page.getByText("Buldun!")).toHaveCount(0);
});

test("golge gercekten karartilmis simgedir", async ({ page }) => {
  await page.goto("/oyunlar/golge/");
  const filtre = await page
    .locator(".golgeSekli")
    .first()
    .evaluate((el) => getComputedStyle(el).filter);
  expect(filtre).toContain("brightness(0)");
});
