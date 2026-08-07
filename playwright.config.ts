// Uctan uca duman testi ayarlari. Testler uretim yapisi uzerinde calisir.
import { defineConfig } from "@playwright/test";

// Site GitHub Pages proje sayfasinda alt yolda yayinlaniyor, bu yuzden uretim
// yapisindaki varlik yollari o on eki tasiyor (ornek:
// /cocuk.turnaorgtr/_next/...). Testlerin gercegi olcmesi icin sunucunun da o
// yollari karsilamasi gerekir.
//
// Cozum: out/ klasoru gecici dizine iki kez serilir.
//   .e2e-sunucu/                   -> testler "/boyama/" diye gezebilsin diye
//   .e2e-sunucu/<on ek>/           -> HTML'in istedigi varlik yollari icin
//
// Ikinci kopya olmazsa CSS ve JS 404 doner. Onek yanlis ayarlanirsa da 404
// doner ve onizleme testi bunu yakalar; guvenlik agi korunuyor.
const temelYol = process.env.NEXT_PUBLIC_TEMEL_YOL ?? "";

const sunucuKomutu = temelYol
  ? [
      "rm -rf .e2e-sunucu",
      `mkdir -p .e2e-sunucu${temelYol}`,
      `cp -R out/. .e2e-sunucu${temelYol}/`,
      "cp -R out/. .e2e-sunucu/",
      "npx serve .e2e-sunucu -l 3100",
    ].join(" && ")
  : "npx serve out -l 3100";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: sunucuKomutu,
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
  },
});
