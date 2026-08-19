# Geliştirici Rehberi

Bu belge projenin nasıl kurgulandığını ve neden böyle kurgulandığını anlatır.

## Temel ilke

Bu depo açık kaynak olduğu için okunabilirlik, zekice çözümlerden önce gelir.
Çocuğunun kullandığı siteyi merak eden bir ebeveyn dosyaları açıp ne olduğunu
anlayabilmeli. Bir şeyi kısaltmakla açık yazmak arasında seçim gerektiğinde
açık yazmayı seçiyoruz.

## Mimari kararlar

### Neden statik site?

Site `next build` ile tamamen sabit HTML/CSS/JS dosyalarına dönüşür
(`output: "export"`). Sunucu, veritabanı ve API yoktur.

Bunun nedeni sadece maliyet değil: veri toplamayan bir site sözü vermenin en
inandırıcı yolu, veri toplayabilecek bir altyapının hiç var olmamasıdır.
Sunucu yoksa sunucuya gönderilecek veri de yoktur.

### Neden SVG tabanlı boyama?

Çizgi resimler SVG'dir. Doldurulabilir her bölge `class="boyanabilir"` taşıyan
bir `<path>`tir; boyamak `fill` niteliğini değiştirmekten ibarettir.

Alternatif, PNG üzerinde taşma-doldurma (flood fill) algoritması yazmaktı.
O yol daha akıcı bir fırça verirdi ama algoritmayı elle yazmak gerekirdi ve
yumuşatılmış çizgi kenarlarında renk sızıntısı yapardı — bu tür sitelerin
klasik kusuru budur. SVG yaklaşımı hem bu sorunu tamamen ortadan kaldırır hem
de doldurma işlemini tek satırlık, okunabilir bir koda indirir.

Bilinen ödünleşme: çok sayıda fırça vuruşu DOM'u büyütür. Hedef yaş grubunun
kullanımında sorun çıkarmıyor.

### Neden Türkçe isimlendirme?

Değişken ve fonksiyon adları Türkçedir (`fircaCizgileri`, `bolgeyiDoldur`),
ancak Türkçe karakter kullanılmaz. Kullanıcıya görünen metinler tam Türkçedir.

Hedef okur kitlesi Türkiye'deki ebeveynler, öğrenciler ve öğretmenler. Onlar
için `bolgeyiDoldur` okumak `fillRegion` okumaktan kolaydır.

## Katmanlar

```
lib/boyama/        saf mantık, React bilmez, tarayıcı bilmez
components/boyama/ arayüz, mantığı ekrana bağlar
app/               sayfalar ve yönlendirme
```

Kritik kural: **boyama mantığı `lib/boyama/durum.ts` içinde yaşar ve React'e
bağımlı değildir.** Bileşenler yalnızca bu fonksiyonları çağırır.

Bunun iki getirisi var: mantık React bilmeden okunabilir, ve tarayıcı açmadan
test edilebilir. Bir davranışı değiştirmek istediğinizde önce bu dosyaya ve
testlerine bakın.

## Geri alma nasıl çalışıyor?

`lib/boyama/durum.ts` içinde geçmiş, tuvalin **ardışık anlık görüntülerinin**
listesidir:

```ts
type BoyamaGecmisi = {
  adimlar: BoyamaDurumu[];   // her işlemden sonraki görünüm
  simdikiAdim: number;       // şu an hangisindeyiz
};
```

Geri almak, `simdikiAdim`'i bir azaltmaktır. Yeni bir işlem yapıldığında ileri
adımlar atılır ve geçmiş oradan devam eder.

Alternatif, her işlemi tersiyle birlikte kaydeden bir işlem günlüğü tutmaktı.
O yaklaşım daha az bellek kullanır ama belirgin biçimde daha uzun ve anlaşılması
zor kod gerektirir. Kopyalar sığdır (fırça çizgisi nesneleri adımlar arasında
paylaşılır), bu yüzden bellek maliyeti pratikte ihmal edilebilir.

## Tuval nasıl çalışıyor?

`components/boyama/Tuval.tsx` iki katmanı üst üste bindirir:

1. **Çizgi katmanı** — dosyadan gelen ham SVG. `dangerouslySetInnerHTML` ile
   basılır.
2. **Fırça katmanı** — React'in çizdiği ayrı bir `<svg>`. `pointer-events: none`
   taşır, böylece dokunmalar alttaki bölgelere geçer.

### `dangerouslySetInnerHTML` burada neden güvenli?

Bu prop'un adı haklı olarak ürkütücüdür: rastgele HTML basmak XSS açığı
yaratır. Buradaki içerik ise kullanıcıdan gelmiyor — `public/boyama/` altındaki,
depoya commit edilmiş ve `npm run kontrol` ile denetlenmiş SVG dosyaları
derleme anında okunuyor. Kullanıcının yazabildiği hiçbir veri bu yola girmiyor.

Alternatifi SVG'yi ayrıştırıp React elementlerine çevirmekti; bu her SVG
özelliği için ayrı kod gerektirir ve dosyayı okunamaz hale getirirdi.

### Dokunma koordinatları

Fırça çizerken ekran koordinatı SVG `viewBox` koordinatına çevrilir. Tuval ile
viewBox aynı en boy oranına (kare) sahip olduğu için basit bir oran hesabı
yeterlidir. Kare olmayan bir viewBox eklenirse bu hesabın gözden geçirilmesi
gerekir.

## Test stratejisi

| Katman | Araç | Neyi doğrular |
|---|---|---|
| Mantık | Vitest (`lib/**/*.test.ts`) | Doldurma, fırça, silme, geri alma, kayıt |
| Arayüz | Playwright (`e2e/`) | Gerçek tarayıcıda boyama, kalıcılık, galeri |
| İçerik | `scripts/kontrol.ts` | Her SVG boyanabilir mi, her görselin lisansı var mı |

