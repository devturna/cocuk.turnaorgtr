import { test, expect } from "@playwright/test";
import { kursBolumleri } from "../lib/kodla/bolumler";

const KURS = "turna-yolu";
const BOLUMLER = kursBolumleri(KURS);

// Sozsuz ilk temas (Gorev 9): demo gercek arayuzu surer (sahte animasyon
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
