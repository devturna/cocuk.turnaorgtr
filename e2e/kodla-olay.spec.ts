// Olay mekanigi: Gol Kiyisi kursu.
//
// Onceki iki mekanikte cocuk "calistir"a basar; burada calistiran sey
// cocugun kendi dokunusudur. Test de bunu olcer: kural yazilinca bulmaca
// biter, nesneye dokununca kural oynar.
import { test, expect } from "@playwright/test";

const KURS = "gol-kiyisi";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([kurs]) => {
      localStorage.setItem("kodla:demo", "evet");
      localStorage.setItem("kodla:karakter", JSON.stringify({ [kurs]: "turna" }));
    },
    [KURS],
  );
});

test("kurs kartlari arasinda Gol Kiyisi vardir", async ({ page }) => {
  await page.goto("/kodla/");
  await expect(page.getByRole("link", { name: /Göl Kıyısı/ })).toBeVisible();
});

test("bulmaca bir istekle acilir ve eylem dugmeleri once kapalidir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/egirdir-golu/`);

  await expect(page.getByRole("note", { name: /Kurbağa dokununca zıpla/ })).toBeVisible();
  // Nesne secilmeden eylem yazilamaz: kural HANGI nesneye yazilacak?
  await expect(page.getByRole("button", { name: "Zıpla" })).toBeDisabled();
});

test("nesne secilip eylem verilince kural yazilir ve bulmaca biter", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/egirdir-golu/`);

  await page.getByRole("button", { name: "Kurbağa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Zıpla" })).toBeEnabled();
  await page.getByRole("button", { name: "Zıpla" }).click();

  // Kural seritte tek cumle olarak gorunur.
  await expect(page.getByRole("listitem", { name: "Kurbağa dokununca zıpla" })).toBeVisible();
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("yanlis eylem bulmacayi bitirmez, ustune yazmak duzeltir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/egirdir-golu/`);

  await page.getByRole("button", { name: "Kurbağa", exact: true }).click();
  await page.getByRole("button", { name: "Dön" }).click();
  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);

  // Bir nesnenin bir kurali olur: ikincisi oncekinin yerine gecer.
  await page.getByRole("button", { name: /Kurbağa/ }).first().click();
  await page.getByRole("button", { name: "Zıpla" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("kural yazilan nesne dokununca oynar", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/bafa-golu/`);

  // Serbest oyun duragi: istek yok, ilk kural yildizi kazandirir.
  await expect(page.getByText("Ne istersen onu yap")).toBeVisible();
  await page.getByRole("button", { name: "Kelebek", exact: true }).click();
  await page.getByRole("button", { name: "Dön" }).click();

  await expect(page.getByText("Senin oyunun!")).toBeVisible({ timeout: 15000 });
});

test("kural yazilmamis nesneye dokunmak hicbir sey yapmaz", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/bafa-golu/`);

  await page.getByRole("button", { name: "Balık", exact: true }).click();

  await expect(page.locator(".olayNesnesi.secili")).toHaveCount(1);
  await expect(page.locator("[class*='oynuyor-']")).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("her olay duraginin butun bulmacalari cozulebilir", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto(`/kodla/${KURS}/egirdir-golu/`);

  const istekler = [
    ["Kurbağa", "Zıpla"],
    ["Kuş", "Öt"],
    ["Bulut", "Dön"],
    ["Çiçek", "Büyü"],
  ];
  for (const [nesne, eylem] of istekler) {
    await page.getByRole("button", { name: nesne, exact: true }).click();
    await page.getByRole("button", { name: eylem }).click();
    if (nesne !== "Çiçek") {
      await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText("Sıradaki bulmaca")).toBeHidden({ timeout: 15000 });
    }
  }

  await expect(page.getByText("Senin oyunun!")).toBeVisible({ timeout: 15000 });
});

test("bir bulmacayi cozmek ilerlemeyi bir artirir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/egirdir-golu/`);

  await page.getByRole("button", { name: "Kurbağa", exact: true }).click();
  await page.getByRole("button", { name: "Zıpla" }).click();
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });

  // Kayit tek bulmaca ilerlemeli. Ilerleme yazisi bir React guncelleyicisi
  // icinde yapilsaydi cift cagrilip iki bulmaca atlatirdi.
  const ilerleme = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kodla:bulmaca") ?? "{}"),
  );
  expect(ilerleme["gol-kiyisi"]["egirdir-golu"].cozulen).toBe(1);
});
