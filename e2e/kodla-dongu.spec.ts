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
  return page.locator(".programSeridi > .programOgesi > .programBloku");
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

test("seritteki bloga dokunmak onu siler", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/beysehir-golu/`);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await page.getByRole("button", { name: "Yukarı git", exact: true }).click();
  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await expect(seritteki(page)).toHaveCount(3);

  // Ortadaki blok: sondan silme dugmesi onu hicbir zaman kurtaramaz.
  await page.getByRole("button", { name: "Yukarı git bloğunu sil" }).click();

  await expect(seritteki(page)).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Yukarı git bloğunu sil" })).toHaveCount(0);
});

test("kucagin icindeki bloga dokunmak kucagi degil blogu siler", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/ercek-golu/`);

  await page.getByRole("button", { name: "Sağa git", exact: true }).click();
  await expect(kucaktakiBloklar(page)).toHaveCount(1);

  await page.getByRole("button", { name: "Sağa git bloğunu sil" }).click();

  await expect(kucaktakiBloklar(page)).toHaveCount(0);
  await expect(page.getByRole("group", { name: "3 kez tekrarla" })).toBeVisible();
});

test("donus setinde palet uc dugme gosterir, kucak ortada durur", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/uluabat-golu/`);

  // Mutlak yon dugmeleri bu durakta yok: ileri, sola don, saga don.
  await expect(page.getByRole("button", { name: "İleri git", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sola dön", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sağa dön", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yukarı git", exact: true })).toHaveCount(0);

  // Serbest asama: kucak paletten gelir ve artinin ortasindaki hucrede durur.
  const kutu = page.getByRole("button", { name: "Tekrar kucağı koy" });
  await expect(kutu).toBeVisible();
  const ileri = (await page.getByRole("button", { name: "İleri git", exact: true }).boundingBox())!;
  const sol = (await page.getByRole("button", { name: "Sola dön", exact: true }).boundingBox())!;
  const sag = (await page.getByRole("button", { name: "Sağa dön", exact: true }).boundingBox())!;
  const orta = (await kutu.boundingBox())!;
  expect(orta.y).toBeGreaterThan(ileri.y);
  expect(orta.x).toBeGreaterThan(sol.x);
  expect(orta.x).toBeLessThan(sag.x);
});

test("donus komutlariyla dongu yazilip bulmaca bitirilir", async ({ page }) => {
  await page.goto(`/kodla/${KURS}/uluabat-golu/`);

  await page.getByRole("button", { name: "Tekrar kucağı koy" }).click();
  for (const beklenen of [2, 3, 4]) {
    await page.getByRole("button", { name: `Kaç kez tekrarlansın: ${beklenen}` }).click();
  }
  await expect(page.getByRole("group", { name: "5 kez tekrarla" })).toBeVisible();
  await page.getByRole("button", { name: "İleri git", exact: true }).click();

  await page.getByRole("button", { name: "Çalıştır" }).click();
  await expect(page.getByText("Sıradaki bulmaca")).toBeVisible({ timeout: 15000 });
});

test("yakin duraklar birbirinin dokunmasini yutmaz", async ({ page }) => {
  // Orta Anadolu'da uc durak birbirine cok yakin (Sultansazligi, Kapadokya,
  // Seyfe). Hepsi acikken isaretler kilavuz cizgiyle ayrilir; ayrilmasalar
  // ustteki isaret alttakinin dokunmasini yutardi ve asagidaki tiklama
  // Playwright'in "ustu ortulu" denetiminde kalirdi.
  await page.addInitScript(() => {
    localStorage.setItem(
      "kodla:ilerleme",
      JSON.stringify({
        "turna-yolu": {
          "goksu-deltasi": "altin",
          sultansazligi: "altin",
          kapadokya: "yildiz",
          "seyfe-golu": "altin",
        },
      }),
    );
  });
  await page.goto(`/kodla/${KURS}/`);

  // Kaydirilan her isaret gercek konumuna bir noktayla baglanir.
  await expect(page.locator(".gocGercekNokta").first()).toBeVisible();

  await page.getByRole("link", { name: /3\. durak/ }).click();
  await expect(page.getByRole("heading", { name: "Kapadokya" })).toBeVisible();
});
