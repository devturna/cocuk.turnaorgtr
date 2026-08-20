# Yol Haritası

Portal faz faz geliştiriliyor. Her faz kendi başına çalışan, kullanılabilir bir
bölüm teslim eder.

## Faz 1 — Boyama (tamamlandı)

Çocuğun hazır çizgi resimleri ekranda boyayabildiği bölüm.

- Kategorili resim galerisi
- Kova ile bölge doldurma
- Parmakla serbest fırça çizimi, üç kalınlık
- Silgi, geri al, baştan başla
- Yarım kalan çizimin tarayıcıda saklanması
- Beş kategoride kırk bir boyama sayfası (Hayvanlar, Köpekler, Araçlar, Doğa,
  Şekiller)

Kapsam dışı bırakılanlar: indirme ve yazdırma, ses efektleri, çok dillilik.

## Faz 2 — Harfler ve Sayılar (geliştiriliyor)

Çocuğun harfleri ve sayıları oyun oynayarak öğrendiği bölüm. Dört oyundan
oluşur ve parça parça açılır.

| Oyun | Ne yapar | Durum |
|---|---|---|
| Yaz | Parmakla harfin veya rakamın üstünden geçme | Rakamlar (0-9) yayında |
| Say | Ekrandaki nesneleri dokunarak sayma | Planlanıyor |
| Eşleştir | Büyük ↔ küçük harf, rakam ↔ miktar | Planlanıyor |
| Bul | Seçenekler arasından doğrusuna dokunma | Planlanıyor |

Tamamlanan her harf ve rakam bir yıldız kazandırır; yıldızlar yalnızca
cihazın tarayıcı hafızasında durur.

Tasarım kararları ve gerekçeleri:
[harfler-ve-sayilar.md](tasarim/harfler-ve-sayilar.md)

## Faz 3 — Oyunlar (planlanıyor)

Küçük yaş grubuna uygun, tek oturumda bitebilen basit oyunlar. Örneğin
hafıza kartları, şekil-gölge eşleme.

Aynı ilkeler geçerli olacak: reklamsız, veri toplamayan, tamamen statik.

## Faz 4 — Kodlama (geliştiriliyor)

Çocuğun komutları doğru sırada dizerek Turna'yı hedefe götürdüğü bölüm.
code.org'un 4-7 yaş kurslarının Türkçe ve Türkiye coğrafyası temalı karşılığı.

Bölüm yaş gruplarına (kurs) ayrılır. İlk kurs "Turna'nın Yolu" (4-7 yaş):
Türkiye haritasında durak durak ilerleyen bir göç yolu.

Hedef, code.org'un aynı yaş grubuna sunduğu Pre-reader Express kursundan
belirgin biçimde daha iyi bir deneyim.

| Faz | Kapsam | Durum |
|---|---|---|
| 4a | Kurs katmanı, göç haritası, labirent motoru, mutlak yönler, ilk beş durak | Tamamlandı |
| 4b | Arayüz ve hareket katmanı: yol önizlemesi, D-pad, animasyon, sessiz demo, tek adımlık öğretici ilk durak | Tamamlandı (altı durak yayında) |
| 4c | Karakter seçimi: çocuk hangi kuşla uçacağını seçer | Tamamlandı (turna ve flamingo yayında) |
| 4d | Dizi duraklar, on beş duraklık rota, hata ayıklama, döngü, dönüş komutları | Planlanıyor |
| 4e | İkinci mekanik: desen çizme (Türk kilim ve çini motifleri) | Planlanıyor |
| 4f | Olaylar: dokununca ne olsun | Planlanıyor |

Kapsamın ölçütü code.org'un Pre-reader Express kursudur: o kursun öğrettiği
her kavram bu bölümde de öğretilir. Hangi dersin hangi durağa düştüğü
[kodlama-kapsam.md](tasarim/kodlama-kapsam.md) içindedir. Ses bir kavram
değil kolaylık olduğu için kavramlar bittikten sonra ayrıca ele alınacak.

Tasarım kararları ve gerekçeleri: motor ve içerik için
[kodlama.md](tasarim/kodlama.md), arayüz için
[kodlama-arayuz.md](tasarim/kodlama-arayuz.md), karakter seçimi için
[kodlama-karakter.md](tasarim/kodlama-karakter.md), bölümün nereye kadar
gideceği için [kodlama-kapsam.md](tasarim/kodlama-kapsam.md)

## Değişmeyecek ilkeler

Hangi faz olursa olsun:

- Ücretsiz kalacak
- Reklam olmayacak
- Hiçbir kişisel veri toplanmayacak
- Kaynak kodu açık kalacak
