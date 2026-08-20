// Cocugun dizdigi programi, haritaya cizilecek yol parcalarina cevirir.
//
// Onizleme ile gercek calistirma AYNI fonksiyondan uretilir: ikisi de
// calistir()'in adim listesine bakar. Boylece "onizlemede baska, calisinca
// baska" durumu yapisal olarak imkansiz olur.
import { calistir } from "./calistir";
import type { Komut, Yon } from "./komutlar";
import type { Harita, Kare } from "./harita";

export type YolParcasi =
  | { tur: "adim"; baslangic: Kare; bitis: Kare; blokSirasi: number }
  | { tur: "carpma"; kare: Kare; yon: Yon; blokSirasi: number };

export function onizlemeYolu(program: Komut[], harita: Harita): YolParcasi[] {
  const { adimlar } = calistir(program, harita);
  const parcalar: YolParcasi[] = [];

  // Karakterin bir onceki karesi; ilk adim baslangic karesinden cikar.
  let onceki: Kare = harita.baslangic;

  for (const adim of adimlar) {
    const kare = { x: adim.karakter.x, y: adim.karakter.y };

    if (adim.olay === "yurudu") {
      parcalar.push({
        tur: "adim",
        baslangic: onceki,
        bitis: kare,
        blokSirasi: adim.blokSirasi,
      });
      onceki = kare;
    } else if (adim.olay === "carpti") {
      parcalar.push({
        tur: "carpma",
        kare,
        yon: adim.karakter.bakis,
        blokSirasi: adim.blokSirasi,
      });
    }
    // "dondu", "topladi" ve "vardi" yolda ayri bir parca gostermez:
    // donme yer degistirmez, toplama ve varis zaten yurume adimiyla gelir.
  }

  return parcalar;
}
