# Katkıda Bulunma

Katkılar memnuniyetle karşılanır. Bu bir çocuk projesi olduğu için birkaç
kuralımız var; hepsi çocukların güvenliği ve ebeveynlerin güveni içindir.

## Nereden başlamalı?

En kolay ve en faydalı katkı **yeni bir boyama sayfası** eklemektir:
[docs/boyama-sayfasi-hazirlama.md](docs/boyama-sayfasi-hazirlama.md)

Kod tarafına katkı için önce şunu okuyun:
[docs/gelistirici-rehberi.md](docs/gelistirici-rehberi.md)

## Değiştirilemez kurallar

Bu maddeleri ihlal eden katkılar, ne kadar iyi yazılmış olursa olsun kabul
edilmez:

1. **Veri toplama yasaktır.** Analitik aracı, çerez, kullanıcı hesabı, form
   veya üçüncü taraf script eklenemez.
2. **Harici istek yasaktır.** Site çalışırken kendi alan adı dışında hiçbir
   adrese istek atmamalıdır. Yazı tipleri ve görseller dahil her şey depoda
   barınır.
3. **Reklam yasaktır.**
4. **Görsellerin lisansı belli olmalıdır.** Kaynağı bilinmeyen hiçbir görsel
   depoya giremez; `npm run kontrol` bunu zaten engeller.

## Kod kuralları

- **İsimlendirme Türkçedir, Türkçe karakter kullanılmaz.**
  `fircaCizgileri` evet, `brushStrokes` hayır, `fırçaÇizgileri` hayır.
- **Kullanıcıya görünen metinler tam Türkçedir.** "Baştan Başla".
- **Yorumlar Türkçedir.** Her dosyanın başında ne işe yaradığını anlatan kısa
  bir açıklama bulunur.
- **Dokunma hedefleri en az 56 pikseldir.**
- **Boyama mantığı `lib/boyama/` altında, React'tan bağımsız kalır.**
- **Okunabilirlik zekice çözümden önce gelir.** Bu depoyu yazılımcı olmayan
  insanlar da okuyor.

## Göndermeden önce

Şu dört komutun da geçtiğinden emin olun:

```bash
npm run lint
npm run test
npm run kontrol
npm run e2e
```

Aynı kontroller GitHub üzerinde de çalışır; geçmeyen bir değişiklik yayına
çıkamaz.

## Süreç

1. Depoyu çatallayın (fork) ve bir dal açın.
2. Değişikliğinizi yapın, yukarıdaki komutları çalıştırın.
3. Pull request açın ve ne yaptığınızı kısaca anlatın.

Büyük bir değişiklik düşünüyorsanız önce bir konu (issue) açıp tartışmak
zaman kazandırır.

## Davranış

Bu bir çocuk projesidir. Katkılarda ve tartışmalarda nazik olun; uygunsuz
içerik veya davranış kabul edilmez.
