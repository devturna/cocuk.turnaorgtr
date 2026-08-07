import { test, expect } from "@playwright/test";
import { RAKAM_YOLLARI, kontrolNoktalari } from "../lib/ogren/rakamYollari";

// YazOyunu.tsx icindeki EN_AZ_ARALIK ile ayni olmali.
const EN_AZ_ARALIK = 42;

/** Rakamin butun kontrol noktalarindan sirayla gecerek rakami yazar. */
async function rakamiYaz(page: import("@playwright/test").Page, rakam: number) {
  const kutu = (await page.locator(".yaziTuvali").boundingBox())!;
  const ekranNoktasi = (n: { x: number; y: number }) => ({
    x: kutu.x + (n.x / 400) * kutu.width,
    y: kutu.y + (n.y / 400) * kutu.height,
  });

  for (const vurus of RAKAM_YOLLARI[rakam]) {
    const noktalar = kontrolNoktalari(vurus, EN_AZ_ARALIK);
    const ilk = ekranNoktasi(noktalar[0]);
    await page.mouse.move(ilk.x, ilk.y);
    await page.mouse.down();
    for (const nokta of noktalar.slice(1)) {
      const ekran = ekranNoktasi(nokta);
      await page.mouse.move(ekran.x, ekran.y, { steps: 6 });
    }
    await page.mouse.up();
  }
}

test("bolum girisinden Yaz oyunu acilir", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Harfler ve Sayılar" }).click();
  await expect(page.getByRole("heading", { name: "Ne öğrenmek istersin?" })).toBeVisible();

  await page.getByRole("link", { name: /Yaz/ }).click();
  await expect(page.getByRole("heading", { name: "Sıfır" })).toBeVisible();
});

test("rakam yazilinca kutlama cikar ve yildiz kaydedilir", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await rakamiYaz(page, 0);

  await expect(page.getByText("Aferin!")).toBeVisible();

  const yildizlar = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ogren:yildizlar") ?? "{}"),
  );
  expect(yildizlar["sayi:0"]).toContain("yaz");
});

test("kutlama kapatilabilir ve arkasindaki dugmeler yeniden kullanilabilir", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await rakamiYaz(page, 0);
  await expect(page.getByText("Aferin!")).toBeVisible();

  // Kutlamanin disina dokunmak onu kapatir.
  await page.locator(".kutlama").click({ position: { x: 10, y: 10 } });
  await expect(page.getByText("Aferin!")).toBeHidden();

  // Artik geri donebiliriz.
  await page.getByRole("link", { name: "Oyunlar" }).click();
  await expect(page.getByRole("heading", { name: "Ne öğrenmek istersin?" })).toBeVisible();
});

test("kazanilan yildiz bolum girisinde gorunur", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await rakamiYaz(page, 0);
  await expect(page.getByText("Aferin!")).toBeVisible();

  await page.goto("/ogren/");
  await expect(page.getByText("1/10")).toBeVisible();
});

// Her rakamin kontrol noktalari gercekten sirayla gecilebiliyor mu?
// Bir rakamin yolu bozuksa hangisi oldugu dogrudan gorunsun diye her rakam
// ayri bir testtir.
for (let rakam = 0; rakam <= 9; rakam++) {
  test(`${rakam} rakaminin yolu yazilabilir`, async ({ page }) => {
    await page.goto("/ogren/yaz/");

    // Sirasi gelene kadar "Sonraki" ile ilerle.
    for (let i = 0; i < rakam; i++) {
      await page.locator(".oyunAltBar").getByRole("button", { name: "Sonraki" }).click();
    }

    await rakamiYaz(page, rakam);
    await expect(page.getByText("Aferin!"), `${rakam} tamamlanamadi`).toBeVisible();
  });
}

test("yanlis yere cizmek ilerlemeyi bozmaz", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  const kutu = (await page.locator(".yaziTuvali").boundingBox())!;

  // Tuvalin ortasina rastgele karalama: sifirin ic bosluguna denk gelir.
  await page.mouse.move(kutu.x + kutu.width / 2, kutu.y + kutu.height / 2);
  await page.mouse.down();
  await page.mouse.move(kutu.x + kutu.width / 2 + 20, kutu.y + kutu.height / 2, { steps: 4 });
  await page.mouse.up();

  // Ceza yok, uyari yok, kutlama da yok.
  await expect(page.getByText("Aferin!")).toBeHidden();
  await expect(page.locator(".kontrolNoktasi.gecildi")).toHaveCount(0);
});

test("Yaz oyununda kaydirma yok ve dokunma hedefleri yeterince buyuk", async ({ page }) => {
  for (const ekran of [
    { g: 820, y: 1180 },
    { g: 1180, y: 820 },
    { g: 390, y: 844 },
  ]) {
    await page.setViewportSize({ width: ekran.g, height: ekran.y });
    await page.goto("/ogren/yaz/");

    const tasma = await page.evaluate(() => ({
      dikey: document.documentElement.scrollHeight - window.innerHeight,
      yatay: document.documentElement.scrollWidth - window.innerWidth,
    }));
    expect(tasma.dikey, "dikey tasma var").toBeLessThanOrEqual(1);
    expect(tasma.yatay, "yatay tasma var").toBeLessThanOrEqual(1);

    const dugmeler = page.locator(".oyunDugmesi, .geriDugmesi");
    const adet = await dugmeler.count();
    for (let i = 0; i < adet; i++) {
      const kutu = (await dugmeler.nth(i).boundingBox())!;
      expect(Math.min(kutu.width, kutu.height)).toBeGreaterThanOrEqual(48);
    }
  }
});

test("aspect-ratio ve container query olmadan da tuval gorunur", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await page.addStyleTag({
    content: `
      .yaziAlani { container-type: normal !important; }
      .yaziTuvali { aspect-ratio: auto !important; }
    `,
  });
  const kutu = (await page.locator(".yaziTuvali").boundingBox())!;
  expect(kutu.width).toBeGreaterThan(200);
  expect(kutu.height).toBeGreaterThan(200);
  expect(Math.abs(kutu.width - kutu.height)).toBeLessThanOrEqual(2);
});
