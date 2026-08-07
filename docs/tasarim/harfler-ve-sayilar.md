# Tasarım Belgesi — Harfler ve Sayılar Bölümü

**Tarih:** 7 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Durum:** Onaylandı, uygulama fazlara bölündü

## 1. Amaç

Çocuğun harfleri ve sayıları oyun oynayarak tanıması, yazması ve sayması.
Portalın ikinci ana bölümü.

Hedef kitle boyama bölümüyle aynı: 4-8 yaş, tablet ve dokunmatik öncelikli,
okuma henüz öğrenilmiyor olabilir.

## 2. Temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Yapı | Beceri başına ayrı oyun | Tekrar oynanabilirlik ve oyun hissi |
| Ses | Yok; ebeveyn okur | Aşağıdaki gizlilik notuna bakın |
| İlerleme | Yıldız + ebeveyn özeti | Motivasyon, ve ebeveynin görebilmesi |
| Kayıt | Yalnızca localStorage | Portalın veri toplamama ilkesi |
| Adres | `/ogren/` | Kısa, Türkçe, karaktersiz |

### Ses neden yok?

Harf öğreniminde sesin değerli olduğunu biliyoruz, ama iki seçenek de
elenmiştir:

**Tarayıcı konuşma sentezi (Web Speech API) kullanılmayacaktır.** Chrome'da
sesler yerel veya ağ tabanlı olabilir; ağ tabanlı bir ses seçildiğinde
okunacak metin üçüncü taraf sunucuya gider. Bu, ebeveynlere verdiğimiz
"hiçbir veri cihazdan çıkmaz" sözünü ve `docs/ebeveynler-icin.md` içindeki
"Network sekmesinde hiçbir harici istek göremezsiniz" davetini çürütür.

**Kendi ses kaydımız** ileride eklenebilir; şimdilik kayıt üretilmedi.

Yerine: harfle başlayan bir resim gösterilir (A → Armut) ve sesi ebeveyn
söyler. Bu, portalın "ebeveynle birlikte" yaklaşımıyla da tutarlıdır.

## 3. Türkçe alfabenin getirdiği kurallar

Bu kararlar `lib/ogren/alfabe.ts` içinde tek yerde verilir ve bütün
oyunlarda geçerli olur.

- **Alfabe 29 harftir:** A B C Ç D E F G Ğ H I İ J K L M N O Ö P R S Ş T U Ü
  V Y Z. Q, W, X yoktur.
- **Ğ ile başlayan kelime yoktur.** Bu harf için örnek kelime yerine harfin
  içinde geçtiği bir kelime kullanılır (ağaç). Alfabe verisinde bu durum
  ayrı bir alanla işaretlenir ki oyunlar "ile başlar" ifadesini yanlış
  kullanmasın.
- **I/İ ayrımı** küçük çocuk için en zor yerdir: büyük `I`'nin küçüğü `ı`,
  büyük `İ`'nin küçüğü `i`. Eşleştir oyununda bu ikisi aynı turda birlikte
  sorulmaz; karışıklığı öğrenmeden önce yaşatmamak için ayrı turlara düşer.

## 4. Mimari

### Klasör düzeni

```
app/ogren/
  page.tsx              bölüm girişi, dört oyun kartı
  yaz/page.tsx          Yaz oyunu
  say/page.tsx          Say oyunu
  eslestir/page.tsx     Eşleştir oyunu
  bul/page.tsx          Bul oyunu
  ilerleme/page.tsx     ebeveyn için özet
components/ogren/       oyun bileşenleri
lib/ogren/
  alfabe.ts             29 harf: büyük, küçük, örnek kelime, resim
  sayilar.ts            0-10: rakam ve adı
  harfYollari.ts        her harfin çizim yolu (Yaz oyunu için)
  yildiz.ts             kazanılan yıldızlar, localStorage
```

### Paylaşılan içerik ilkesi

Dört oyun da aynı içerik kaynağını kullanır; harflerin ve sayıların tanımı
tek yerde durur. Oyunlar bu veriyi yalnızca farklı biçimlerde sunar.

Boyama bölümündeki ilkeyle aynı: mantık ve veri React'tan bağımsızdır,
tarayıcı açmadan test edilebilir.

### Veri modeli

```ts
type Harf = {
  buyuk: string;        // "A"
  kucuk: string;        // "a"
  ornekKelime: string;  // "Armut"
  resim: string;        // public/ogren/armut.svg
  basindaGecmez?: true; // yalnizca Ğ icin
};

type Sayi = {
  rakam: number;        // 3
  ad: string;           // "Üç"
};

// Yaz oyunu 0-9 arasi rakamlari kullanir (her rakamin kendi yolu vardir).
// Say oyunu 1-10 arasini kullanir; sifir nesne sayilamaz, on ise sayilabilir.

// Hangi ogenin hangi oyunda tamamlandigi.
type Yildizlar = Record<string, string[]>;
// ornek: { "harf:A": ["yaz", "bul"], "sayi:3": ["say"] }
```

localStorage anahtarı: `ogren:yildizlar`.

## 5. Oyunlar

### Yaz

