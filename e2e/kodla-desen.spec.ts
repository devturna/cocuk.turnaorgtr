// Cizim mekanigi: Kilimin Izi kursu.
//
// Labirent testleri (kodla.spec.ts) kusun hedefe varmasini olcer; burada
// olculen sey CIZILEN DESEN: hedefin butun kenarlari cizildi mi.
import { test, expect, type Page } from "@playwright/test";
import { bulmacaBul, bulmacaDeseni, kursBolumleri, type DesenBolumu } from "../lib/kodla/bolumler";
import { enKisaDesenCozumu } from "../lib/kodla/desen/cozucu";
import { komutAnahtari } from "../lib/kodla/labirent/komutlar";
import type { Blok } from "../lib/kodla/program";
import { KOMUT_ADLARI } from "../components/kodla/labirent/komutGorunumu";

const KURS = "kilimin-izi";
const BOLUMLER = kursBolumleri(KURS).filter(
  (bolum): bolum is DesenBolumu => bolum.mekanik === "desen",
);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([kurs]) => {
      localStorage.setItem("kodla:demo", "evet");
      localStorage.setItem("kodla:karakter", JSON.stringify({ [kurs]: "turna" }));
    },
    [KURS],
  );
});

/** Paletten komut ekler. */
async function programiDiz(page: Page, anahtarlar: string[]) {
  for (const anahtar of anahtarlar) {
    await page.getByRole("button", { name: KOMUT_ADLARI[anahtar], exact: true }).click();
  }
}

function sonKucak(page: Page) {
  return page.locator(".tekrarKutusu").last();
}

async function keziAyarla(page: Page, kez: number) {
  const noktalar = sonKucak(page).locator(".tekrarNoktalari");
  for (let deneme = 0; deneme < 4; deneme++) {
    const etiket = (await noktalar.getAttribute("aria-label")) ?? "";
    if (Number(etiket.replace(/\D/g, "")) === kez) return;
    await noktalar.click();
  }
  throw new Error(`Kucak ${kez} kez'e getirilemedi`);
}

/** Seritteki butun komut bloklarini siler (kucak kalir). */
async function seridiBosalt(page: Page) {
  const silinecek = page.getByRole("button", { name: /bloğunu sil$/ });
  for (let kalan = await silinecek.count(); kalan > 0; kalan--) {
    await silinecek.first().click();
  }
}

/** Cozucunun buldugu programi gercek arayuzden surer. */
async function programiUygula(
  page: Page,
  program: Blok[],
  asama: "hazir" | "oneri" | "serbest" | undefined,
) {
  for (const [ust, blok] of program.entries()) {
    if (blok.tur === "komut") {
      const kapat = page.getByRole("button", { name: "Kucağı kapat" });
      if (await kapat.count()) await kapat.click();
      await programiDiz(page, [komutAnahtari(blok.komut)]);
      continue;
    }
    if (asama === "oneri") {
      // Bu asamada palette kutu dugmesi yok: kucak yalnizca katlamayla
      // dogar ve govdesi tek komut olur (denetim bunu sart kosuyor).
      expect(blok.govde, "oneri asamasinda govde tek komut olmali").toHaveLength(1);
      await programiDiz(page, Array(3).fill(komutAnahtari(blok.govde[0].komut)));
      await page.getByRole("button", { name: /tek kucağa topla/ }).click();
      await keziAyarla(page, blok.kez);
      continue;
    }

    if (!(asama === "hazir" && ust === 0)) {
      await page.getByRole("button", { name: "Tekrar kucağı koy" }).click();
    }
    await keziAyarla(page, blok.kez);
    const ac = sonKucak(page).getByRole("button", { name: "Kucağı aç" });
    if (await ac.count()) await ac.click();
    await programiDiz(page, blok.govde.map((govde) => komutAnahtari(govde.komut)));
  }
}

test("desen duraginda palet donus setini gosterir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/iznik/`);

  await expect(page.getByRole("button", { name: "İleri git", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sola dön", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sağa dön", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yukarı git", exact: true })).toHaveCount(0);
});

test("hedef desen sahnede durur, onizleme ne cizilecegini gosterir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/iznik/`);

  // Ilk bulmacanin hedefi uc kenarlik bir cizgi.
  await expect(page.locator(".desenHedef")).toHaveCount(3);
  await expect(page.locator(".desenOnizleme")).toHaveCount(0);

  // Hazir kucak uc kez donuyor: icine tek "ileri" koymak uc kenar cizer.
  await page.getByRole("button", { name: "İleri git", exact: true }).click();
  await expect(page.locator(".desenOnizleme")).toHaveCount(3);
  await expect(page.locator(".desenCizgi")).toHaveCount(0);
});

test("kucak calistirilinca desen cizilir ve bulmaca biter", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/iznik/`);

  await page.getByRole("button", { name: "İleri git", exact: true }).click();
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("eksik program deseni tamamlamaz", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/iznik/`);

  // Kucagi kapatip tek bir "ileri" koymak yalnizca bir kenar cizer.
  await page.getByRole("button", { name: "Kucağı kapat" }).click();
  await page.getByRole("button", { name: "İleri git", exact: true }).click();
  await page.getByRole("button", { name: "Çalıştır" }).click();
  await expect(page.getByRole("button", { name: "Çalıştır" })).toBeEnabled({ timeout: 15000 });

  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);
  await expect(page.locator(".desenCizgi")).toHaveCount(1);
});

test("kurs haritasinda dort durak vardir ve ilki aciktir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/`);

  await expect(page.getByRole("heading", { name: "Kilimin İzi" })).toBeVisible();
  await expect(page.locator(".gocDuragi")).toHaveCount(4);
  await expect(page.getByRole("link", { name: /1\. durak/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /2\. durak/ })).toHaveCount(0);
});

// Her durak gercekten cizilebiliyor mu? Cozucunun buldugu program, cocugun
// kullandigi arayuzden surulur.
for (const bolum of BOLUMLER) {
  test(`${bolum.ad} deseni cozumle cizilebilir`, async ({ page }) => {
    test.setTimeout(20000 + bolum.bulmacalar.length * 25000);
    await page.goto(`/kodla/${KURS}/${bolum.id}/`);

    for (let sira = 0; sira < bolum.bulmacalar.length; sira++) {
      const bulmaca = bulmacaBul(bolum, sira)!;
      const program = enKisaDesenCozumu(
        bulmacaDeseni(bulmaca),
        bulmaca.komutSeti,
        bulmaca.enFazlaBlok!,
        // Katlama tek komutluk govde uretir; "oneri" asamasinda cocugun
        // baska bir kucak yapma yolu yok.
        bulmaca.kucak?.asama === "oneri" ? { enFazlaGovde: 1 } : {},
      );
      expect(program, `${bolum.id} - ${sira}. bulmacanin cozumu yok`).not.toBeNull();

      await seridiBosalt(page);
      await programiUygula(page, program!, bulmaca.kucak?.asama);
      await page.getByRole("button", { name: "Çalıştır" }).click();

      if (sira < bolum.bulmacalar.length - 1) {
        await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 20000 });
        await expect(page.getByText("Sıradaki bulmaca")).toBeHidden({ timeout: 20000 });
      }
    }

    await expect(page.getByText("Harika! En kısa çizim!"), `${bolum.id} tamamlanamadi`).toBeVisible({
      timeout: 25000,
    });
  });
}
