// Sitenin yayinlandigi temel yol.
//
// Kendi alan adinin kokunde yayinlanirsa bos kalir. GitHub Pages proje
// sayfasinda ise site alt yolda durur (ornek: /cocuk.turnaorgtr).
//
// Next.js bu on eki `Link` baglantilarina ve `_next` varliklarina kendisi
// ekler. Ama `public/` altindaki dosyalara ELLE yazilan yollara eklemez;
// oralarda bu sabiti kullan:
//
//     <img src={`${TEMEL_YOL}/boyama/kedi.svg`} />
//
// Deger next.config.ts ile ayni ortam degiskeninden okunur.
export const TEMEL_YOL = process.env.NEXT_PUBLIC_TEMEL_YOL ?? "";
