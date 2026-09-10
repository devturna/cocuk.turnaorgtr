# Kodlama — Çizim Mekaniği (Faz 4e)

Bu belge, kodlama bölümünün **ikinci mekaniğini** tanımlar: çocuğun
komutlarla bir desen çizdiği duraklar. Kapsam gerekçesi
[kodlama-kapsam.md](kodlama-kapsam.md) §8'dedir; burada mekaniğin kendisi
anlatılır.

## 1. Neden ikinci bir mekanik

code.org'un Pre-reader Express kursu döngüyü iki kez öğretir: önce labirentte
(hareket), sonra çizimde (desen). İkincisi tekrarın **ne işe yaradığını**
gösteren yerdir — dört komutluk bir dizi, dört kez tekrarlanınca bir kare
olur. Labirentte tekrarın çıktısı bir yol; çizimde bir **nesne**.

Bizim karşılığımız Türk **kilim ve çini motifleridir**. Bu, portalın kültür
çerçevesine döngüden bile doğal oturur: kilim zaten tekrarla yapılan bir
şeydir. Bir motifi tekrarlayarak bordür, bordürü tekrarlayarak halı.

## 2. Temel karar: aynı komutlar, yeni sonuç

| Konu | Karar | Gerekçe |
|---|---|---|
| Komut seti | `donusler` (ileri, sağa dön, sola dön) — labirentin aynısı | Çocuk bunu 12. ve 13. durakta zaten öğrendi; yeni mekanik yeni dil öğretmesin |
| Hareket | Izgara **köşeleri** arasında, birim uzunlukta | Çizgi kareler arasına değil, kenarlara düşer |
| Dönüş | 90° | 45° yıldız motiflerini açardı ama bu yaşta açı kavramı yok |
| Kalem | Her zaman iner (kalem kaldırma yok) | Ayrı bir durum daha; motifleri tek çizgide çizilebilir seçiyoruz |
| Doğrulama | Hedef desenin **her kenarı çizildiyse** başarılı | Piksel eşitliği bu yaşta hüsran üretir (kapsam §8) |
| Fazla çizgi | Serbest, yalnızca altın yıldızı kaçırtır | Ceza yok kuralı; ideal blok sayısı zaten ölçüyor |

**Kalem kaldırma neden yok:** her fazladan durum, çocuğun kafasında
tutması gereken bir şey daha demektir. Motifleri "tek kalemde çizilebilir"
seçerek bu ihtiyacı içerik tarafında ortadan kaldırıyoruz. Kilim
motiflerinin çoğu zaten tek hatlıdır.

## 3. Sahne

Izgara noktaları (köşeler) soluk noktalarla gösterilir; çizilen kenarlar
kalın renkli çizgilerdir. Hedef desen **arka planda soluk** durur: çocuk ne
çizeceğini görür, üstünden geçer.

```
·   ·   ·   ·        hedef: soluk
·———·———·   ·        çizilen: kalın
    |
·   ·   ·   ·
```

Kuş, köşede durur ve baktığı yöne bakar. Çizgi, kuş yürüdükçe uzar —
labirentteki yol önizlemesinin karşılığı burada **çizimin kendisidir**.

## 4. Önizleme

Labirentte olduğu gibi: program çalıştırılmadan da ne çizileceği görünür.
Aynı fonksiyon (`ciz()`) hem önizlemeyi hem koşuyu üretir; ikisi
ayrışamaz.

## 5. İçerik

Yeni bir mekanik yeni bir `mekanik` değeridir: `"desen"`. Durak şeması
labirentle aynı kalır (id, ad, tema, durak, ipucu, bulmacalar); bulmaca
şemasında `harita` yerine `desen` durur:

```json
{
  "komutSeti": "donusler",
  "idealAdim": 3,
  "kucak": { "asama": "serbest" },
  "enFazlaBlok": 3,
  "desen": {
    "genislik": 4,
    "yukseklik": 4,
    "baslangic": { "x": 0, "y": 3, "bakis": "sag" },
    "kenarlar": ["0,3 1,3", "1,3 1,2", "1,2 0,2", "0,2 0,3"]
  }
}
```

Kenar, iki komşu köşenin arasıdır ve yönsüzdür: `"0,3 1,3"` ile
`"1,3 0,3"` aynı kenardır. Denetim script'i her kenarın gerçekten komşu
iki köşeyi birleştirdiğini, deseni çizen bir programın blok sınırına
sığdığını ve `idealAdim`'in o programın blok sayısı olduğunu kanıtlar —
labirentteki çözücünün karşılığı.

## 6. Rota

Çizim durakları **ayrı bir kurstur**: "Kilimin İzi". Turna'nın Yolu bittiği
yerde biter; yeni kurs aynı Türkiye haritasını kullanır ama durakları
dokuma ve çini şehirleridir (İznik, Kütahya, Uşak, Milas, Hereke).

Ayrı kurs olmasının nedeni: Turna'nın Yolu bir **göç hikâyesidir** ve on
beş durakta tamamlanmıştır; araya desen durağı sokmak o hikâyeyi böler.
Kurs katmanı Faz 4a'da tam da bunun için yazıldı.

## 7. Yapmayacaklarımız

- **Renk seçimi.** Kilim renkli, ama renk komutu kavram değil süstür;
  motifin kendisi yeter.
- **Açı komutları.** 45°, 30°: bu yaşta açı yok.
- **Serbest çizim.** Boyama bölümü zaten var; buranın konusu programla
  çizmek.
- **Kalem kaldırma.** §2'de.
