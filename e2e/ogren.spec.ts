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

    // Tam ekran duzeni bir useEffect icinde body'ye sinif ekleyerek kuruluyor;
    // hydration bitmeden olcum yapmak, ust bar ve alt bilgi hala ekrandayken
    // olcmek demektir. Yavas bir makinede bu yarisi kaybediyoruz (CI'da tam
    // olarak bu oldu), o yuzden once kosulu bekliyoruz.
    await expect(page.locator("body")).toHaveClass(/tamEkran/);

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

// Asagidaki iki test, gercek kullanımda bildirilen iki hatayi kilitler.
test("kutlama, parmak kalkmadan cikmaz", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await expect(page.locator("body")).toHaveClass(/tamEkran/);

  const kutu = (await page.locator(".yaziTuvali").boundingBox())!;
  const ekranNoktasi = (n: { x: number; y: number }) => ({
    x: kutu.x + (n.x / 400) * kutu.width,
    y: kutu.y + (n.y / 400) * kutu.height,
  });

  const noktalar = kontrolNoktalari(RAKAM_YOLLARI[0][0], EN_AZ_ARALIK);
  const ilk = ekranNoktasi(noktalar[0]);
  await page.mouse.move(ilk.x, ilk.y);
  await page.mouse.down();
  for (const nokta of noktalar.slice(1)) {
    const e = ekranNoktasi(nokta);
    await page.mouse.move(e.x, e.y, { steps: 6 });
  }

  // Rakam tamamlandi ama parmak hala tuvalde: kutlama cocugun hareketini
  // ortasindan kesmemeli.
  await expect(page.locator(".kutlama")).toBeHidden();

  await page.mouse.up();
  await expect(page.getByText("Aferin!")).toBeVisible();
});

test("sonraki rakama gecince onceki rakamin izi ekranda kalmaz", async ({ page }) => {
  await page.goto("/ogren/yaz/");
  await expect(page.locator("body")).toHaveClass(/tamEkran/);

  const kutu = (await page.locator(".yaziTuvali").boundingBox())!;
  const ekranNoktasi = (n: { x: number; y: number }) => ({
    x: kutu.x + (n.x / 400) * kutu.width,
    y: kutu.y + (n.y / 400) * kutu.height,
  });

  const noktalar = kontrolNoktalari(RAKAM_YOLLARI[0][0], EN_AZ_ARALIK);
  const ilk = ekranNoktasi(noktalar[0]);
  await page.mouse.move(ilk.x, ilk.y);
  await page.mouse.down();
  for (const nokta of noktalar.slice(1)) {
    const e = ekranNoktasi(nokta);
    await page.mouse.move(e.x, e.y, { steps: 6 });
  }

  const izUzunlugu = () =>
    page.locator(".parmakIzi").evaluate((o) => (o.getAttribute("d") ?? "").length);
  expect(await izUzunlugu()).toBeGreaterThan(0);

  // Parmak kalkmadan sonraki rakama gecilirse (dokunmatikte ikinci parmak,
  // farede pencere disinda birakma) iz DOM'da kaliyordu; React onu temizlemez
  // cunku gordugu d prop'u hep "".
  await page
    .locator(".oyunAltBar")
    .getByRole("button", { name: "Sonraki" })
    .evaluate((d) => (d as HTMLButtonElement).click());

  await expect(page.locator(".oyunBaslik h1")).toHaveText("Bir");
  expect(await izUzunlugu()).toBe(0);
});

// --- Say oyunu ---
//
// Cocuk nesnelere teker teker dokunarak sayar; soru ancak hepsi sayilinca
// cikar. Yanlis cevap cezalandirilmaz.

/** Sahnedeki butun nesnelere sirayla dokunur. */
async function hepsiniSay(page: import("@playwright/test").Page) {
  const nesneler = page.locator(".sayNesnesi");
  const adet = await nesneler.count();
  for (let sira = 0; sira < adet; sira++) await nesneler.nth(sira).click();
  return adet;
}

test("bolum girisinden Say oyunu acilir", async ({ page }) => {
  await page.goto("/ogren/");
  await page.getByRole("link", { name: /Say/ }).click();
  await expect(page.getByRole("heading", { name: "Say" })).toBeVisible();
  // Ilk tur bir nesnedir: sayma birden baslar.
  await expect(page.locator(".sayNesnesi")).toHaveCount(1);
});

