# Tasarım Belgesi — Kodlama Bölümü

**Tarih:** 19 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Durum:** Onaylandı, uygulama fazlara bölündü

## 1. Amaç

Çocuğun komutları doğru sırada dizerek bir sonuca ulaşması. Portalın
dördüncü ana bölümü, yol haritasındaki Faz 4.

İlham kaynağı code.org'un 4-7 yaş kursları (Course A / Pre-reader Express).
Aradaki fark yalnızca dil değil: oradaki kuşlar, domuzlar ve zombiler yerine
Turna ve Türkiye coğrafyası; oradaki sürükle-bırak ağırlıklı arayüz yerine
dokunmayla çalışan, küçük parmaklara göre ölçülmüş bir arayüz.

Hedef kitle portalın geri kalanıyla aynı: 4-8 yaş, tablet ve dokunmatik
öncelikli, okuma henüz öğrenilmiyor olabilir.

## 2. Temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Mekanik | Labirent: Turna'yı hedefe götür | Sıra kavramını öğretir, doğrulaması kesin |
| Blok kurma | Dokunmayla ekle **ve** sürükleyerek sırala | Bu yaşta sürükleme tek yol olamaz |
| Hareket | Önce mutlak yön, sonraki bölümlerde dönüşlü | Zihinsel döndürme yaklaşık 7 yaşta oturur |
| Kavram | İlk fazda yalnızca sıra (sequence) | Döngü iç içe blok arayüzü ister, ayrı iş |
| Çerçeve | Turna'nın göç yolu, Türkiye haritasında duraklar | İlerleme göstergesi ile coğrafya aynı şey olur |
| Motor | Kendi kodumuz, SVG sahne | Aşağıdaki "Neden Blockly değil" |
| Adres | `/kodla/` | Kısa, Türkçe, karaktersiz, `/ogren/` ile aynı kip |
| Kayıt | Yalnızca localStorage | Portalın veri toplamama ilkesi |

### Neden Blockly değil?

code.org'un blok motoru Google'ın Blockly kütüphanesidir. Kullanmadık:

- Kendi DOM'unu imperatif yönetir, React'in dışında yaşar.
- Yaklaşık 1,5 MB'lık bir kütüphane ve kendi medya klasörünü ister; "her şey
  depoda barınır" ilkesini ağırlaştırır.
- Dokunma davranışı ve blok boyutları bizim en az 64 piksel hedef kuralımıza
  uymuyor. Küçük çocukta takılmanın kaynağı çoğunlukla tam olarak burasıdır.
- Sıra tabanlı bir programda blok modeli **düz bir dizidir**. Blockly'nin
  çözdüğü problem (rastgele iç içe geçmiş ifade ağaçları) bizde yok.

Faz 4d'de döngü geldiğinde model ağaca dönecek, ama o ağaç da iki elemanlı
bir birleşim tipidir (`Komut = Adim | Tekrar`); dışarıdan motor almayı hâlâ
gerektirmez.

### Neden SVG sahne?

Boyama bölümü zaten SVG üzerine kurulu: aynı `viewBox` mantığı, aynı ekran
koordinatı → SVG koordinatı çevirisi, aynı test yaklaşımı yeniden kullanılır.
CSS grid ile `<div>` kareler daha hızlı yazılırdı ama projede iki ayrı çizim
dünyası doğardı; uçuş yolu çizgisi, ölçekleme ve en boy oranı elle çözülürdü.

## 3. Yaş grubu katmanı

Bölüm üç seviyelidir: **kurs (yaş grubu) → bölüm → adım.**

İlk kurs 4-7 yaş içindir, ama sonraki yaş grupları sonradan eklenen bir yama
olmamalı. Bu yüzden kurs katmanı adreslerde, içerik dosyalarında ve kayıt
biçiminde bugünden vardır.

```
/kodla/                       yaş grubu seçimi
/kodla/turna-yolu/            o kursun bölüm haritası
/kodla/turna-yolu/kapadokya/  bölüm ekranı
```

