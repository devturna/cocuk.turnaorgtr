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

## Faz 2 — Harfler ve Sayılar (tamamlandı)

Çocuğun harfleri ve sayıları oyun oynayarak öğrendiği bölüm. Dört oyundan
oluşur ve parça parça açılır. **Dört oyun da yayında**: Yaz, Eşleştir ve Bul
hem harfleri hem rakamları çalıştırır, Say yalnızca sayılara aittir (harf
sayılmaz).

| Oyun | Ne yapar | Durum |
|---|---|---|
| Yaz | Parmakla harfin veya rakamın üstünden geçme | Harfler (29) ve rakamlar (0-9) yayında |
| Say | Ekrandaki nesneleri dokunarak sayma | 1-10 yayında (yalnızca sayı) |
| Eşleştir | Büyük ↔ küçük harf, rakam ↔ miktar | İkisi de yayında |
| Bul | Seçenekler arasından doğrusuna dokunma | Harfle başlayan kelime ve sayı kadar nesne yayında |

Tamamlanan her harf ve rakam bir yıldız kazandırır; yıldızlar yalnızca
cihazın tarayıcı hafızasında durur. Ebeveyn için özet tablo ve sıfırlama
`/ogren/ilerleme/` adresinde.

Tasarım kararları ve gerekçeleri:
[harfler-ve-sayilar.md](tasarim/harfler-ve-sayilar.md)

## Faz 3 — Oyunlar (tamamlandı)

Küçük yaş grubuna uygun, tek oturumda bitebilen basit oyunlar. Diğer
bölümlerden farkı: burada öğretilen bir konu yok. Bir çocuk her zaman
öğrenmek istemez; bu bölüm o an içindir.

| Oyun | Ne yapar | Durum |
|---|---|---|
| Hafıza | Kart çiftlerini bulma, tur turdan büyür (4→12 kart) | Yayında |
| Gölge | Nesnenin gölgesini dört gölge arasından bulma | Yayında |
| Sırala | Üç nesneyi küçükten büyüğe dizme | Yayında |

Bölümün ölçütü: **hiçbir oyun iki dakikadan uzun sürmemeli ve hiçbiri
kaybetmeyle bitmemeli.** Kayıt da yok — burada ilerleyecek bir şey olmadığı
için kayıt tutmak oyunu ödeve çevirirdi.

Tasarım kararları: [oyunlar.md](tasarim/oyunlar.md)

Aynı ilkeler geçerli: reklamsız, veri toplamayan, tamamen statik.

## Faz 4 — Kodlama (tamamlandı)

Çocuğun komutları doğru sırada dizerek Turna'yı hedefe götürdüğü bölüm.
code.org'un 4-7 yaş kurslarının Türkçe ve Türkiye coğrafyası temalı karşılığı.

Bölüm yaş gruplarına (kurs) ayrılır. İlk kurs "Turna'nın Yolu" (4-7 yaş):
Türkiye haritasında durak durak ilerleyen bir göç yolu. İkinci kurs
"Kilimin İzi" (4-7 yaş): aynı haritada dokuma ve çini şehirleri; komutlar
aynı, ama kuş bu kez arkasında çizgi bırakır. Üçüncü kurs "Göl Kıyısı"
(4-7 yaş): çocuk komut dizmez, "şuna dokununca şu olsun" kuralları yazar
ve kendi oyununu oynar.

Hedef, code.org'un aynı yaş grubuna sunduğu Pre-reader Express kursundan
belirgin biçimde daha iyi bir deneyim.

| Faz | Kapsam | Durum |
|---|---|---|
| 4a | Kurs katmanı, göç haritası, labirent motoru, mutlak yönler, ilk beş durak | Tamamlandı |
| 4b | Arayüz ve hareket katmanı: yol önizlemesi, D-pad, animasyon, sessiz demo, tek adımlık öğretici ilk durak | Tamamlandı (altı durak yayında) |
| 4c | Karakter seçimi: çocuk hangi kuşla uçacağını seçer | Tamamlandı (turna ve flamingo yayında) |
| 4d | Dizi duraklar, on beş duraklık rota, hata ayıklama, döngü, dönüş komutları | Tamamlandı (on beş durak, elli sekiz bulmaca) |
| 4e | İkinci mekanik: desen çizme (Türk kilim ve çini motifleri) | Tamamlandı ("Kilimin İzi" kursu, dört durak) |
| 4f | Olaylar: dokununca ne olsun | Tamamlandı ("Göl Kıyısı" kursu, iki durak) |

**Bu fazla birlikte code.org'un Pre-reader Express kursunun öğrettiği her
kavram bu bölümde de öğretiliyor**: sıralama, hata ayıklama, döngü, dönüş
komutları, çizimde döngü ve olaylar. Tek bilinçli eksik paylaşımdır
([kodlama-kapsam.md](tasarim/kodlama-kapsam.md) §9): portalın veri toplama
yasağı mutlaktır.

Kapsamın ölçütü code.org'un Pre-reader Express kursudur: o kursun öğrettiği
her kavram bu bölümde de öğretilir. Hangi dersin hangi durağa düştüğü
[kodlama-kapsam.md](tasarim/kodlama-kapsam.md) içindedir. Ses bir kavram
değil kolaylık olduğu için kavramlar bittikten sonra ayrıca ele alınacak.

Tasarım kararları ve gerekçeleri: motor ve içerik için
[kodlama.md](tasarim/kodlama.md), arayüz için
[kodlama-arayuz.md](tasarim/kodlama-arayuz.md), karakter seçimi için
[kodlama-karakter.md](tasarim/kodlama-karakter.md), bölümün nereye kadar
gideceği için [kodlama-kapsam.md](tasarim/kodlama-kapsam.md)

## Sırada ne var

Dört fazın dördü de kendi ölçütünü karşıladı. Buradan sonrası derinleşmedir,
yeni bölüm değil:

- **İkinci yaş grubu kursu** (7-9): koşul, değişken, fonksiyon
  ([kodlama-kapsam.md](tasarim/kodlama-kapsam.md) §11).
- **Daha fazla boyama sayfası ve desen motifi** — ikisi de kod yazmadan,
  içerik ekleyerek büyür.
- **Ses**: bütün bölümlerde bilinçli olarak yok. Kavramlar bittiğine göre
  artık kendi kararını hak ediyor.

## Değişmeyecek ilkeler

Hangi faz olursa olsun:

- Ücretsiz kalacak
- Reklam olmayacak
- Hiçbir kişisel veri toplanmayacak
- Kaynak kodu açık kalacak
