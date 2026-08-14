# Yeni Boyama Sayfası Ekleme

Bu rehber, siteye yeni bir çizgi resim eklemenin adımlarını anlatır.

## Neden hazırlık gerekiyor?

Açık lisanslı arşivlerden indirilen SVG'lerin çoğu doğrudan kullanılamaz.
Bu dosyalarda resim genellikle yalnızca çizgilerden oluşur; boyanacak
bölgeler "kapalı alan" olarak tanımlı değildir. Tıklayınca renk dolması
için her bölgenin kendi kapalı yolu (path) olması gerekir.

## Adımlar

### 1. Görseli bul

Yalnızca CC0 veya CC-BY lisanslı kaynakları kullan. İndirdiğin sayfanın
adresini ve lisansını not al; bunları kataloğa yazacaksın.

### 2. Bölgeleri ayır

Inkscape gibi bir programda dosyayı aç. Boyanacak her alan için kapalı
bir yol oluştur. Sonuçta SVG şu yapıda olmalı:

- `<g class="bolgeler">` içinde doldurulabilir alanlar
- `<g class="cizgiler">` içinde resmin siyah çizgileri

### 3. Bölgeleri işaretle

Doldurulabilir her bölge şunları taşımalı:

- `class="boyanabilir"`
- benzersiz bir `id` (Türkçe ama Türkçe karaktersiz: `govde`, `solKulak`)
- `fill="#ffffff"`

Bölge `<path>` olmak zorunda değil; `<ellipse>`, `<circle>` ve `<rect>` de
kullanılabilir ve çoğu zaman çok daha okunabilir olur. Kendi çizdiğimiz
hayvanlar bu temel şekillerden oluşuyor.

Çizgi grubu ise `pointer-events="none"` taşımalı. Bu, çocuğun parmağı
çizginin üstüne denk geldiğinde bile alttaki bölgenin boyanmasını sağlar.

Kök `<svg>` elementinde mutlaka `viewBox` bulunmalı; genişlik ve yükseklik
değerleri sabitlenmemeli.

### Üst üste binen şekillere dikkat

Çizgiler bütün bölgelerin üstünde durur. Bu yüzden iki şekil üst üste
binerse, alttakinin çizgisi üsttekinin ortasından geçer ve resim kirli
görünür. İki basit kural bunu önler:

**1. Şekilleri teğet tut, iç içe geçirme.** Hayvanları önden çizmek bunu
kolaylaştırır: kafa, gövdenin tam üstünde durur; kulaklar kafanın dışına
taşar. Yan görünümde ovaller kaçınılmaz olarak birbirine girer.

**2. Gövdeye giren parçaların konturunu açık bırak.** Bacaklar gövdenin
içine kadar uzanmalı ki boyanınca kopuk durmasın, ama üst kenarları
çizilmemeli:

```svg
<!-- Bolge govdenin icine girer -->
<rect class="boyanabilir" id="solOnBacak" fill="#ffffff"
      x="140" y="315" width="28" height="70" rx="8"/>

<!-- Kontur ustu aciktir ve govdenin altindan baslar -->
<path d="M140 330 L140 379 Q140 385 146 385 L162 385 Q168 385 168 379 L168 330"/>
```

**3. Açık konturun ucu, örten şeklin birkaç piksel içinde bitsin.** Kulak ya da
kuyruk konturu kafanın dışında biterse çizim havada asılı kalmış gibi görünür.
Uç noktayı bilerek kafa çizgisinin 3-6 piksel içine koyun; iki çizgi kesişince
göz onları birleşik görür.

### Aynı iskeleti paylaşan bir seri çizmek

Köpekler kategorisi buna örnektir: on cins de aynı oturan gövdeyi, aynı iki ön
bacağı ve aynı kafa oval merkezini kullanır. Cinsler yalnızca kulak, burun,
kuyruk ve desenle ayrışır.

Böyle çalışmak iki işe yarar: yeni bir çizim yarım saatte değil beş dakikada
biter ve resimler birbirinin yanında dururken aynı aileden görünür. Yeni bir
köpek eklemek isteyen biri için en kolay yol `labrador.svg` dosyasını kopyalayıp
kulakları, kuyruğu ve desenleri değiştirmektir.

Örnek iskelet:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <g class="bolgeler">
    <path class="boyanabilir" id="govde" fill="#ffffff" d="..."/>
  </g>
  <g class="cizgiler" fill="none" stroke="#000000" stroke-width="6"
     stroke-linejoin="round" pointer-events="none">
    <path d="..."/>
  </g>
</svg>
```

### 4. Kataloğa ekle

`content/boyama-katalogu.json` dosyasına yeni bir girdi ekle:

```json
{
  "id": "kelebek",
  "ad": "Kelebek",
  "kategori": "Hayvanlar",
  "dosya": "kelebek.svg",
  "lisans": "CC0-1.0",
  "kaynak": "openclipart",
  "kaynakUrl": "https://openclipart.org/detail/12345"
}
```

`public/boyama/LISANSLAR.md` tablosuna da bir satır ekle.

### 5. Kontrol et

```bash
npm run kontrol
```

Bu komut bölgelerin işaretli olduğunu, lisans alanlarının dolu olduğunu ve
katalogla klasörün birbiriyle uyuştuğunu doğrular. Aynı kontrol GitHub
üzerinde de çalışır; geçmeyen bir değişiklik yayına çıkamaz.
