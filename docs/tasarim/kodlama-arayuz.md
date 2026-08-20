# Tasarım Belgesi — Kodlama Bölümü Arayüzü

**Tarih:** 19 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Durum:** Onaylandı, uygulama fazlara bölündü
**Önceki belge:** [kodlama.md](kodlama.md) — bölümün motoru ve içeriği

## 1. Amaç

Kodlama bölümünün oyun ekranını yeniden tasarlamak.

Faz 4a çalışan bir motor teslim etti: program, harita, çalıştırma, yıldız,
denetim, göç haritası. Teslim etmediği şey **arayüz kalitesiydi**. Ölçüt
açık: hedef, code.org'un aynı yaş grubuna sunduğu
[Pre-reader Express](https://studio.code.org/courses/pre-express-2025/units/1)
kursundan belirgin biçimde daha iyi bir deneyim.

## 2. Neden yeniden tasarım

Faz 4a sonunda ekranda olanın dürüst tespiti:

- **Hiçbir şey hareket etmiyor.** Turna 450 ms'de bir kareden diğerine
  ışınlanıyor; yürümüyor, kanat çırpmıyor. Bu, "eski tarayıcılarda SVG
  transform güvenilmez" gerekçesiyle bilinçli seçilmişti. Gerekçe yanlıştı:
  SVG üzerinde CSS transform 2016'dan beri her yerde çalışıyor.
- **Dokunma geri bildirimi yok.** Düğmeye basmak ile basmamak arasında
  ekranda hiçbir fark yok.
- **Program ile sonuç ayrı yerlerde.** Çocuk komutu altta kuruyor, sonucu
  üstte izliyor. Bu yaşta en zor kurulan bağ tam da ikisi arasındaki bağ.
- **Kutlama zayıf.** Bir kutu, bir emoji, bir satır yazı.
- **İlk temas yok.** Okuma bilmeyen çocuk ne yapacağını nereden bileceğini
  bilmiyor.
- **İkonlar emoji.** Her cihazda başka görünüyor.

Ayrıca kapsam olarak Pre-reader Express'in yalnızca ilk dersine denk
geliyoruz: sıralama var, **döngü yok**, ikinci mekanik yok.

## 3. Temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Program nerede görünür | Hem haritada (yol) hem çubukta (yapı) | İkisi iki ayrı soruyu cevaplar |
| Yön düğmeleri | Artı düzeni (D-pad) | Yön, ikondan değil konumdan okunur |
| Döngü yazımı | Üç aşamalı: hazır kucak → katlama önerisi → serbest | Sürükleyip içine bırakma bu yaşta çalışmıyor |
| Hareket | SVG üzerinde CSS geçişi ve keyframe | En az kod, GPU'da, tek yerde tanımlı |
| İlk temas | Sessiz demo, metin yok | Hedef kitle okumuyor |
| Görseller | Karma: karakter dışarıdan, gerisi kodla | Çocuğun bağlandığı tek şey karakter |
| Kapsam hedefi | Pre-reader Express'in tamamı | Aşağıdaki fazlar |

### Neden harita ve çubuk birlikte?

Yol önizlemesi tek başına yeterli görünüyordu ve ilk tercih o yöndeydi.
Döngü hedefe girince yetmediği ortaya çıktı: oklar "hangi kareye gidiyorum"u
anlatır, "şu üç adımı dört kez tekrarla"yı anlatamaz. Döngüyü **yazmak** için
programın yapısını gösteren bir yüzey gerekiyor.

Bu yüzden ikisi birlikte duruyor ve farklı sorulara bakıyorlar:

- **Harita — "ne olacak?"** Yol her zaman **açılmış** halde çizilir. Döngü
  varsa tekrarların hepsi görünür.
- **Çubuk — "nasıl yazdım?"** Komutların sırası ve döngü kucakları.

Ayrım kasıtlıdır ve öğretici anın kendisidir: haritada altı ok varken çubukta
üç kutu görünür. Çocuk "az yazdım, çok iş yaptım"ı gözüyle görür.

```
┌─────────────────────────────────────┐
│  ·    ·    ·    ·    ·    ·    ·    │
│  🕊 → ⇢    ⇢    ⇢    ⇢    ⇢   🪺    │   harita: yol acilmis halde
│  ·    ·    ·    ·    ·    ·    ·    │
└─────────────────────────────────────┘

  ┌─ 🔁 3 ─────┐
  │  ➡    ➡   │  ⬆              cubuk: yapi
  └───────────┘
```

### Neden D-pad?

Tek sıra halinde dizilmiş dört ok, çocuğun her birinin ikonunu çözmesini
gerektirir. Artı düzeninde yön, düğmenin bulunduğu yerden anlaşılır.
Mekânsal eşleme, bu yaşta simge çözmeden önce gelir.

## 4. Yol önizlemesi

Çocuk her blok eklediğinde haritada Turna'nın gideceği kareye soluk bir ok
belirir. Program çalıştırılmadan önce yolun tamamı görünür.

Bunun maliyeti sıfırdır çünkü `calistir()` saf bir fonksiyondur: program ve
harita alır, adım listesi döndürür, animasyon bilmez. Önizleme, aynı
fonksiyonun aynı girdiyle çalıştırılıp sonucunun farklı biçimde çizilmesidir.
Yeni motor kodu yazılmaz.

Çarpmalar da önizlemede görünür: duvara giden ok kısa kesilir ve toz
bulutuyla durur. Çocuk hatasını **çalıştırmadan** görebilir. Kırmızı yoktur,
uyarı yoktur; yalnızca yol oraya varmıyordur.

## 5. Döngü nasıl yazılır

Sürükleyip bir kucağın içine bırakmak bu yaş grubunda çalışmaz. Bunun yerine
üç aşama, her biri bir öncekinin üstüne biner.

### Aşama 1 — Kucak hazır gelir

Bölüm, ekranda dolu sayılı ama boş bir kucakla açılır: `🔁 4 [ ___ ]`.
Çocuk komuta dokunur, komut kucağın içine düşer. "İçine koymak" diye ayrı
bir jest yoktur; kucak tek yer olduğu için içerisi kendiliğinden oluşur.

Öğrenilen tek şey: *buraya bir şey koyarsam dört kez oluyor.*

### Aşama 2 — Katlama önerisi

Çocuk `➡ ➡ ➡` yazdığında çubuğun altında usulca bir öneri belirir:
`🔁 3 ➡ ?`

Dokunursa üç kutu tek kucağa katlanır ve **harita hiç değişmez** — yaptığı
iş aynıdır, yazdığı kısalmıştır. Dokunmazsa hiçbir şey olmaz, bölüm normal
biter.

Burada öğrenilen şey döngünün ne olduğu değil, **ne işe yaradığıdır**; ve
çocuk bunu kendi yazdığı tekrar üzerinden öğrenir.

### Aşama 3 — Serbest

Kucak baştan boş gelir, tekrar sayısı ➕➖ ile ayarlanır, çocuk istediğini
içine koyar.

### Döngüyü gerektiren bölümler

Faz 4a'da blok sınırı reddedilmişti ("sınır koymak takılma üretir"). Döngü
bölümlerinde bu karar gevşetilir: çubuk belirli sayıda kutu alır (örneğin
dört) ve hedef on iki adım uzaktadır. Düz yazarak çözülemez.

Ceza yoktur, uyarı yoktur — yalnızca yer yoktur. Çocuk sıkışınca katlama
önerisi devreye girer.

## 6. Hareket ve geri bildirim

Bütün hareket CSS'te tanımlıdır; süreler tek dosyada durur.

### Turna

| Olay | Hareket |
|---|---|
| Yürüme | Kareler arası 380 ms `ease-in-out` geçiş |
| Yürürken | Kanat çırpma keyframe döngüsü, hareket bitince durur |
| Kareye iniş | Hafif ezilme-yaylanma |
| Beklerken | Çok yavaş alçalıp yükselme (nefes) |
| Dönme | Anında (bkz. not) |

Ezilme-yaylanma tek başına karakteri "sürüklenen resim" olmaktan çıkarıp
"yürüyen kuş" yapan detaydır.

**Düzeltme (19 Ağustos 2026):** Bu satır ilk yazımda "Geçişli, ani değil"
diyordu; bu, §8'deki varlık sözleşmesiyle çelişiyordu. Sol bakış, ayrı bir
çizim yerine SAĞ pozun `scale(-1 1)` ile AYNALANMASIYLA elde ediliyor
(bkz. §8, ve `Simgeler.tsx`'teki `YON_DONUSUMU`); bir aynalama CSS
`transition` ile ara karelere bölünüp yumuşatılamaz (ara değerler
anlamsız, yamuk bir kuş üretir), yalnızca anında uygulanabilir. Uygulama
§8'i izleyerek doğru olanı yaptı; bu satır onu yansıtacak şekilde
düzeltildi. Turna'nın yürüdüğü yöne dönmesi zaten bir komut değil, o
karedeki pozun (yön ve adım) doğrudan seçilmesidir — dönen ayrı bir
varlık değil, aynalanmış/döndürülmüş aynı Turna'dır.

### Diğer olaylar

- **Çarpma:** Turna duvara doğru %40 gidip geri gelir, temas noktasında toz
  bulutu. Kırmızı yok, ünlem yok.
- **Başak toplama:** başak büyüyüp saydamlaşarak süzülür, yerinde parıltı.
- **Varış:** Turna yuvaya konar, yuva bir kez yaylanır, kanatlar açılır.
- **Kutlama:** SVG konfeti (kütüphane yok), yıldız büyüyüp göç haritasına
  doğru uçar. Altın yıldızda konfeti yoğun ve yıldız döner; iki başarı tipi
  hissedilir biçimde farklıdır.

### Dokunma geri bildirimi

- Düğmeye basınca 80 ms'de %94'e küçülme, gölge kaybolur.
- Komut eklendiğinde kutu düğmeden çubuğa uçar; aynı anda haritadaki ok
  kendini çizer. Her dokunuş iki yerde birden karşılık bulur.
- Kutu silinince küçülüp kaybolur, yol kısalır.

### Çalışırken

Çalışan kutu büyür ve renklenir. Buna ek olarak haritada o adımın oku dolu
hale gelir, arkada kalanlar soluk kalır — "neredeyim" sorusu haritadan da
okunur.

### Kurallar

- `prefers-reduced-motion` açıksa bütün geçişler anında olur, konfeti çıkmaz.
- **Adım süresi sabittir.** Uzun programda hızlandırmak caziptir ama
  yapılmaz: blok ile hareket arasındaki bağı kuran şey ritmin
  öngörülebilirliğidir.

## 7. Sözsüz ilk temas

Hedef kitle okumuyor. Yönerge metni yazmak çözüm değildir; göstermek çözümdür.

- **İlk girişte sessiz demo:** hayalet bir parmak bir yön düğmesine dokunur,
  haritada ok çizilir, ▶'ye dokunur, Turna bir kare yürür. Her şey başa
  döner ve kontrol çocuğa geçer. Yaklaşık altı saniye, tek kelime yok.
  **Hangi yön?** İlk yazımda burada sabit olarak ➡ yazıyordu; bu yanlıştı
  (bkz. "Demo, öğretici duraktaki tek komutu neden bitirmiyor" altında).
  Demo, Turna'yı GÖRÜLEBİLİR şekilde yürüten ama bölümü BİTİRMEYEN bir yön
  seçer; öğretici durakta bu, hedefe giden yön DEĞİLDİR.
- **Takılırsa tekrar:** 12 saniye hareketsizlikte demo sessizce bir daha
  oynar. Uyarı değil, hatırlatma.
- **Yardım eden nabız atar:** program boşken D-pad, doluyken ▶ hafifçe nabız
  atar. Sıradaki adım her zaman gözle bulunur.
- **Yuva çağırır:** hedef karesi çok yavaş bir parıltıyla nefes alır.

### İlk durak feda edilir

Mevcut ilk durak üç adımlıktır; öğretici bir bölüm için bu bile fazladır.
İlk durak **tek adıma** iner: yeni bir öğretici durak (Göksu Deltası)
baştan eklenir, Turna'yı bir tek yön komutuyla yuvaya götürür. Mevcut üç
adımlık bölüm (Sultansazlığı) ikinci sıraya kayar. Çocuğun ilk deneyimi
"başardım" olmalıdır, "denedim" değil.

Bu, o an yayında olan durak sayısını bire çıkarır (beşten altıya, Faz 4a'nın
ilk beş durağının başına eklenerek).

**Düzeltme (19 Ağustos 2026):** Bu bölümün ilk yazımı "mevcut üç adımlık
bölüm ikinci sıraya kayar; göç yolu on altı durak olur" diyordu. Bu
yanlıştı ve yanlışlığın kaynağı bu belgedir, uygulama değil:
[kodlama.md](kodlama.md) §8'deki on beş duraklık tablo henüz
gerçekleşmemiş bir NİHAİ HEDEFTİR (bkz. o belgedeki not); "+1" hesabı bu
henüz-var-olmayan sayıya uygulanmış, o hedefin bugünün durumu olmadığı
gözden kaçırılmıştı. Doğrusu: Faz 4b'de yayında olan rota **altı**
duraktır.

### Demo, öğretici duraktaki tek komutu neden bitirmiyor

§ boyunca "hayalet bir parmak ➡'ye dokunur ... Turna bir kare yürür" diye
anlatılan demo, ilk yazımda kelimenin tam anlamıyla ➡ tuşuna basıyordu.
Ama Göksu Deltası'nda Turna sağa bakarak başlar ve yuva tam bir kare
sağındadır (bkz. `goksu-deltasi` haritası: `.T H` aynı satırda, `bakis:
"sag"`); bölümün tek adımlık çözümü tam olarak `git:sag`'dır. Demo ➡'ye
(yani `git:sag`'a) dokunsaydı, kendisi Turna'yı yuvaya ulaştırıp bölümü
çocuk adına bitirirdi — bu da bu maddenin kendi hedefiyle ("çocuğun ilk
deneyimi 'başardım' olmalı, kendisi hiç dokunmadan değil") doğrudan
çelişirdi.

Uygulama bunu doğru çözdü: `BolumEkrani.tsx`'teki `demoKomutuSec()`,
komut setindeki her komutu tek başına deneyip Turna'yı GÖRÜLEBİLİR şekilde
yürüten ama bölümü BİTİRMEYEN ilkini seçer (Göksu Deltası'nda bu, ➡ değil,
yürüyüp boş bir kareye giden başka bir yön olur). Böyle bir komut yoksa
demo hiç gösterilmez. Bu belge o davranışı anlatacak şekilde
düzeltilmiştir; yukarıdaki "İlk girişte sessiz demo" maddesi belirli bir
tuşu (➡) değil, bu seçim kuralını tarif eder.

## 8. Varlık sözleşmesi

Karakter ve ana çizimler dışarıdan gelir. Sistem bu sözleşmeye göre kurulur;
dosyalar geldiğinde yerlerine takılır, kod değişmez.

| Varlık | Adet | Not |
|---|---|---|
| Turna, 4 yön × 2 poz (duruş + adım) | 8 | Yürüme döngüsü iki pozun değişmesiyle oluşur |
| Turna, çarpma pozu | 1 | Şaşkın, geri çekilmiş |
| Turna, kutlama pozu | 1 | Kanatlar açık |
| Yuva | 1-2 | Boş ve dolu hali olursa daha iyi |
| Başak | 1 | |
| Tema engelleri | 7 | sazlık, peribacası, beyaz, antik taş, su, kaya, çayır |

**Format şartları:**

- SVG, dosya başına tek poz
- `viewBox="0 0 100 100"`
- Gömülü raster yok, harici font yok
- Düz renkler tercih edilir; çizgi kalınlıkları kendi içinde tutarlı
- Her dosyanın kaynağı ve lisansı `content/kodla/LISANSLAR.md` içine işlenir

Varlıklar gelene kadar geliştirme durmaz: yer tutucu çizimlerle ilerlenir ve
sözleşmeye uyan dosyalar geldiğinde değiştirilir.

## 9. Faz 4a'dan ne kalıyor, ne gidiyor

**Kalıyor (bölümün beyni):**

- `lib/kodla/` tamamı: komutlar, harita, `calistir`, çözücü, temalar,
  program işlemleri, ilerleme kaydı
- `content/kodla/` içeriği ve `scripts/kontrol.ts` denetimi
- Göç haritası ekranı ve kurs katmanı
- Yıldız, altın yıldız, kilit kuralı, deneme sayacı

**Yeniden yazılıyor (bölümün yüzü):**

- `components/kodla/labirent/BolumEkrani.tsx`
- `components/kodla/labirent/Sahne.tsx`
- `components/kodla/labirent/ProgramSeridi.tsx` → yerine kucak destekli çubuk
- `components/kodla/labirent/KomutPaleti.tsx` → D-pad
- `components/kodla/kodla.css` oyun ekranı bölümü
- Şerit seçicilerine bakan uçtan uca testler

## 10. Test stratejisi

Faz 4a'nın üç katmanı korunur; arayüz katmanına iki yeni doğrulama eklenir.

| Katman | Araç | Neyi doğrular |
|---|---|---|
| Motor ve veri | Vitest | Değişmedi |
| İçerik | `npm run kontrol` | Değişmedi; döngü bölümleri için kucak doğrulaması eklenir |
| Arayüz | Playwright | Her bölüm oynanabiliyor, kaydırma yok, hedefler 64 piksel |
| Önizleme | Playwright | Çizilen yol, `calistir()` sonucuyla birebir aynı |
| Hareket | Playwright | `prefers-reduced-motion` açıkken geçiş yok |

Önizleme testi önemlidir: yol önizlemesi ile gerçek çalıştırma aynı
fonksiyondan üretildiği için, ikisinin ayrışması bir hata olur ve test bunu
yakalar.

## 11. Fazlar

Yol haritasındaki 4b-4d bu belgeyle değişir.

| Faz | Kapsam |
|---|---|
| 4b | Arayüz ve hareket katmanı: yol önizlemesi, D-pad, animasyon, dokunma geri bildirimi, sessiz demo, tek adımlık ilk durak. Durum: tamamlandı (altı durak yayında). |
| 4c | Döngü: üç aşamalı öğretim, kucak arayüzü, döngü durakları. Rota bu ve sonraki fazlarda genişler; [kodlama.md](kodlama.md) §8'deki on beş duraklık tablo bu genişlemenin **hedefidir**, bugünün durumu değil. |
| 4d | Ses katmanı |
| 4e | İkinci mekanik: desen çizme (Türk kilim ve çini motifleri) |

Sanat entegrasyonu ayrı bir faz değildir; varlıklar geldikçe sürekli yapılır.

## 12. Faz 4b tamamlanma ölçütleri

**Durum: Faz 4b tamamlandı** (19 Ağustos 2026). Aşağıdaki on madde tek tek,
kod okunarak ve `npm run lint && npm run test && npm run kontrol && npm run e2e`
çalıştırılarak doğrulandı. Doğrulama yöntemi her maddenin yanında.

1. [x] Program eklendikçe haritada yol önizlemesi çiziliyor ve `calistir()`
   sonucuyla birebir uyuşuyor — `lib/kodla/labirent/onizleme.ts` doğrudan
   `calistir()`'in adım listesini biçimlendirir, ayrı bir kural yoktur;
   `e2e/kodla.spec.ts`'teki "haritadaki yol, calistir sonucuyla ayni sayida
   parca cizer" testi haritada çizilen ok/çarpma sayısını `onizlemeYolu()`
   çıktısıyla birebir karşılaştırır.
2. [x] Yön düğmeleri artı düzeninde ve en az 64 piksel —
   `e2e/kodla.spec.ts`'teki "yon dugmeleri arti duzeninde" testi yukarı/aşağı
   aynı sütunda, sol/sağ aynı satırda olduğunu; "kaydirma yok ve dokunma
   hedefleri en az 64 piksel" testi dört ekran boyutunda tüm düğmelerin
   `min(genişlik, yükseklik) >= 64` olduğunu doğruluyor.
3. [x] Turna kareler arası yumuşak geçişle yürüyor, kanat/bacak pozu
   değişiyor, inişte yaylanıyor, beklerken nefes alıyor — `BolumEkrani.tsx`
   her adımda pozu `"adim"` ile `"durus"` arasında değiştirir (yürüme
   döngüsü), `Simgeler.tsx` bu iki poz için farklı kanat/bacak yolu çizer;
   `kodla.css`'teki `.kodlaTurna` geçişi `--kodla-adim-suresi` (380ms) ile,
   `.kodlaTurna.poz-adim` inişte `kodlaYaylan` ezilme-yaylanmasıyla,
   `.kodlaTurna.bekliyor.poz-durus` `kodlaNefes` ile canlanıyor.
   `prefers-reduced-motion` testi bu geçiş ve animasyonların normal modda var
   olduğunu (kapalı modda `0s`/`none` olduklarını göstererek) dolaylı
   doğruluyor.
4. [x] Çarpma yerinde geri tepme ve toz bulutu olarak görünüyor; program
   kesilmiyor — `Sahne.tsx` poz `"carpma"` iken toz bulutu render eder,
   `kodla.css`'teki `kodlaCarp`/`kodlaTozDagil` bunu canlandırır;
   `lib/kodla/labirent/calistir.ts` çarpan komutu `continue` ile atlar,
   döngü durmaz (bu davranış Faz 4a'dan devralınan, dokunulmayan koddur).
5. [x] Düğmelere basınca görsel karşılık var; eklenen kutu çubuğa uçarak
   giriyor — `kodla.css`'teki `:active` kuralı basılan düğmeyi 80ms'de
   %94'e küçültüyor; `ProgramSeridi.tsx` yeni eklenen kutuya `.yeni` sınıfı
   veriyor, `kodlaKutuGel` keyframe'i onu küçük/saydam/aşağıda başlatıp
   büyüterek/belirerek yerine oturtuyor.
6. [x] Kutlamada konfeti var; altın yıldız normal yıldızdan hissedilir
   farkta — `Konfeti.tsx` altın kutlamada 42, normalde 22 parçacık
   üretiyor (`yogun` prop'u); `.kodlaKutlamaYildiz.altin` ayrıca
   `kodlaYildizDon` ile 900ms boyunca dönüp büyüyor, normal yıldız
   dönmüyor.
7. [x] İlk girişte sessiz demo oynuyor; 12 saniye hareketsizlikte tekrar
   ediyor — `e2e/kodla-demo.spec.ts` ilk girişte demonun kendiliğinden
   devreye girip bir blok eklediğini, palet ve çalıştır düğmesinin demo
   boyunca kilitli kaldığını ve koşu bitince tahtanın sıfırlandığını
   doğruluyor; `e2e/kodla.spec.ts`'teki "cocuk uzun sure dokunmazsa demo
   yalnizca ilk durakta tekrar oynar" testi 12 saniyelik `BOSTA_SURESI`
   sonrası tekrarı ve bunun yalnızca ilk durakta olduğunu doğruluyor.
8. [x] İlk durak tek adımlık — `turna-yolu.json`'daki ilk durak
   (`goksu-deltasi`) `idealAdim: 1` taşıyor ve bu, `npm run kontrol`
   tarafından çözücüyle denetleniyor.
   - [x] **Düzeltildi (20 Ağustos 2026).** Bu maddede önceden "göç yolu on
     altı durak olur" yazıyordu ve bu, o zamanki denetimde "doğrulanamadı
     ve gerçeğe uymuyor" olarak işaretlenmişti. Kaynağı bulundu: §7'deki
     "İlk durak feda edilir" bölümü, [kodlama.md](kodlama.md) §8'deki on
     beş duraklık HEDEF tabloya "+1" uyguluyordu; o tablo henüz
     gerçekleşmemiş bir hedef olduğu için hesap yanlıştı. §7 artık
     düzeltildi ve gerçek sayıyı (altı) veriyor;
     `content/kodla/turna-yolu.json` hâlâ **altı** durak taşıyor
     (`goksu-deltasi`, `sultansazligi`, `kapadokya`, `tuz-golu`,
     `pamukkale`, `efes`), README ve [yol haritası](../yol-haritasi.md) ile
     tutarlı.
9. [x] `prefers-reduced-motion` açıkken hiçbir geçiş ve konfeti yok —
   `e2e/kodla.spec.ts`'teki ilgili test `reducedMotion: "reduce"`
   bağlamında Turna'nın geçiş süresinin `0s`, animasyonunun `none`
   olduğunu doğruluyor; `kodla.css`'teki ilgili tüm `@media
   (prefers-reduced-motion: reduce)` blokları (yol oku, program kutusu,
   konfeti/yıldız/düğme, hayalet parmak/nabız) kod okunarak tek tek
   kontrol edildi. Not: dosyanın en sonundaki blok, aynı özgüllükte
   erken kurallarla çakıştığı için CSS'te kasıtlı olarak son sırada
   tutuluyor (dosya içindeki yorum bunu açıklıyor) — bu, bu daldaki
   dört kez tekrarlanan bir hatanın düzeltmesidir.
10. [x] Birim testleri, çözücü denetimi ve uçtan uca testler geçiyor —
    bu görev kapsamında çalıştırıldı: `npm run lint` temiz, `npm run test`
    154/154, `npm run kontrol` 41 boyama sayfası ve 6 kodlama bölümünü
    onayladı, `npm run e2e` 91/91.
