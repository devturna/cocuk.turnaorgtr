// Dongu arayuzu: kucak, noktalar ve katlama onerisi.
//
// Uc asama uc durakta yasiyor (docs/tasarim/kodlama-arayuz.md §5):
// Ercek Golu hazir kucakla acilir, Beysehir Golu once katlama onerisini
// sonra serbest kutuyu getirir. Bu dosya o uc asamanin cocugun parmagi
// altinda gercekten calistigini olcer.
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

/** Seritteki kucagin icindeki bloklar. */
function kucaktakiBloklar(page: Page) {
  return page.locator(".tekrarKutusu .programBloku");
}

/** Kucagin DISINDA, ust duzeyde duran bloklar. */
function seritteki(page: Page) {
  return page.locator(".programSeridi > .programBloku");
}

test("hazir kucak ekranda gelir ve paletten gelen blok icine duser", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  await expect(page.getByRole("group", { name: "3 kez tekrarla" })).toBeVisible();
  await expect(kucaktakiBloklar(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();

  await expect(kucaktakiBloklar(page)).toHaveCount(1);
  await expect(seritteki(page)).toHaveCount(0);
});

test("kucak uc kez acilan gorunur bir yol cizer", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);
  await page.getByRole("button", { name: "Sağa git", exact: true }).click();

  // Harita yolu HER ZAMAN acilmis halde cizilir: tek blokluk bir kucak
  // uc ayri ok gosterir, cunku cocuk "ne olacak"i dongu okumadan gormeli.
  await expect(page.locator(".kodlaYolParcasi")).toHaveCount(3);
});

test("noktalara dokunmak tekrar sayisini degistirir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  await page.getByRole("button", { name: "Kaç kez tekrarlansın: 3" }).click();
  await expect(page.getByRole("group", { name: "4 kez tekrarla" })).toBeVisible();

  // Bes en fazladir; sonrasinda basa (ikiye) doner.
  await page.getByRole("button", { name: "Kaç kez tekrarlansın: 4" }).click();
  await page.getByRole("button", { name: "Kaç kez tekrarlansın: 5" }).click();
  await expect(page.getByRole("group", { name: "2 kez tekrarla" })).toBeVisible();
});

test("kucak kapaninca blok kucagin disina duser", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  await page.getByRole("button", { name: "Kucağı kapat" }).click();
  await page.getByRole("button", { name: "Sağa git", exact: true }).click();

  await expect(kucaktakiBloklar(page)).toHaveCount(0);
  await expect(seritteki(page)).toHaveCount(1);
});

test("geri al hazir kucagi silmez", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  // Kucak bulmacanin mobilyasidir: silinirse bulmaca cozulemez hale gelir.
  await expect(page.getByRole("button", { name: "Son bloğu sil" })).toBeDisabled();

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await page.getByRole("button", { name: "Son bloğu sil" }).click();

  await expect(kucaktakiBloklar(page)).toHaveCount(0);
  await expect(page.getByRole("group", { name: "3 kez tekrarla" })).toBeVisible();
});

test("hazir kucakla cozulen bulmaca sonraki bulmacaya gecer", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
  // Ikinci bulmacanin kucagi dort kez ile gelir; serit de temizlenmis olmali.
  await expect(page.getByRole("group", { name: "4 kez tekrarla" })).toBeVisible({
    timeout: 15000,
  });
  await expect(kucaktakiBloklar(page)).toHaveCount(0);
});

test("ayni komut ust uste yazilinca katlama onerisi belirir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/beysehir-golu/`);

  const cip = page.getByRole("button", { name: /tek kucağa topla/ });
  await expect(cip).toHaveCount(0);
  await expect(page.locator(".tekrarKutusu")).toHaveCount(0);

  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  }

  await expect(cip).toBeVisible();
  await cip.click();

  // Uc blok tek kucaga indi; yurunen yol degismedi (uc ok).
  await expect(seritteki(page)).toHaveCount(0);
  await expect(page.getByRole("group", { name: "3 kez tekrarla" })).toBeVisible();
  await expect(page.locator(".kodlaYolParcasi")).toHaveCount(3);
  await expect(cip).toHaveCount(0);
});

test("katlanan kucagin sayisi buyutulup bulmaca bitirilir, sonrasinda kutu paletten gelir", async ({
  page,
}) => {
  await page.goto(`/kodla/${KURS}/beysehir-golu/`);

  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  }
  await page.getByRole("button", { name: /tek kucağa topla/ }).click();

  // Hedef bes kare uzakta: cocuk noktalara iki kez dokunup sayiyi bese
  // cikarir. Kucagi bes yapmak, katlamanin ISE YARADIGI ani gosterir.
  await page.getByRole("button", { name: "Kaç kez tekrarlansın: 3" }).click();
  await page.getByRole("button", { name: "Kaç kez tekrarlansın: 4" }).click();
  await page.getByRole("button", { name: "Çalıştır" }).click();

  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });

  // Ikinci bulmaca serbest asamada: kucak artik palette.
  const kutuDugmesi = page.getByRole("button", { name: "Tekrar kucağı koy" });
  await expect(kutuDugmesi).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".tekrarKutusu")).toHaveCount(0);

  await kutuDugmesi.click();
  // Paletten gelen kucak iki kez ile baslar ve ACIK gelir: dokunulan komut
  // dogrudan icine duser.
  await expect(page.getByRole("group", { name: "2 kez tekrarla" })).toBeVisible();
  await page.getByRole("button", { name: "Aşağı git", exact: true }).click();
  await expect(kucaktakiBloklar(page)).toHaveCount(1);
});
