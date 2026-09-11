import { test, expect } from "@playwright/test";
import { kursBolumleri } from "../lib/kodla/bolumler";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);

// Sozsuz ilk temas: demo gercek arayuzu surer (sahte animasyon
// degil) ama cocugun ilk deneyimi "kendisi hic dokunmadan kazandim"
// olmamali. Bu dosya, kodla.spec.ts'in aksine, demo'yu KAPATMAZ — demo'nun
// kendisi test edilen sey. Fresh bir context her testte fresh localStorage
// getirdigi icin demo, ilk goto'da kendiliginden devreye girer.
test("demo bolumu cocuk adina kazanmaz, kosu bitince tahta tertemiz sifirlanir", async ({
  page,
}) => {
  const bolum = BOLUMLER[0];
  await page.goto(`/kodla/${KURS}/${bolum.id}/`);

  // Hayalet parmak once secilen komutu programa ekler: demo devreye girdi.
  await expect(page.locator(".programBloku")).toHaveCount(1, { timeout: 3000 });
  await expect(
    page.locator(".komutDugmesi.hayaletli, .calistirDugmesi.hayaletli"),
  ).toHaveCount(1);

  // Demo boyunca cocuk mudahale edemez: palet ve calistir kilitli olmali.
  const ilkPaletDugmesi = page.getByRole("group", { name: "Komutlar" }).getByRole("button").first();
  await expect(ilkPaletDugmesi).toBeDisabled();

  // disabled olmasi tek basina yetmez: zorla tiklansa bile DOM'da devre disi
  // oldugu icin tarayici olayi hic dugmeye iletmemeli. Program hala tek
  // blokluk (hayaletin ekledigi) haliyle kalmali.
  await ilkPaletDugmesi.click({ force: true });
  await expect(page.locator(".programBloku")).toHaveCount(1);

  // Demo kendi kosusunu calistirir; kosu bitince kontrol cocuga gecer ve
  // tahta (program dahil) sifirlanir.
  await expect(page.locator(".programBloku")).toHaveCount(0, { timeout: 6000 });

  // Kutlama ekrani cikmamali, yildiz kaydedilmemeli: demo, secilen komutu
  // BITIRMEYEN bir adim oldugu icin bolumu cocuk adina "kazanmaz".
  await expect(page.getByRole("status")).toHaveCount(0);
  const ilerleme = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("kodla:ilerleme") ?? "{}"),
  );
  expect(ilerleme[KURS]?.[bolum.id]).toBeUndefined();

  // Kontrol gercekten cocuga gecer: palet ve (program bos oldugu icin
  // devre disi ama artik KILITLI degil) calistir dugmesi tekrar
  // kullanilabilir durumda.
  await expect(
    page.getByRole("group", { name: "Komutlar" }).getByRole("button").first(),
  ).toBeEnabled();
  await expect(page.getByRole("button", { name: "Çalıştır" })).toBeDisabled();
});

// Cizim kursunun kendi demosu. Labirenti ogrenmis bir cocuk bile bu
// mekanigi tanimaz: kus burada kare degil KOSE degistirir ve arkasinda
// cizgi birakir. Demo bayragi bu yuzden kurs basina tutuluyor.
test("cizim kursunun demosu oynar, deseni cocuk adina tamamlamaz", async ({ page }) => {
  await page.goto("/kodla/kilimin-izi/iznik/");

  // Hayalet parmak paletteki komutu programa ekler.
  await expect(page.locator(".programSeridi .programBloku")).toHaveCount(1, { timeout: 3000 });

  // Demo boyunca cocuk mudahale edemez.
  const ileri = page.getByRole("button", { name: "İleri git", exact: true });
  await expect(ileri).toBeDisabled();
  await ileri.click({ force: true });
  await expect(page.locator(".programSeridi .programBloku")).toHaveCount(1);

  // Kus gercekten cizer: en az bir kenar kirmizilanir.
  await expect(page.locator(".desenCizgi")).toHaveCount(1, { timeout: 6000 });

  // Kosu bitince tahta sifirlanir ve kontrol cocuga gecer.
  await expect(page.locator(".programSeridi .programBloku")).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator(".desenCizgi")).toHaveCount(0);
  await expect(ileri).toBeEnabled();

  // Demo deseni TAMAMLAMAZ: kutlama yok, bulmaca kaydi yok.
  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("kodla:bulmaca"))).toBeNull();
});

test("demo bayragi kursa ozeldir", async ({ page }) => {
  // Turna'nin Yolu'nun demosunu gormus cocuk cizim kursuna girdiginde onun
  // demosunu de gormeli: ogrendigi mekanik baska bir mekanikti.
  await page.addInitScript(() => {
    localStorage.setItem("kodla:demo", JSON.stringify({ "turna-yolu": true }));
  });
  await page.goto("/kodla/kilimin-izi/iznik/");
  await expect(page.locator(".programSeridi .programBloku")).toHaveCount(1, { timeout: 3000 });
});

test("eski tek-metinli bayrak Turna'nin Yolu demosunu kapali tutar", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kodla:demo", "evet"));
  await page.goto("/kodla/turna-yolu/goksu-deltasi/");
  await page.waitForTimeout(2500);
  await expect(page.locator(".programBloku")).toHaveCount(0);
});

// Olay kursunun demosu. Burada ogretilen sey komut dizmek degil kural
// yazmak: nesneye dokun, bir eylem sec, dokundugunda o eylem oynasin.
test("olay kursunun demosu kural yazar, bulmacayi cocuk adina cozmez", async ({ page }) => {
  await page.goto("/kodla/gol-kiyisi/egirdir-golu/");

  // Once bir nesne secilir (hayalet parmak orada).
  await expect(page.locator(".olayNesnesi.hayaletli")).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator(".olayNesnesi.secili")).toHaveCount(1, { timeout: 3000 });

  // Sonra bir eylem; kural seritte belirir ve nesne onu oynar.
  await expect(page.getByRole("listitem")).toHaveCount(1, { timeout: 4000 });

  // Demo boyunca cocuk mudahale edemez.
  const kurbaga = page.getByRole("button", { name: "Kurbağa", exact: true });
  await expect(kurbaga).toBeDisabled();

  // Tahta cocuga tertemiz gecer.
  await expect(page.getByRole("listitem")).toHaveCount(0, { timeout: 6000 });
  await expect(page.locator(".olayNesnesi.secili")).toHaveCount(0);
  await expect(kurbaga).toBeEnabled();

  // Demo ISTENEN kurali yazmaz: kutlama yok, ilerleme kaydi yok.
  await expect(page.getByText("Sıradaki bulmaca")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("kodla:bulmaca"))).toBeNull();
});
