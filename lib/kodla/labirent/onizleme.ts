// Cocugun dizdigi programi, haritaya cizilecek yol parcalarina cevirir.
//
// Onizleme ile gercek calistirma AYNI fonksiyondan uretilir: ikisi de
// calistir()'in adim listesine bakar. Boylece "onizlemede baska, calisinca
// baska" durumu yapisal olarak imkansiz olur.
import { calistir } from "./calistir";
import type { Yon } from "./komutlar";
import type { Blok, BlokYolu } from "../program";
import type { Harita, Kare } from "./harita";

// adimSirasi, parcayi ureten adimin calistir() listesindeki sirasidir.
// Yol dolulugu bununla olculur, blokYolu ile DEGIL: bir tekrarin butun
// turlari ayni blokYolu'nu tasir, o yuzden blok yolu ilerlemeyi olcemez.
export type YolParcasi =
  | { tur: "adim"; baslangic: Kare; bitis: Kare; blokYolu: BlokYolu; adimSirasi: number }
  | { tur: "carpma"; kare: Kare; yon: Yon; blokYolu: BlokYolu; adimSirasi: number };

export function onizlemeYolu(program: Blok[], harita: Harita): YolParcasi[] {
  const { adimlar } = calistir(program, harita);
  const parcalar: YolParcasi[] = [];

  // Karakterin bir onceki karesi; ilk adim baslangic karesinden cikar.
  let onceki: Kare = harita.baslangic;

  for (let adimSirasi = 0; adimSirasi < adimlar.length; adimSirasi++) {
    const adim = adimlar[adimSirasi];
    const kare = { x: adim.karakter.x, y: adim.karakter.y };

    if (adim.olay === "yurudu") {
      parcalar.push({
        tur: "adim",
        baslangic: onceki,
        bitis: kare,
        blokYolu: adim.blokYolu,
        adimSirasi,
      });
      onceki = kare;
    } else if (adim.olay === "carpti") {
      parcalar.push({
        tur: "carpma",
        kare,
        yon: adim.karakter.bakis,
        blokYolu: adim.blokYolu,
        adimSirasi,
      });
    }
    // "dondu", "topladi" ve "vardi" yolda ayri bir parca gostermez:
    // donme yer degistirmez, toplama ve varis zaten yurume adimiyla gelir.
  }

  return parcalar;
}