`/kodla/` ekranında bugün tek etkin kart vardır (Turna'nın Yolu, 4-7 yaş);
sonraki yaş grupları `/ogren/` sayfasındaki gibi "Yakında" olarak durur.

### Mekanik kavramı

Her bölüm hangi mekanikle oynandığını verisinde yazar (`"mekanik": "labirent"`).
Bugün tek mekanik vardır. İleride bir yaş grubu farklı bir mekanik isterse
(örneğin desen çizme) `lib/kodla/sanat/` açılır; kurs seçimi, program
düzenleme, ilerleme kaydı ve sayfa iskeleti olduğu gibi kalır.

Bugün **yapılmayacak** şey: mekanik kayıt defteri veya eklenti mimarisi. Tek
elemanlı bir registry spekülasyondur. İkinci mekanik geldiğinde bölüm
sayfasında bir `switch` olur.

## 4. Mimari

### Klasör düzeni

```
app/kodla/
  page.tsx                       yaş grubu seçimi
  [kursId]/page.tsx              göç haritası
  [kursId]/[bolumId]/page.tsx    bölüm ekranı

content/kodla/
  kurslar.json                   kurs listesi
  turna-yolu.json                4-7 kursunun bölümleri

lib/kodla/
  kurslar.ts                     kurs kataloğu ve doğrulaması
  bolumler.ts                    bölüm verisini okuyup doğrulayan katman
  program.ts                     ekle / sil / tasi / temizle
  ilerleme.ts                    kurs bazlı ilerleme (localStorage)
  labirent/
    komutlar.ts                  komut tipleri, iki komut seti
    harita.ts                    metin ızgarasını haritaya çevirir
    calistir.ts                  program + harita → adım listesi
    cozucu.ts                    en kısa çözüm (yalnızca denetimde kullanılır)
    temalar.ts                   zemin ve engel çizimleri
  karakterler.ts                 kurs başına kuş kataloğu ve paletleri

components/kodla/
  KursKartlari.tsx
  labirent/
    GocHaritasi.tsx              Türkiye haritası, duraklar ve karakter madalyonu
    KarakterKartlari.tsx         "Kiminle uçalım?" seçim ekranı
    BolumEkrani.tsx              bölümü birleştiren kabuk
    Sahne.tsx                    kareli harita, karakter, başaklar
    ProgramSeridi.tsx            bloklar, sürükle-sırala, silme
    KomutPaleti.tsx              dokunulunca blok ekleyen düğmeler
    Simgeler.tsx                 karakter, yuva ve başak SVG bileşenleri (paleti dışarıdan alır)
    komutGorunumu.ts             komutun ikonu ve okunabilir adı (palet ve şerit ortak kaynağı)
  kodla.css

public/kodla/                    Türkiye silueti (turkiye.svg)
```

Boyama ve Harfler-Sayılar bölümlerindeki kritik kural burada da geçerlidir:
**`lib/kodla/` React bilmez, tarayıcı bilmez.** Bileşenler yalnızca bu
fonksiyonları çağırır.

### Statik export

`[kursId]/[bolumId]` rotası `generateStaticParams` ile içerik dosyalarından
üretilir ve `dynamicParams = false` taşır — boyama ekranındaki kalıbın aynısı.
Sunucu, API ve veritabanı yoktur.

### Neden içerik `content/` altında JSON?

Boyama kataloğuyla aynı desen: yeni bölüm eklemek kod yazmak değil, veri
yazmak olsun. `npm run kontrol` bu dosyaları denetler, böylece içerik katkısı
kod bilgisi gerektirmez.

## 5. Veri modeli

```ts
type Kurs = {
  id: string;        // "turna-yolu"
  ad: string;        // "Turna'nin Yolu"
  yas: string;       // "4-7"
  ikon: string;      // kart ikonu
  durum: "yayinda" | "yakinda";
};

type Bolum = {
  id: string;                            // "kapadokya"
  ad: string;                            // "Kapadokya"
  mekanik: "labirent";
  komutSeti: "yonler" | "donusler";
  tema: string;                          // zemin ve engel cizimini secer
  durak: { x: number; y: number };       // Turkiye haritasinda yuzde konum
  idealAdim: number;                     // en kisa cozumun uzunlugu
  ipucu: string;                         // ebeveyne tek cumle
  harita: {
    bakis: "yukari" | "asagi" | "sol" | "sag";   // karakterin baslangic yonu
    satirlar: string[];
  };
};

type Komut =
  | { tur: "git"; yon: "yukari" | "asagi" | "sol" | "sag" }  // "yonler" seti
  | { tur: "ileri" }                                          // "donusler" seti
  | { tur: "don"; yon: "sol" | "sag" };
```

### Harita neden metin satırları?

Okunabilirlik ilkesinin doğrudan uygulaması: bölüm ekleyen kişi haritayı
gözüyle görür.

```json
{
  "id": "sultansazligi",
  "ad": "Sultansazligi",
  "mekanik": "labirent",
  "komutSeti": "yonler",
  "tema": "sazlik",
  "durak": { "x": 46, "y": 58 },
  "idealAdim": 5,
  "ipucu": "Sultansazligi Kayseri'de sazliklar ve gollerden olusan bir kus cennetidir.",
  "harita": {
    "bakis": "sag",
    "satirlar": [
      ".....",
      ".T.oH",
      "..#.."
    ]
  }
}
```

| İşaret | Anlamı |
|---|---|
| `.` | boş kare |
| `#` | engel |
| `T` | karakterin başlangıç karesi (her haritada tam bir tane) |
| `H` | yuva, hedef (her haritada tam bir tane) |
| `o` | toplanacak başak (sıfır veya daha fazla) |

`ipucu` **yere dairdir, kuşa değil.** Örnekteki cümlenin Sultansazlığı'nı
anlatıp turnadan hiç söz etmemesi bilinçlidir: aynı duraktan çocuğun
seçtiği her kuş geçer, kuşa özgü bir gerçek çocukların yarısı için yanlış
olur. Kuş bilgisi karakter kartında durur — bkz.
[kodlama-karakter.md](kodlama-karakter.md) §7.

`bakis` yalnızca `donusler` komut setinde anlamlıdır; orada karakterin
başlangıçta hangi yöne baktığını verir. `yonler` setinde karakter yürüdüğü
yöne döner ama bu bir komut değil, yalnızca animasyondur.

`tema` alanı engelin ve zeminin neye benzeyeceğini seçer: Sultansazlığı'nda
sazlık, Kapadokya'da peribacası, Ağrı'da kaya. Aynı motor, farklı görsel.
Durak konumdan, tema görselden sorumludur; ikisi ayrı alan olduğu için
planlanan (bkz. §8) on beş bölüm yedi takım çizimle karşılanabilir —
bugün yayında olan altı bölüm de aynı yedi takımın bir alt kümesini
kullanır.

## 6. Çalıştırma motoru

`calistir.ts` saf bir fonksiyondur. Animasyon değil **veri** döndürür:

```ts
calistir(program: Komut[], harita: Harita): Sonuc

type Adim = {
  karakter: { x: number; y: number; bakis: Yon };
  olay: "yurudu" | "dondu" | "carpti" | "topladi" | "vardi";
};

type Sonuc = {
  adimlar: Adim[];
  basarili: boolean;
};
```

Bileşen bu listeyi sırayla oynatır. Böylece "Turna duvara çarptı mı, hedefe
vardı mı, kaç adımda vardı" sorularının tamamı tarayıcı açmadan test edilir.

### Çarpma cezalandırılmaz

Turna engele veya harita dışına giderse o komut **etkisizdir**: yerinde küçük
bir sallanma olur ve program bir sonraki bloktan devam eder. Çalıştırma yarıda
kesilmez, "yanlış" ekranı çıkmaz, kırmızı renk ve ünlem kullanılmaz.

Bu, Harfler ve Sayılar bölümündeki "yanlış cevap cezalandırılmaz" kuralının
aynısıdır ve bu tasarımın da merkezindeki karardır.

### Başarı ölçütü

Haritadaki bütün başaklar toplandı **ve** yuvaya varıldı.

### Peki çocuk yirmi tane ⬆ ekleyip geçemez mi?

Geçer. Bu yaşta bu meşru bir keşif yoludur ve engellenmeyecektir. Ödül ise
oraya bağlanmaz: bölüm `idealAdim` kadar veya daha az blokla bitirilirse
**altın yıldız**, aksi halde normal yıldız kazanılır. Ceza yok, hedef var.

code.org aynı sorunu "blok sınırı" ile çözüyor; sınır koymak takılma üretir,
ödül üretmez.

### Program uzunluğu

En fazla 20 blok. Sebep arayüzdür: şerit ekrana sığmalı, ekranda kaydırma
olmamalıdır. Şerit doldukça bloklar önce küçülür (esnek genişlik, asgari
34 piksel), yetmediğinde alt satıra sarar — tek satırda sıkıştırıp okunmaz
hale getirmek yerine. Sarma da kaydırma sayılmaz: `.bolumEkrani` dikey
alanı sabit kalır, şerit büyüdükçe sahne alanı küçülür, sayfanın kendisi
kaymaz. Bölüm verisi bu sınırı düşürebilir.

## 7. Arayüz

```
┌──────────────────────────────────────────────┐
│  ← Duraklar            Sultansazlığı          │
├──────────────────────────────────────────────┤
│                                              │
│        SAHNE  (SVG, kareli harita)           │
│                                              │
├──────────────────────────────────────────────┤
│  PROGRAM   [⬆][➡][➡]▸[⬆][ ]        ↩  🗑    │
├──────────────────────────────────────────────┤
│  [ ⬆ ]  [ ⬇ ]  [ ⬅ ]  [ ➡ ]      ▶ ÇALIŞTIR │
└──────────────────────────────────────────────┘
```

Sahne kalan alanı kaplar ve `viewBox` ile ölçeklenir. Program şeridi yataydır:
bloklar soldan sağa dizilen bir tren, Turna da o sırayla yürür. Yatay olması
hem yatay hem dikey tablet yerleşimini kurtarır.

### Blok ekleme ve düzenleme

- **Dokun, eklenir.** Paletteki komut düğmesine dokunmak bloğu şeridin sonuna
  ekler. Tek jest, ıskalanmaz.
- **Sürükle, sıralanır.** Şeritteki bir bloğu tutup yanındakinin üstüne
  getirmek yerlerini değiştirir; boşluk kayarak açılır.
- **Dışarı at, silinir.** Sürüklenen blok şeridin dışına çıkınca altında çöp
  kutusu belirir; bırakılırsa blok solup gider.
- **↩** son bloğu siler, **🗑** hepsini temizler.

Onay penceresi yoktur. Hem `alert`/`confirm` bu projede yasaktır, hem de bu
yaşta onay kutusu anlamsızdır; yanlışlıkla temizlenirse blokları tekrar dizmek
zaten oyunun kendisidir.

Dokunma ile sürüklemeyi ayırma kuralı: parmak 10 pikselden az hareket ettiyse
dokunma, fazlaysa sürükleme sayılır. Süreye bakılmaz — çocuklar parmağını uzun
tutar.

### Çalışırken o anki blok vurgulanır

Turna bir kare yürürken şeritte çalışan blok büyür ve renklenir. Bölümün en
önemli öğretici anı burasıdır: çocuk "bu kutu şu hareketi yaptırdı" bağını
burada kurar. Adım hızı yaklaşık 450 ms; çalışma sırasında palet ve şerit
kilitlenir.

### Bölüm bitince

Turna yuvaya konar ve ekranın ortasında yıldızı (veya altın yıldızı) gösteren
bir kutlama katmanı belirir, tek bir büyük **Sonraki durak** düğmesiyle.
Katman `role="status"` taşır ve herhangi bir yere dokunmak onu kapatıp
Turna'yı başa alır; kalmak isteyen tekrar deneyebilir.

### Arayüz kuralları

Boyama bölümünden gelen kurallar burada da geçerlidir, biri sıkılaştırılmıştır:

- Dokunma hedefleri en az **64 piksel** (portal geneli 56'dır; bu bölümde
  hedefler çok daha sık kullanılıyor).
- Ekranda kaydırma yok.
- Metin asgari: başlık dışında çocuğa yazı gösterilmez, her düğme ikon taşır.
  Düğmeler gerçek `<button>` elemanlarıdır ve `aria-label` alır.
- Bölüm altında ebeveyn için tek satırlık gri ipucu durur. O metin çocuğa
  değil, yanındaki büyüğe yazılmıştır.

## 8. İçerik: Turna'nın göç yolu

> **Not (20 Ağustos 2026):** Aşağıdaki on beş duraklık tablo rotanın
> NİHAİ HEDEFİDİR, bugünün durumu değil. Faz 4b itibarıyla yayında olan
> rota yalnızca **altı** duraktır — bu tablodaki ilk beşi (Sultansazlığı,
> Kapadokya, Tuz Gölü, Pamukkale, Efes) ve başlarına eklenen tek adımlık
> öğretici durak Göksu Deltası'nı (bkz.
> [kodlama-arayuz.md](kodlama-arayuz.md) §7) kapsar. Kalan dokuz durak
> (Salda Gölü'nden itibaren) sonraki fazlarda (4c, 4d) eklenir; güncel
> durum için [yol haritası](../yol-haritasi.md)'na bakın.

Göç haritası ekranında Türkiye silueti ve üstünde duraklar bulunur.
Tamamlanan duraklar arasında kesik çizgi bir uçuş yolu çizilir; çocuk
ilerledikçe Turna'nın yolu haritada belirir. Durak konumları bölüm
verisindeki yüzde koordinatlarla konur, harita ölçeğinden bağımsızdır.

| # | Durak | Komut seti | Tema |
|---|---|---|---|
| 1 | Sultansazlığı | yonler | sazlık |
| 2 | Kapadokya | yonler | peribacası |
| 3 | Tuz Gölü | yonler | beyaz |
| 4 | Pamukkale | yonler | beyaz |
| 5 | Efes | yonler | antik taş |
| 6 | Salda Gölü | yonler | beyaz |
| 7 | Uluabat Kuş Cenneti | yonler | su |
| 8 | İstanbul Boğazı | yonler | su |
| 9 | Kızılırmak Deltası | yonler | sazlık |
| 10 | Sümela | donusler | kaya |
| 11 | Ayder Yaylası | donusler | çayır |
| 12 | Nemrut | donusler | antik taş |
| 13 | Van Gölü | donusler | su |
| 14 | Ağrı Dağı | donusler | beyaz |
| 15 | Muş Ovası (yuva) | donusler | çayır |

Rota güneybatıdan kuzeydoğuya, gerçek turna göçünü izleyerek yuvaya varır.

Yedi tema kullanılır: `sazlik`, `peribacasi`, `beyaz`, `antiktas`, `su`,
`kaya`, `cayir`. `beyaz` teması tuz, traverten, beyaz kum ve karı birlikte
karşılar; aralarındaki fark zemin renginin tonundadır. Rota tamamlanınca
(bkz. yukarıdaki not) on beş bölüm böylece yedi takım çizimle karşılanmış
olacak; bugün yayında olan altı bölüm zaten bu yedi takımın bir alt
kümesini kullanıyor.

### Zorluk eğrisi

| Duraklar | Ne değişir |
|---|---|
| 1-3 | Kısa yol, tek dönüş, başak yok |
| 4-6 | Tek başak |
| 7-9 | İki başak, engeller |
| 10-12 | Dönüşlü komut setine alışma; haritalar kasten kolay |
| 13-15 | Çok başak, uzun yol |

Bölüm 10'da komut seti dönüşlüye geçer. Kavram yeni olduğu için o bölümlerin
labirentleri basittir: aynı anda iki zorluk verilmez.

### Kilit kuralı

Sıradaki durak açıktır, sonrası kilitlidir; tamamlanan her durak tekrar
oynanabilir.

Bir bölümde beş kez çalıştırıp geçemeyen çocuğa sonraki durak **sessizce**
açılır. Uyarı, mesaj ve "atla" düğmesi yoktur. Kimse bir bölümde mahsur
kalmamalıdır; bu, başarısızlık hissinden kaçınma kararının devamıdır.

### Kültür bağı ebeveyn üzerinden kurulur

Her durakta ebeveyne tek cümle vardır ("Sultansazlığı Kayseri'de sazlıklar
ve göllerden oluşan bir kuş cennetidir"). Çocuğa metin gösterilmez; kültür,
yanındaki büyüğün anlatacağı şeydir.

Bu cümle **yere dairdir, kuşa değil.** Karakter seçimi geldiğinden beri aynı
duraktan turna da flamingo da geçiyor; kuşa özgü bir gerçek, o kuşu
seçmeyen çocuk için yanlış olurdu. Kuş bilgileri
`content/kodla/karakterler.json` içindeki `bilgi` alanında, seçim ekranında
durur — bkz. [kodlama-karakter.md](kodlama-karakter.md) §7.

Bu yaklaşım Harfler ve Sayılar bölümündeki "sesi ebeveyn söyler" kararıyla
aynı çizgidedir.

### Görseller

Karakter, yuva ve başak sahnenin kendi SVG'si içinde yaşayan React bileşenleridir
(`components/kodla/labirent/Simgeler.tsx`); tema zeminleri ve engel çizimleri
`lib/kodla/labirent/temalar.ts` içinde veri olarak durur. Ayrı dosya olmamalarının
nedeni: sahnenin `<svg>`i içinde ek dosya isteği doğurmazlar ve renklerini
temadan alırlar.

Türkiye silueti kamu malı bir kaynaktan (Natural Earth) sadeleştirilerek
üretilir ve `public/kodla/turkiye.svg` altında durur; lisans kaydı
`content/kodla/LISANSLAR.md` içindedir. Bütün görseller depoda barınır;
çalışma anında hiçbir harici istek yapılmaz.

## 9. Kayıt biçimi

```ts
type Ilerleme = Record<string, Record<string, "yildiz" | "altin">>;
// { "turna-yolu": { "sultansazligi": "altin", "kapadokya": "yildiz" } }
```

localStorage anahtarı: `kodla:ilerleme`.

Deneme sayacı ayrı anahtarda durur (`kodla:denemeler`), çünkü kalıcı bir
başarı kaydı değil, kilit açma kuralının geçici sayacıdır.

Kayıt kurs bazlıdır; yeni bir yaş grubu eklemek eski kaydı bozmaz. Bu kayıt
yalnızca cihazın tarayıcı hafızasındadır ve hiçbir yere gönderilmez.

## 10. Test

| Katman | Araç | Neyi doğrular |
|---|---|---|
| Motor | Vitest | Yürüme, dönme, çarpmanın etkisizliği, başak toplama, başarı ölçütü |
| Program | Vitest | Ekle, sil, tasi, temizle; 20 blok sınırı |
| Kayıt | Vitest | Kurs bazlı ilerleme, kilit açılması, beş deneme kuralı |
| İçerik | `npm run kontrol` | Bölüm verisi geçerli mi ve çözülebilir mi |
| Arayüz | Playwright | Bölüm oynanıyor, sürükle-sırala, kaydırma yok, kayıt kalıcı |

### Çözücü denetimi

`npm run kontrol` her bölümü genişlik öncelikli aramayla (BFS) çözer ve şunu
doğrular: bölümün bir çözümü **vardır** ve `idealAdim` gerçekten en kısa
çözümün uzunluğudur.

Bu, boyama bölümündeki "her resmin her bölgesi boyanabiliyor mu" denetiminin
karşılığıdır: çözülemeyen ya da yanlış `idealAdim` taşıyan bir bölüm depoya
giremez. Çözücü yalnızca denetimde çalışır, siteye girmez.

Ayrıca harita bütünlüğü denetlenir: bütün satırlar eşit uzunlukta mı, tam bir
`T` ve tam bir `H` var mı, durak yüzdeleri 0-100 aralığında mı, temanın
çizimleri `public/kodla/` altında mevcut mu.

### Uçtan uca

`e2e/kodla.spec.ts` her bölümü, denetim script'inin bulduğu çözümle oynayıp
yıldızın verildiğini doğrular. `e2e/tum-resimler.spec.ts` kalıbının aynısıdır:
yeni bir bölüm eklendiğinde test onu otomatik kapsar.

> **Not (19 Ağustos 2026, 20 Ağustos 2026'da düzeltildi):** Bu belgenin 7.
> bölümündeki arayüz tasarımı ve 11. bölümündeki 4b-4d fazları
> [kodlama-arayuz.md](kodlama-arayuz.md) ile değiştirilmiştir. Motor ve
> veri modeli bölümleri geçerliliğini korur. 8. bölümdeki (İçerik) on beş
> duraklık rota tablosu ise bugünün durumu değil, ilerideki fazlar için
> bir HEDEFTİR (bkz. o bölümün başındaki not) — Faz 4b'de yayında olan
> rota **altı** duraktır. İlk yazım burada "göç yolu, ilk durağın tek
> adımlık öğretici bölüme ayrılmasıyla on altı durağa çıkar" diyordu; bu
> yanlıştı, çünkü henüz gerçekleşmemiş on beş duraklık hedefe "+1"
> uyguluyordu (bkz. [kodlama-arayuz.md](kodlama-arayuz.md) §7'deki
> düzeltme).

## 11. Fazlar

| Faz | Kapsam | Gerekçe |
|---|---|---|
| 4a | Kurs katmanı, göç haritası, labirent motoru, dokunarak blok ekleme, mutlak yönler, ilk beş durak, yıldız ve altın yıldız | Mekanik uçtan uca kanıtlanır ve yayınlanabilir. Faz 2a'daki "önce yalnızca rakamlar" kararının aynısı |
| 4b | Sürükleyerek sıralama ve dışarı atarak silme, duraklar 6-9 | Sürükleme en riskli arayüz işidir; motor çalıştıktan sonra tek başına ele alınır |
| 4c | Dönüşlü komut seti, duraklar 10-15, beş deneme kuralı | İkinci kavram ve içeriğin tamamlanması |
| 4d | İkinci yaş grubu kursu: döngü bloğu, iç içe blok arayüzü | Kendi tasarım belgesini hak eder; altyapı bugün buna hazır bırakılıyor |

## 12. Faz 4a tamamlanma ölçütleri

1. Ana sayfadaki "Kodlama" kartı etkin ve `/kodla/` yaş grubu kartlarını
   gösteriyor
2. `/kodla/turna-yolu/` göç haritasını, tamamlanan ve kilitli durakları
   gösteriyor
3. İlk beş durak dokunarak blok ekleyip çalıştırarak bitirilebiliyor
4. Çalışırken o anki blok vurgulanıyor; çarpma programı kesmiyor
5. Yıldız ve altın yıldız kazanılıyor, tarayıcıda saklanıyor ve sonraki durak
   açılıyor
6. Ekranda kaydırma yok, dokunma hedefleri en az 64 piksel
7. Birim testleri, çözücü denetimi ve uçtan uca testler geçiyor