Ekranda soluk gri büyük bir harf veya rakam, üzerinde noktalı çizim yolu ve
başlangıcı gösteren yeşil bir nokta bulunur. Çocuk parmağıyla yolun üstünden
geçer.

Yol üzerine görünmez kontrol noktaları serpiştirilir (`getTotalLength` ve
`getPointAtLength` ile). Parmak bir noktanın yakınından geçtiğinde o nokta
tamamlanır. Yakınlık eşiği SVG `viewBox` koordinatında ölçülür (400 birimlik
tuvalde 30 birim), böylece ekran boyutundan bağımsız olarak aynı toleransı
verir. Tamamı işaretlenince harf renklenir ve kutlama gösterilir.

Çok vuruşlu harfler (A üç çizgi, İ iki parça) sırayla ilerler: bir vuruş
bitmeden sonraki başlamaz.

Fırça çizimi boyama bölümündeki mekanizmanın aynısıdır; oradaki kod
yeniden kullanılır.

### Say

Ekranda 1-10 arası nesne görünür. Çocuk her birine dokunur; dokunulan nesne
işaretlenir ve sayaç büyür. Yani parmakla sayar — okul öncesinde kullanılan
gerçek yöntem budur. Hepsi sayıldıktan sonra "kaç tane?" sorusu ve üç rakam
seçeneği çıkar.

### Eşleştir

Solda büyük harfler, sağda karışık sırayla küçük harfleri durur. Çocuk bir
çift seçer; doğruysa ikisi de sabitlenir, yanlışsa hafifçe sallanıp geri
döner. Bir turda dört veya beş çift olur.

Sayı sürümünde rakam ile nokta grubu eşleştirilir (3 ile üç nokta).

### Bul

Üstte hedef gösterilir, altta üç veya dört seçenek bulunur. Doğru seçenek
kutlanır ve sonraki soruya geçilir. En kısa turlu, en basit oyundur.

### Bütün oyunlarda geçerli kural

**Yanlış cevap cezalandırılmaz.** Puan kaybı yoktur, süre sınırı yoktur,
"yanlış" uyarısı verilmez. Yanlış seçim yalnızca nazikçe geri döner ve çocuk
tekrar dener.

Bu, tasarımın merkezindeki karardır: bu yaş grubunda başarısızlık hissi
öğrenmeyi durdurur. Oyunlar sadece doğruyu kutlar.

Ayrıca boyama bölümündeki arayüz kuralları burada da geçerlidir: dokunma
hedefleri en az 56 piksel, anlam yazıda değil şekilde ve ikonda taşınır,
ekranda kaydırma yoktur.

## 6. Yıldızlar ve ebeveyn özeti

Bir harf veya rakam, bir oyunda tamamlandığında o oyun için yıldız kazanır.
Oyun kartlarında ilerleme görünür (örneğin "12/29 harf").

`/ogren/ilerleme/` adresinde ebeveyn için özet tablo bulunur: hangi harf
hangi oyunlarda tamamlandı. Aynı sayfada bir sıfırlama düğmesi vardır.

Bu kayıt yalnızca cihazın tarayıcı hafızasındadır ve hiçbir yere gönderilmez.

## 7. Test

| Katman | Araç | Neyi doğrular |
|---|---|---|
| Veri ve mantık | Vitest | Alfabe bütünlüğü, yıldız kaydı, oyun turu üretimi |
| Arayüz | Playwright | Her oyunun oynanabildiği, kaydırma olmadığı |
| İçerik | `npm run kontrol` genişletilir | Her harfin yolu ve resmi var mı |

Alfabe için özel bir bütünlük testi yazılır: 29 harfin tamamı var mı,
her birinin küçük harfi ve örnek kelimesi doğru mu, Ğ işaretli mi.

## 8. Fazlar

Bu bölümün tamamı boyama bölümü kadar iştir. Dörde bölünmüştür; her faz
kendi başına yayınlanabilir ve çalışır durumdadır.

| Faz | Kapsam | Gerekçe |
|---|---|---|
| 2a | Bölüm iskeleti, yıldız altyapısı ve Yaz oyunu, yalnızca sayılar (0-9) | On rakamın yolunu çizmek yirmi dokuz harften çok daha az iştir; izleme mekanizması hızlıca kanıtlanır |
| 2b | Yaz oyununa 29 harf | Mekanizma çalıştıktan sonra içerik üretimi |
| 2c | Bul ve Eşleştir | İkisi de benzer mekanik; birlikte yapmak ucuz |
| 2d | Say ve ebeveyn ilerleme özeti | Kendi nesne setini gerektirir |

## 9. Faz 2a tamamlanma ölçütleri

1. Ana sayfada dördüncü kart var ve `/ogren/` açılıyor
2. Bölüm girişinde dört oyun kartı görünüyor; yalnızca Yaz etkin, diğerleri
   "yakında" olarak işaretli
3. Yaz oyununda 0-9 arası rakamlar parmakla yazılabiliyor
4. Tamamlanan rakam yıldız kazandırıyor ve yıldız tarayıcıda saklanıyor
5. Ekranda kaydırma yok, dokunma hedefleri en az 56 piksel
6. Birim testleri, uçtan uca testler ve denetim script'i geçiyor
