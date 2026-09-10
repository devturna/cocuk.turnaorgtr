# Kodlama — Olaylar (Faz 4f)

Kodlama bölümünün **üçüncü mekaniği**: çocuğun "şuna dokununca şu olsun"
kuralları yazdığı duraklar. Kapsam gerekçesi
[kodlama-kapsam.md](kodlama-kapsam.md) §9'dadır.

## 1. Öğretilen şey

Buraya kadar çocuk **ne zaman çalışacağını kendi belirlediği** programlar
yazdı: çalıştır düğmesine bastı, komutlar sırayla koştu. Olay güdümlü
programlamada bu değişir — program yazılır, sonra **bekler**; çalıştıran
şey çocuğun dokunuşudur.

Kavram bu kadardır ve tek cümleyle anlatılabilir: *sen dokununca ne olsun?*

## 2. Program modeli: kural listesi

Program artık bir komut dizisi değil, bir **kural kümesidir**. Her kural
tek bir cümledir:

```
🐦 dokununca  →  🎵 öt
🐸 dokununca  →  ⬆ zıpla
```

- **Tek olay türü var: dokunma.** code.org'un Play Lab'i "when run",
  "when touched", "when arrow pressed" sunar. Bu yaşta klavye yok, "when
  run" ise zaten önceki mekaniklerin tamamı. Dokunma tek başına kavramı
  taşır.
- **Bir nesnenin bir kuralı olur.** Aynı nesneye ikinci kural yazmak
  "hangisi önce" sorusunu doğurur; bu yaşta o soru yok. Yeni kural
  eskisinin yerine geçer.
- **Sıra yoktur.** Kurallar bir liste gibi görünse de sıraları anlamsızdır;
  bu, sıralamayı öğreten önceki mekaniklerle bilinçli bir karşıtlıktır.

## 3. Eylemler

| Eylem | Ne olur |
|---|---|
| Zıpla | Nesne bir yaylanma yapar |
| Öt | Nesnenin üstünde bir nota belirir |
| Dön | Nesne kendi ekseninde bir tur döner |
| Büyü | Nesne bir büyüyüp eski boyuna döner |

Dördü de **geri dönüşsüz değildir**: her eylem başladığı yerde biter, sahne
hiçbir zaman bozulmaz. Bu yaşta "geri al" gerektirmeyen bir oyun alanı,
kaybolan bir nesneden iyidir.

## 4. Doğrulama

Bulmaca bir **istek** taşır: "Kurbağaya dokununca zıplasın." Kural yazıldığı
anda bulmaca biter — çalıştırmaya gerek yok, çünkü çalıştıran şey artık
çocuğun kendisidir.

Son durak **serbest oyundur**: istek yok, çocuk istediği kuralı yazar ve
oynar. Yıldız, ilk kuralı yazdığında verilir.

## 5. Sahne

Bir göl kıyısı: iki üç nesne (kuş, kurbağa, çiçek, bulut). Nesneler
sahnede sabit durur ve dokunulabilir. Kural yazılmamış bir nesneye
dokunmak hiçbir şey yapmaz — sessizce.

## 6. Paylaşım yok

code.org bu dersi "oyununu bir link ile paylaş" ile bitirir. Portalın veri
toplama yasağı mutlaktır: hiçbir şey cihazdan çıkmaz. Bizim karşılığımız
"yap ve oyna"da biter. Ebeveyn belgesinde bunun nedeni tek cümleyle
anlatılır.

## 7. Yapmayacaklarımız

- **İkinci olay türü** (sürükleme, çarpışma): kavramı büyütmez, arayüzü
  büyütür.
- **Nesne ekleme/silme.** Sahne sabittir; çocuk kural yazar, sahne kurmaz.
- **Ses.** Öt eylemi bir nota **gösterir**; gerçek ses bütün bölümde
  yoktur ve kendi kararını hak eder (kapsam §1).
