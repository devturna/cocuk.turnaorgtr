// Kodlama bolumunun zamanlama sabitleri.
//
// Iki mekanik de (labirent ve desen) ayni oynatma ritmini kullanir; sabitler
// burada tek yerde durur ki ikisi ayrisamasin.

// Uc zamanlama sabiti birbirine bagli ve SIRALARI onemlidir, kucukten
// buyuge:
//   1. kodla.css --kodla-adim-suresi (bugun 380ms) — kareler arasi CSS
//      gecis suresi.
//   2. POZ_SIFIRLAMA_GECIKMESI (asagida, 400ms) — carpma/inis pozunun
//      "durus"a donme gecikmesi. Bu, CSS gecisinin/animasyonunun BITMESINI
//      beklemek zorunda; erken donerse pozun kendi animasyonu yarida
//      kesilir.
//   3. ADIM_SURESI (asagida, 450ms) — bu bilesenin bir sonraki adima
//      gectigi JS tik suresi. Bu, CSS gecisinden UZUN olmak zorunda;
//      kisaltilirsa karakter gecis bitmeden bir sonraki kareye ISINLANIR
//      (transform hala eski konuma dogru animasyon oynatirken React yeni
//      --kare-x/--kare-y degerini yazar, gecis yarida kesilip yeniden
//      baslar — akici yurume hissi bozulur).
// Uc deger elle senkron tutuluyor (calisma zamaninda CSS degiskenini okuyup
// eslemek yerine): React'in ilk render'i ile DOM'a yazilmis CSS custom
// property'nin okunabilir olmasi arasinda senkron bir an yok, bu da "once
// oku, sonra zamanlayiciyi kur" akisini kirilgan yapardi. Bu ucunu
// DEGISTIRIRKEN sirayi (1 < 2 < 3) koruyun; kodla.css'teki degisken de
// yanindaki yorumda bu dosyaya isaret eder.
export const ADIM_SURESI = 450;
export const POZ_SIFIRLAMA_GECIKMESI = 400;

// Cocuk bu kadar sure hicbir sey yapmazsa demo sessizce tekrarlanir.
export const BOSTA_SURESI = 12000;

// Bulmacalar arasi gecis katmaninin ekranda kaldigi sure. Yukaridaki uclu
// zamanlamayla iliskisi yok: gecis, bir bulmaca zaten bitmisken oynar. Ama
// kendi kuplaji var, ve bu kuplaj artik IKI parcali: kodla.css'teki
// .bulmacaGecisi'nin bulmacaGecisBelir belirme animasyonu (220ms) VE
// .bulmacaNoktasi.yeniDolan'in dolus animasyonu (280ms, AYNI commit'te,
// belirmeyle es zamanli baslar) katman acilirken birlikte oynar. GECIS_SURESI
// bu ikisinin ikisinden de (fade-in VE nokta animasyonu, hangisi daha uzun
// surerse) KISA OLAMAZ, yoksa katman/nokta yarida kesilir. 1100ms burada
// bilerek 220/280ms'in COK uzerinde tutuluyor: perde artik bir kelime degil
// bir ILERLEME gostergesi tasiyor (asagidaki .bulmacaGecisi), ve dolan nokta
// bittikten sonra ~800ms'lik bir "durgun bakis" penceresi kaliyor - okuma
// bilmeyen bir cocugun yeni dolan noktayi fark edip anlamlandirmasi icin
// animasyon suresinin kendisinden fazlasi gerekiyor.
export const GECIS_SURESI = 1100;

// Bulmaca kazanilinca kutlama pozu, gecis katmani onu ortmeden once bu kadar
// sure ekranda kalir. POZ_SIFIRLAMA_GECIKMESI (400ms, yukarida) ile KUPLU:
// asagidaki "Kosu bitince poz..." etkisi bu pencerede (sonrakiHazirlaniyor)
// bilerek devre disi birakilir, YOKSA o etki bu bekleme dolmadan pozu
// "durus"a dondurur ve gorunen kutlama suresi ikisinin kucugu (min) olur —
// bu sabiti tek basina buyutmenin hicbir etkisi kalmaz. Yorumsuz birakilirsa
// bu, "degeri degistirdim, hicbir sey olmadi" turunden belgelenmemis bir
// kuplajdir.
export const VARIS_BEKLEME_SURESI = 500;
