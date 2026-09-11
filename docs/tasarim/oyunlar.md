# Tasarım Belgesi — Oyunlar Bölümü (Faz 3)

Küçük yaş grubuna uygun, **tek oturumda bitebilen** basit oyunlar. Diğer
bölümlerden farkı: burada öğretilen bir konu yok. Boyama beceri, Harfler ve
Sayılar bilgi, Kodlama kavram öğretir; Oyunlar bölümü **oynanır**.

## 1. Neden bu bölüm var

Portalın diğer üç bölümü de bir şey öğretir ve çocuğun dikkatini
sürdürmesini bekler. Bir çocuk her zaman öğrenmek istemez. Bu bölüm o an
içindir: kısa, kazanması kolay, baştan sona iki dakika.

Bu, bölümün ölçütünü de belirler — **hiçbir oyun iki dakikadan uzun
sürmemeli** ve hiçbiri kaybetmeyle bitmemeli.

## 2. Temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Kaybetme | Yok | Süre, can, puan yok; oyun ancak kazanılarak biter |
| Kayıt | En iyi skor yok | Kendiyle yarışmak bu yaşta baskıdır; kayıt yalnızca "kaç kez oynadım" bile değil, hiç yok |
| Zorluk | Tek seviye, boy büyür | Seviye seçtirmek okuma ister; kart sayısı turdan tura artar |
| İçerik | Emoji ve çizim | Boyama bölümündeki gibi lisans derdi olmayan görseller |

**Neden hiç kayıt yok:** diğer bölümlerde yıldız var çünkü orada ilerleme
bir şeyin öğrenildiğini gösterir. Burada ilerleyecek bir şey yok; kayıt
tutmak oyunu ödeve çevirirdi.

## 3. Oyunlar

### Hafıza (yayında)

Kartlar ters durur; çocuk ikisini açar. Aynıysa açık kalır, değilse kısa
bir bekleyişten sonra kapanır. Bütün çiftler bulununca tur biter ve bir
sonraki tur **iki kart daha** ile açılır (4 → 6 → 8 → 10 → 12).

Kart sayısı on ikide durur: daha fazlası küçük ekranda dokunma hedefini
düşürür ve turu iki dakikanın üstüne çıkarır.

Yanlış çiftin kapanması için beklenen süre **kısa ama sabittir** (900 ms):
daha kısası kartı görmeye vakit bırakmaz, daha uzunu çocuğu bekletir.

### Gölge (yayında)

Üstte bir nesne, altta dört gölge; çocuk nesnenin gölgesini bulur.

**Gölge ayrı bir görsel değildir**: aynı simge, rengi tamamen alınmış
haliyle çizilir (`filter: brightness(0)`). Böylece oyun yeni bir varlık
dosyası gerektirmez ve gölge ile nesne birbirinden asla sapamaz.

Simgeler birbirinden **ayırt edilebilir** seçilir: gölge yalnızca dış hattı
gösterdiği için birbirine benzeyen iki hayvan (kedi/köpek) gölge halinde
ayırt edilemezdi.

### Sırala (yayında)

Üç nesne, küçükten büyüğe dizilecek. Çocuk en küçüğe dokunur, sonra
ortancaya, sonra en büyüğe; sırası gelmeyen nesneye dokunmak yalnızca
salınım üretir.

**Üçünün de simgesi aynıdır**, yalnızca boyları farklıdır. Farklı nesneler
olsaydı çocuk "gerçekte hangisi büyük" (fil mi kelebek mi) diye başka bir
soruya düşerdi; burada sorulan tek şey ekrandaki büyüklük.

Boy farkı **dokunma hedefini küçültmez**: en küçük nesnenin simgesi küçük
ama kutusu diğerleriyle aynı en az ölçüde (88 piksel).

### Sonraki oyunlar

Bölüm bu üç oyunla kendi ölçütünü karşılıyor. Yeni oyun eklenirse aynı
ilkelere tabidir: kaybetme yok, kayıt yok, iki dakika.

## 4. Mimari

Diğer bölümlerle aynı desen: oyun mantığı React'tan bağımsız ve testli
(`lib/oyunlar/`), bileşen yalnızca oynatır (`components/oyunlar/`).

Kart dizilimi **rastgele değil, tur numarasından türetilir**: sunucuda
üretilen HTML ile tarayıcıdaki ilk çizim aynı olmalı (aksi halde hidrasyon
uyuşmazlığı olur) ve test gerçek dizilimi ölçebilmeli. Aynı gerekçe Say ve
Bul oyunlarında da geçerlidir.