`e2e/tum-resimler.spec.ts` katalogdaki **her** resmin **her** bölgesini tek tek
boyayıp doğrular. Yeni bir resim eklendiğinde bu test onu otomatik kapsar.

Üçü de GitHub Actions'ta, yayına çıkmadan önce çalışır.

## Yeni boyama sayfası eklemek

Ayrı belge: [boyama-sayfasi-hazirlama.md](boyama-sayfasi-hazirlama.md)

## Dikkat edilecekler

- **Veri toplama yasağı mutlaktır.** Analitik, çerez, harici script veya
  üçüncü taraf isteği eklemeyin. Yazı tipleri dahil her şey depoda barınır.
- **Dokunma hedefleri en az 56 piksel.** Küçük parmaklar için.
- **Metin asgari.** Hedef kitle henüz okumayı yeni öğreniyor; her eylemin
  ikonu olmalı.

## Harfler ve Sayılar bölümü

İkinci ana bölüm. Dört oyundan oluşur; şu an yalnızca "Yaz" oyunu yayında
(rakamlarla). Tasarım kararları ve gerekçeleri:
[tasarim/harfler-ve-sayilar.md](tasarim/harfler-ve-sayilar.md)

### Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `lib/ogren/sayilar.ts` | 0-10 arası rakamlar ve Türkçe adları |
| `lib/ogren/rakamYollari.ts` | Her rakamın çizim yolu |
| `lib/ogren/izleme.ts` | Parmakla izleme mantığı |
| `lib/ogren/yildiz.ts` | Kazanılan yıldızlar (localStorage) |

Boyama bölümündeki ilke burada da geçerli: mantık `lib/ogren/` altında
React'tan bağımsız yaşar, bileşenler yalnızca onu ekrana bağlar.

### Rakamlar neden eğri değil, nokta listesi?

Rakamlar bezier eğrileriyle değil, düz çizgi parçalarından oluşan nokta
listeleriyle (polyline) tanımlanır. Üç nedeni var:

1. Ekranda gösterilen yol ile çocuğun üstünden geçmesi gereken kontrol
   noktaları **aynı listeden** üretilir; ikisi birbirinden kayamaz.
2. Tarayıcıya bağlı `getPointAtLength` gerekmez, dolayısıyla mantık
   tarayıcı açmadan test edilebilir ve eski tarayıcılarda da aynı çalışır.
3. Yeterli nokta konduğunda (daire için 32) çizim göze yuvarlak görünür.

Çizim için bol nokta kullanılır; kontrol noktaları `kontrolNoktalari()` ile
seyreltilir. Böylece görsel yumuşaklık artarken oyunun zorluğu değişmez.

### Oyun durumu neden tek nesnede tutuluyor?

`YazOyunu.tsx` içinde sıra, kontrol noktaları ve izleme durumu tek bir
nesnede tutulur. Bunları ayrı `useState`'lerde tutmak gerçek bir çökmeye yol
açmıştı: rakam değiştiğinde kontrol noktaları hemen yenilenirken izleme
durumu bir render boyunca eski kalıyordu. Tek vuruşlu bir rakamdan (3) iki
vuruşlu birine (4) geçerken `durum.tamamlanan[1]` tanımsız oluyor ve sayfa
çöküyordu.

Kural: birlikte değişmesi gereken değerler tek bir state'te tutulmalı.

## Kodlama bölümü

Dördüncü ana bölüm. Tasarım kararları ve gerekçeleri:
[tasarim/kodlama.md](tasarim/kodlama.md)

### Dosyalar

| Dosya | Sorumluluk |
|---|---|
| `lib/kodla/labirent/komutlar.ts` | Komut tipleri ve iki komut seti |
| `lib/kodla/labirent/harita.ts` | Metin ızgarasını haritaya çevirir |
| `lib/kodla/labirent/calistir.ts` | Program + harita → adım listesi |
| `lib/kodla/labirent/cozucu.ts` | En kısa çözüm (yalnızca denetimde kullanılır) |
| `lib/kodla/labirent/temalar.ts` | Zemin ve engel çizimleri |
| `lib/kodla/program.ts` | Blok listesi işlemleri |
| `lib/kodla/ilerleme.ts` | Yıldızlar, deneme sayacı, kilit kuralı |

### Motor neden adım listesi döndürüyor?

`calistir()` animasyon değil veri üretir: her adımda Turna'nın nerede olduğu
ve ne olduğu. Bileşen bu listeyi 450 ms aralıklarla oynatır.

Getirisi, boyama bölümündeki ayrımın aynısı: "Turna hedefe vardı mı, kaç
adımda vardı, engele çarptı mı" sorularının tamamı tarayıcı açmadan test
edilir. Ayrıca çalışan bloğun vurgulanması bedava gelir; her adım kendisini
üreten bloğun sırasını taşır.

### Çözücü neden var?

`npm run kontrol` her bölümü genişlik öncelikli aramayla çözer. Çözümü
olmayan ya da `idealAdim` değeri yanlış olan bir bölüm depoya giremez.
Boyama tarafındaki "her resmin her bölgesi boyanabiliyor mu" denetiminin
karşılığıdır. Çözücü siteye dahil edilmez.

### Çarpma neden programı durdurmuyor?

Engele giren komut etkisiz kalır ve program devam eder. Bu bilinçli bir
karardır: bu yaş grubunda başarısızlık hissi öğrenmeyi durdurur. Aynı
gerekçe Harfler ve Sayılar bölümündeki "yanlış cevap cezalandırılmaz"
kuralının arkasında da vardır.
