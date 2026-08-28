# Tasarım Belgesi — Kodlama Bölümü Kapsam Haritası

**Tarih:** 20 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Durum:** Onay bekliyor

Bu belge tek bir fazı değil, kodlama bölümünün **nereye kadar gideceğini**
tarif eder. Faz 4a-4c yayında; geri kalan fazlar buradaki karşılık haritasına
göre planlanacak. Motor ve arayüz kararları için
[kodlama.md](kodlama.md), [kodlama-arayuz.md](kodlama-arayuz.md),
[kodlama-karakter.md](kodlama-karakter.md).

## 1. Hedef

Ölçüt net: **code.org'un Pre-reader Express kursunun öğrettiği her kavram
bizim bölümümüzde de öğretilecek.** Kurs 4-7 yaş içindir ve okuma
gerektirmez; bizim hedef kitlemiz de budur.

Kaynak: [curriculum.code.org/csf-20/pre-express](https://curriculum.code.org/csf-20/pre-express/)

Kavramı almak, dersi kopyalamak değildir. code.org sırayı dört ayrı çizgi
filmle (Scrat, Angry Birds, Rey ve BB-8, Harvester) dört kez anlatır; biz aynı
kavramı Türkiye coğrafyasında altı durakta anlatıyoruz. Ölçüt **çocuk neyi
öğrendi**, kaç ekran gördüğü değil.

## 2. Karşılık haritası

| code.org dersi | Kavram | Bizdeki karşılığı | Durum |
|---|---|---|---|
| 1 Sürükle ve bırak | mekanik tanıtımı | Göksu Deltası, tek adımlık öğretici | Yayında (4b) |
| 2 Scrat ile sıralama | sıra | Sultansazlığı | Yayında (4a) |
| 3 Angry Birds ile programlama | sıra, engel | Kapadokya | Yayında (4a) |
| 4 Rey ve BB-8 | sıra, uzun program | Tuz Gölü, Pamukkale | Yayında (4a) |
| 5 Harvester | sıra, toplama | Efes (başak toplama) | Yayında (4a) |
| — (derslerin içine serpiştirilmiş) | **hata ayıklama** | yok | **Faz 4d** |
| 6 Scrat ile döngü | **döngü** | yok | **Faz 4d** |
| 7 Laurel ile döngü | **döngü, toplama** | yok | **Faz 4d** |
| 8 Okyanus sahnesi | **çizimde döngü** | yok | **Faz 4e** |
| 9 Bahçe çizimi | **döngüyle desen** | yok | **Faz 4e** |
| 10 Play Lab ile hareket | **olaylar** | yok | **Faz 4f** |
| 11 Play Lab ile oyun | **olaylar, kendi oyunu** | yok | **Faz 4f** |

Sıra kavramında karşılık **fazlasıyla** sağlanmış durumda. Eksik olan üç
kavram var: döngü, çizim, olaylar. Hata ayıklama code.org'da ayrı bir ders
değil ama kurs tanımının açıkça saydığı bir kazanım ("programdaki hatayı fark
etme ve düzeltme planı kurma"), ve bizde hiç yok.

### Ses fazı nereye gitti?

Eski yol haritasında 4e "ses katmanı"ydı. Ses bir kavram değil, bir
kolaylıktır ve kayıt üretmeyi gerektirir. Kapsam haritasında kavramlar önce
gelir; ses, kavramlar tamamlandıktan sonra kendi başına ele alınır. Numaralar
buna göre kaydırılmıştır.

## 3. Yapısal karar: durak = bulmaca dizisi

Bugün bir durak **tek** bulmaca tutuyor. code.org'da bir ders 8-12 bulmacadır.
Bugünkü yapıyla karşılık sağlamak yaklaşık 25 durak isterdi; Türkiye
haritasında 25 nokta hem kalabalık, hem de her noktanın gerçek bir kuş alanı
olması iddiasını çürütürdü.

**Karar:** Bir durak, bir konuyu öğreten **3-6 bulmacadan** oluşur. Çocuk
durakta kalır, bulmacaları sırayla çözer, hepsi bitince yıldızını alıp sonraki
durağa uçar.

Bunun getirdiği değişiklikler:

- `content/kodla/turna-yolu.json` içinde durak, tek bir harita yerine
  **bulmaca dizisi** taşır. Ortak alanlar (ad, ipucu, tema, konum) durakta
  kalır; harita, komut seti ve ideal adım her bulmacanın kendi alanı olur.
- İlerleme kaydı durak başına "kaçıncı bulmacadayım" bilgisini de tutar.
  Bugünkü `kodla:ilerleme` anahtarı yalnızca tamamlanan durakları biliyor.
- Bölüm ekranı, bulmaca bitince sonraki bulmacaya **aynı ekranda** geçer;
  harita ekranına dönmez. Kutlama katmanı (yıldız, konfeti, "Sonraki durak")
  yalnızca durağın son bulmacasında çıkar.

  Ara bulmacada ne olduğu, ilk yazımda "daha küçük, kesintisiz bir geçiş"
  diye tarif ediliyordu. Yapılan bu değil: kuş yuvaya konar, yuva dolar ve
  kutlama pozu yarım saniye ekranda kalır; sonra **tam ekran, %88 opak bir
  perde** iner, bir onay işareti ve "Sıradaki bulmaca" yazısı gösterir ve
  yaklaşık 1,1 saniye sonra kalkar. Oyun toplamda ~1,6 saniye durur.

  Perde küçük değil, tamamen kesintisiz de değil; ne olduğu burada dürüstçe
  yazılsın diye bu paragraf düzeltildi (28 Ağustos 2026). Ekranı bu kadar
  kapatmasının bir nedeni var: harita bulmacalar arasında değişiyor ve
  çocuğun kuşun yeni başlangıcına "ışınlandığını" görmemesi gerekiyor.
  Süresinin ve boyutunun doğru olup olmadığı ayrı bir sorudur ve bu belge
  onu kapatmıyor; ölçüt, ara bulmacanın çocuğa sözsüz bir "başardın"
  vermesidir — bugün bunu yuvanın dolması taşıyor, yazı değil.
- Yıldız durağın tamamına verilir. Ara bulmacalar yıldız vermez; yoksa
  yıldız sayısı ilerleme hissini değil, sabrı ölçer.

### Bugünkü durum: durakların dördü hâlâ tek bulmacalık

İlk yazım şöyle diyordu: *"Mevcut altı durak da bu yapıya taşınır ve her
birine sırayı pekiştiren 2-3 bulmaca eklenir. İki tür durak (tek bulmacalık
ve dizi) bırakmıyoruz: çocuk için tutarsız, kod için iki yol olurdu."*

**Bu, bugün yayında olanı tarif etmiyor.** Faz 4d'nin yapı adımında altı
durağın **ikisine** (Sultansazlığı üç, Kapadokya dört) gerçek birer dizi
verildi; kalan dördü hâlâ tek bulmacalık. Nokta göstergesi tek bulmacalı
durakta hiç çizilmiyor, yani çocuk gerçekten iki tür durak görüyor.

Neden böyle: §10 zaten "4d'nin kendisi büyüktür ve uygulama planında
bölünecektir: önce yapı, sonra içerik" diyor. Yapıyı içeriğin önüne almak
bilinçli ve doğru bir karardı — on bulmaca birden yazmak, yapıyı hiç
oynanmamış içerik üzerinde denemek olurdu. Ama sözün ihlali koda değil **bu
belgeye** yazılır: içerik hazırlama rehberinde
([kodlama-bolumu-hazirlama.md](../kodlama-bolumu-hazirlama.md) §1) yazılı
olması yetmez, çünkü sözü veren belge burasıdır.

**Kodun iki yolu yok:** tek bulmacalık durak, uzunluğu bir olan bir dizidir;
`bulmacalar` dizisi her durakta var, bölüm ekranı tek koddan geçiyor.
Ayrışan tek şey nokta göstergesinin çizilip çizilmediği.

**İki tür ne zaman bire iner:** 4d'nin içerik adımında, kalan dört duraktan
üçü (Tuz Gölü, Pamukkale, Efes) §5'teki dağılıma göre dört bulmacasını
aldığında.

Dördüncüsü, Göksu Deltası, §5'te zaten **tek** bulmacayla duruyor: o durak
kasten tek dokunuşluk bir öğreticidir, kavram öğretmez, mekaniği tanıtır.
Yani "her durak bir dizidir" kuralının bilinçli ve kalıcı bir istisnası var;
ilk yazımdaki "iki tür durak bırakmıyoruz" cümlesi bu haliyle zaten fazla
kesindi. Doğrusu: **öğreten her durak bir dizidir**; rotanın girişindeki tek
adımlık tanıtım durağı bunun dışındadır ve göstergesiz kalır.

## 4. Rota

On beş durak. Sıralama gerçek turna göçünün yıllık döngüsünü izler: kuşlar
güney sahilinden Anadolu'ya girer, doğuda ürer, sonbaharda batıya süzülür ve
Edirne'den Avrupa'ya çıkar.

Bu, haritanın kendisini bir **döngü** yapar — fazın öğrettiği kavramın ta
kendisi.

| # | Durak | İl | Konum | Durum |
|---|---|---|---|---|
| 1 | Göksu Deltası | Mersin | 43, 92 | var |
| 2 | Sultansazlığı | Kayseri | 50, 61 | var |
| 3 | Kapadokya | Nevşehir | 48, 56 | var |
| 4 | Seyfe Gölü | Kırşehir | 45, 47 | yeni |
| 5 | Kızılırmak Deltası | Samsun | 53, 10 | yeni |
| 6 | Kuyucuk Gölü | Kars | 91, 24 | yeni |
| 7 | Erçek Gölü | Van | 91, 56 | yeni |
| 8 | Tuz Gölü | Aksaray | 40, 54 | var |
| 9 | Beyşehir Gölü | Konya | 30, 70 | yeni |
| 10 | Burdur Gölü | Burdur | 23, 70 | yeni |
| 11 | Pamukkale | Denizli | 18, 68 | var |
| 12 | Efes | İzmir | 9, 67 | var |
| 13 | Uluabat Gölü | Bursa | 15, 33 | yeni |
| 14 | Manyas Kuş Cenneti | Balıkesir | 12, 32 | yeni |
| 15 | Gala Gölü, Meriç Deltası | Edirne | 3, 23 | yeni |

Konumlar mevcut altı durağın türetildiği hattan gelir:

```
x = (boylam - 25,56) × 5,06
y = 61 + (38,33 - enlem) × 15,42
```

Bu formül altı mevcut durağın hepsini 1 birim içinde yeniden üretir. Yeni
durakların karada kaldığını `npm run kontrol` zaten nokta-poligon testiyle
denetliyor; Kars ve Edirne uçlarda olduğu için uygulamada ayrıca bakılacak.

**Mevcut durakların sırası değişiyor:** Tuz Gölü dördüncüden sekizinciye,
Pamukkale beşinciden on birinciye kayıyor. İlerleme kaydı durak kimliğine
bağlı olduğu için tamamlanmış duraklar tamamlanmış kalır; yalnızca kilit
sırası değişir. Yoldaki bir çocuk yeni bir durağın açıldığını görür, hiçbir
şeyini kaybetmez.

Yeni durakların hepsi gerçek kuş alanıdır: Seyfe, Kızılırmak Deltası, Kuyucuk,
Uluabat, Manyas ve Gala Ramsar alanıdır; Erçek Gölü flamingoların ürediği
yerdir ve karakter seçimindeki flamingoyu haritaya bağlar.

## 5. Kavram dağılımı

| Durak | Konu | Bulmaca |
|---|---|---|
| 1 Göksu Deltası | mekanik: tek dokunuş | 1 |
| 2 Sultansazlığı | sıra | 3 |
| 3 Kapadokya | sıra, engel | 4 |
| 4 Seyfe Gölü | sıra, başak toplama | 4 |
| 5 Kızılırmak Deltası | **hata ayıklama**: eksik blok | 4 |
| 6 Kuyucuk Gölü | **hata ayıklama**: yanlış sıralı blok | 4 |
| 7 Erçek Gölü | **döngü**: tek bloklu gövde | 4 |
| 8 Tuz Gölü | **döngü**: iki bloklu gövde | 4 |
| 9 Beyşehir Gölü | **döngü**: sayıyı bulma | 4 |
| 10 Burdur Gölü | **döngü** + toplama | 4 |
| 11 Pamukkale | döngü + hata ayıklama karması | 4 |
| 12 Efes | dönüş komutları (ileri, sağa dön) | 4 |
| 13 Uluabat Gölü | dönüş + döngü | 4 |
| 14 Manyas Kuş Cenneti | serbest karma | 5 |
| 15 Gala Gölü | final: uzun yol, Avrupa'ya çıkış | 5 |

Toplam 58 bulmaca.

**Dönüşler seti nihayet kullanılıyor.** Motorda `donusler` komut seti (ileri,
sağa dön, sola dön) 4a'dan beri yazılı ve testli, ama hiçbir durakta
kullanılmıyor — hiçbir çocuk görmedi. Zihinsel döndürme yaklaşık 7 yaşta
oturduğu için rotanın sonuna, 12. durağa konuyor. Çizim mekaniği de dönüş
mantığıyla çalıştığından bu durak 4e'ye doğal bir köprü olur.

## 6. Döngü mekaniği

### Şeritteki hali

Döngü, blokları **içine alan bir kutudur**. Kutunun başında dönüş simgesi ve
kaç kez döneceğini gösteren noktalar durur.

```
┌────────────────────────────────────────────┐
│  ┏━ 🔁 ● ● ● ━━━━━━━━━━━━━━━━┓             │
│  ┃   [ ➡ ]   [ ⬆ ]           ┃    [ ⬅ ]    │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛             │
└────────────────────────────────────────────┘
```

Yukarıdaki program: sağa git ve yukarı git, üç kez; sonra sola git.

- **Noktalara dokunmak sayıyı değiştirir.** 2'den başlar, her dokunuşta artar,
  en fazla 5'ten sonra 2'ye döner. Yazı yok, rakam yok: nokta sayısı sayının
  kendisidir. Bu yaşta rakam tanıma henüz güvenilir değil.
- **Kutuya blok eklemek** için paletteki komuta dokunmak yeterlidir: kutu
  açıkken eklenen blok kutunun içine düşer. Kutu "açık" olma durumunu
  kenarındaki vurgu ile gösterir.
- **Kutunun kendisi de sürüklenir**, içindekilerle birlikte. Kutu içine
  sürüklemek de mümkündür ama tek yol değildir — 4a'daki "dokunma tek başına
  yeterli olmalı" kuralı burada da geçerlidir.
- **İç içe döngü yoktur.** Pre-reader Express de öğretmez. Kutu içine kutu
  bırakılamaz; denendiğinde blok kutunun dışına düşer.

### Motordaki hali

Program düz dizi olmaktan çıkıp iki elemanlı bir birleşim tipine döner.
`kodlama.md` bu değişikliği 4a'da öngörmüştü:

```ts
type Blok =
  | { tur: "komut"; komut: Komut }
  | { tur: "tekrar"; kez: number; govde: { tur: "komut"; komut: Komut }[] };
```

Gövde yalnızca komut tutar; tip iç içe döngüyü **derleme zamanında**
imkânsız kılar, çalışma zamanında kontrol etmeye gerek kalmaz.

`calistir()` düz diziyi yürütmeye devam eder; döngü, gövdeyi `kez` defa
açarak yürür. Dönen `Adim` listesi bugünküyle aynı biçimdedir, yani sahne,
oynatma döngüsü ve yol önizlemesi olduğu gibi çalışır.

Tek gerçek değişiklik `Adim.blokSirasi`: düz dizide bir sayıyken artık bir
**yol** olması gerekir (kaçıncı üst blok, gövdenin kaçıncı bloğu). Şeritte
çalışan bloğu vurgulayan kod bunu kullanır.

### Neden döngü sayısı 2'den başlıyor?

"Bir kez tekrarla" anlamsızdır ve çocuğa döngünün ne işe yaradığını
göstermez. Sıfır ve bir, döngüyü hiç çalıştırmama tuzağıdır; bu yaşta hata
ayıklamanın konusu olmamalı.

## 7. Hata ayıklama mekaniği

Bulmaca **hazır ama bozuk bir programla** açılır. Çocuk çalıştırır, kuşun
duvara çarptığını veya hedefi ıskaladığını görür, ve düzeltir.

İki tür bozukluk yeter:

- **Eksik blok**: program hedefe iki kare kala biter.
- **Yanlış sıra**: bloklar doğru ama ikisinin yeri değişmiş.

Fazla blok üçüncü bir tür olurdu; silme jesti zaten var ve eksik blok ile
aynı beceriyi çalıştırıyor. Almıyoruz.

İçerik tarafında bu, bulmacaya tek bir alan ekler: `hazirProgram`. Alan
varsa şerit boş değil, o programla açılır. Denetim script'i `hazirProgram`
taşıyan bir bulmacanın **olduğu gibi çalıştırıldığında başarısız olmasını**
şart koşar — yoksa "bozuk" program aslında bozuk değildir ve çocuk yalnızca
çalıştır düğmesine basar.

## 8. Faz 4e — çizim (kısa)

code.org'un 8. ve 9. dersleri döngüyü çizime taşır: basit bir diziyi
tekrarlayarak karmaşık bir şekil çıkarmak. Bizim karşılığımız Türk kilim ve
çini motifleridir; bu, portalın kültür çerçevesine döngüden bile daha doğal
oturur.

Bu ikinci bir mekaniktir: yeni sahne, yeni komut seti (ileri, dön, kalem
kaldır), yeni doğrulama (çizilen yol hedef desene yeterince benziyor mu).
Kendi tasarım belgesini hak eder ve bu belge onaylandıktan sonra yazılır.

Not: doğrulamanın "yeterince benziyor mu" olması kritiktir. Piksel eşitliği
arayan bir kontrol bu yaşta yalnızca hüsran üretir.

## 9. Faz 4f — olaylar (kısa)

Play Lab'in karşılığı: bir sahne, bir iki karakter, ve "şuna dokununca şu
olsun" kuralları. Kavram olay güdümlü programlamadır — çocuk artık ne zaman
çalışacağını kendi belirlemediği bir program yazar.

**Paylaşım yok.** code.org bu dersi "oyununu bir link ile paylaş" ile
bitirir. Biz bitiremeyiz: portalın veri toplama yasağı mutlaktır, hiçbir şey
cihazdan çıkmaz. Bizim karşılığımız "yap ve oyna"da biter, ve ebeveyne
bunun neden böyle olduğu tek cümleyle anlatılır.

Bu, karşılık haritasındaki tek bilinçli eksiktir.

## 10. Fazlar

| Faz | Kapsam | Neden bu sırada |
|---|---|---|
| 4d | Durak = bulmaca dizisi yapısı, on beş duraklık rota, hata ayıklama, döngü, dönüş komutları | Yapı değişikliği içeriğin önüne geçmeli; döngü zaten en çok beklenen kavram |
| 4e | Çizim mekaniği ve desen durakları | Döngüyü gerektirir |
| 4f | Olaylar | Bağımsız; en son çünkü en az öğretici, en çok serbest oyun |

4d'nin kendisi büyüktür ve uygulama planında bölünecektir: önce yapı
(dizi durak, ilerleme kaydı, harita), sonra döngü motoru, sonra döngü
arayüzü, sonra içerik.

## 11. Yapmayacaklarımız

- **İç içe döngü.** Pre-reader Express öğretmiyor; bu yaşta kutu içinde kutu
  görsel olarak da çözülmez.
- **Koşul (eğer/ise).** code.org bunu bir sonraki kursta (Course B/C)
  öğretiyor. Bizim ikinci yaş grubu kursumuzun konusu olur.
- **Değişken, fonksiyon.** Aynı gerekçe, daha ileri.
- **Oyun paylaşımı.** Yukarıda; ilkeye aykırı.
- **Blockly'ye geçmek.** Döngü geldiğinde model ağaca dönüyor ama iki elemanlı
  ve tek seviyeli bir ağaç; `kodlama.md`'deki gerekçe aynen geçerli.

## 12. Bu belgenin ölçütü

Kodlama bölümü, aşağıdakilerin hepsi doğru olduğunda "code.org karşılığı
tamamlandı" sayılır:

1. Çocuk sıra, hata ayıklama, döngü, dönüş, çizimde döngü ve olay
   kavramlarının her birini en az bir durakta çalışmış olur
2. Hiçbir kavram için çocuğa yazı okutulmaz
3. On beş durağın hepsi gerçek bir Türkiye kuş alanıdır ve ipucu o yere dairdir
4. `npm run kontrol` her bulmacanın çözülebilirliğini ve her bozuk programın
   gerçekten bozuk olduğunu doğrular
5. Hiçbir veri cihazdan çıkmaz
