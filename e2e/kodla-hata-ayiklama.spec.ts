// Hata ayiklama duraklari: serit bos degil, BOZUK bir programla acilir.
//
// Kizilirmak Deltasi'nda bir blok eksiktir (kus yolun yarisinda kalir),
// Kuyucuk Golu'nde bir blok yanlis siradadir (kus duvara toslar). Cocuk
// programi calistirir, ne oldugunu gorur, duzeltir.
import { test, expect, type Page } from "@playwright/test";

const KURS = "turna-yolu";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([kurs]) => {
      localStorage.setItem("kodla:demo", "evet");
      localStorage.setItem("kodla:karakter", JSON.stringify({ [kurs]: "turna" }));
    },
    [KURS],
  );
});

function bloklar(page: Page) {
  return page.locator(".programSeridi .programBloku");
}

/** Kosu bitene kadar bekler: dugmeler yeniden acilinca kosu bitmistir. */
async function kosuyuBekle(page: Page) {
  await expect(page.getByRole("button", { name: "Çalıştır" })).toBeEnabled({ timeout: 15000 });
}

test("bulmaca bozuk bir programla acilir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/kizilirmak-deltasi/`);

  // Ilk bulmacada iki blok hazir bekler; ucuncusu eksik.
  await expect(bloklar(page)).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Çalıştır" })).toBeEnabled();
});

test("bozuk program calistirilinca bulmaca bitmez", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/kizilirmak-deltasi/`);

  await page.getByRole("button", { name: "Çalıştır" }).click();
  await kosuyuBekle(page);

  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);
  await expect(bloklar(page)).toHaveCount(2);
});

test("eksik blok eklenince bulmaca biter", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/kizilirmak-deltasi/`);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await expect(bloklar(page)).toHaveCount(3);
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("yanlis sirali blok silinip yeniden eklenerek duzeltilir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/kuyucuk-golu/`);

  // Hazir program: yukari, saga, saga, yukari. Bastaki "yukari" yanlis
  // yerde; kus duvara toslar.
  await expect(bloklar(page)).toHaveCount(4);
  await page.getByRole("button", { name: "Çalıştır" }).click();
  await kosuyuBekle(page);
  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);

  await page.getByRole("button", { name: "Yukarı git bloğunu sil" }).first().click();
  await expect(bloklar(page)).toHaveCount(3);
  await page.getByRole("button", { name: "Yukarı git", exact: true }).click();
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("hepsini temizle bozuk programa geri doner, seridi bosaltmaz", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/kuyucuk-golu/`);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await expect(bloklar(page)).toHaveCount(5);

  await page.getByRole("button", { name: "Hepsini temizle" }).click();

  // Bulmacanin kendi programina donuldu: temizlemek "bastan dene" demek,
  // "bulmacayi coz" demek degil.
  await expect(bloklar(page)).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Hepsini temizle" })).toBeDisabled();
});