test("soru ancak hepsi sayilinca cikar", async ({ page }) => {
  await page.goto("/ogren/say/");
  await page.getByRole("button", { name: "Sonraki" }).click();
  await page.getByRole("button", { name: "Sonraki" }).click();
  await expect(page.locator(".sayNesnesi")).toHaveCount(3);

  await page.locator(".sayNesnesi").first().click();
  await expect(page.getByText("Kaç tane?")).toHaveCount(0);

  await hepsiniSay(page);
  await expect(page.getByText("Kaç tane?")).toBeVisible();
});

test("sayilan nesne kacinci oldugunu gosterir", async ({ page }) => {
  await page.goto("/ogren/say/");
  await page.getByRole("button", { name: "Sonraki" }).click();
  await page.getByRole("button", { name: "Sonraki" }).click();

  const nesneler = page.locator(".sayNesnesi");
  await nesneler.nth(1).click();
  await expect(nesneler.nth(1)).toHaveClass(/sayildi/);
  await expect(page.getByRole("button", { name: "1. sayıldı" })).toHaveCount(1);
  // Ayni nesneye ikinci kez dokunmak sayaci ilerletmez.
  await nesneler.nth(1).click();
  await expect(page.getByRole("button", { name: /sayıldı/ })).toHaveCount(1);
});

test("dogru cevap yildiz kazandirir, yanlis cevap cezalandirmaz", async ({ page }) => {
  await page.goto("/ogren/say/");
  await page.getByRole("button", { name: "Sonraki" }).click();
  const adet = await hepsiniSay(page);
  expect(adet).toBe(2);

  // Once yanlis: secenek yerinde kalir, soru kapanmaz, yildiz yazilmaz.
  await page.getByRole("button", { name: "Üç" }).click();
  await expect(page.getByText("Kaç tane?")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("ogren:yildizlar")),
  ).toBeNull();

  await page.getByRole("button", { name: "İki", exact: true }).click();
  await expect(page.getByText("İki!")).toBeVisible();
  const yildizlar = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ogren:yildizlar") ?? "{}"),
  );
  expect(yildizlar["sayi:2"]).toContain("say");
});

test("Say oyununda kazanilan yildiz bolum girisinde gorunur", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ogren:yildizlar", JSON.stringify({ "sayi:2": ["say"], "sayi:5": ["say"] }));
  });
  await page.goto("/ogren/");
  await expect(page.getByText("2/10")).toBeVisible();
});

// --- Bul oyunu ---
//
// Say oyununun tersi yonu: rakami gor, o kadar nesnenin oldugu grubu bul.

test("bolum girisinden Bul oyunu acilir", async ({ page }) => {
  await page.goto("/ogren/");
  await page.getByRole("link", { name: /Bul/ }).click();
  await expect(page.getByRole("heading", { name: "Bul" })).toBeVisible();
  await expect(page.getByRole("note", { name: "Bir tane bul" })).toBeVisible();
  await expect(page.locator(".bulSecenegi")).toHaveCount(3);
});

test("dogru grup yildiz kazandirir, yanlis grup cezalandirmaz", async ({ page }) => {
  await page.goto("/ogren/bul/");
  await page.getByRole("button", { name: "Sonraki" }).click();

  // Ikinci tur: hedef iki, secenekler bir-iki-dort. Yanlis secim ekrani
  // degistirmez.
  await page.getByRole("button", { name: "Dört tane" }).click();
  await expect(page.getByText("İki!")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("ogren:yildizlar"))).toBeNull();

  await page.getByRole("button", { name: "İki tane" }).click();
  await expect(page.getByText("İki!")).toBeVisible();
  const yildizlar = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ogren:yildizlar") ?? "{}"),
  );
  expect(yildizlar["sayi:2"]).toContain("bul");
});

test("secenekteki nesne sayisi gercekten o kadardir", async ({ page }) => {
  await page.goto("/ogren/bul/");
  for (let tur = 0; tur < 4; tur++) {
    const secenekler = page.locator(".bulSecenegi");
    const adet = await secenekler.count();
    for (let sira = 0; sira < adet; sira++) {
      const etiket = (await secenekler.nth(sira).getAttribute("aria-label")) ?? "";
      const nesneSayisi = await secenekler.nth(sira).locator("span").count();
      const adlar = ["Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On"];
      expect(adlar[nesneSayisi - 1], etiket).toBe(etiket.replace(" tane", ""));
    }
    await page.getByRole("button", { name: "Sonraki" }).click();
  }
});
