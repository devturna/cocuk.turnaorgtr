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

Doldurulabilir her yol şunları taşımalı:

- `class="boyanabilir"`
- benzersiz bir `id` (Türkçe ama Türkçe karaktersiz: `govde`, `solKulak`)
- `fill="#ffffff"`

Çizgi grubu ise `pointer-events="none"` taşımalı. Bu, çocuğun parmağı
çizginin üstüne denk geldiğinde bile alttaki bölgenin boyanmasını sağlar.

Kök `<svg>` elementinde mutlaka `viewBox` bulunmalı; genişlik ve yükseklik
değerleri sabitlenmemeli.

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
