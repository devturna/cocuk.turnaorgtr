# Faz 1 Tasarım Belgesi — Boyama Bölümü

**Tarih:** 7 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Depo:** https://github.com/devturna/cocuk.turnaorgtr (herkese açık)
**Durum:** Onaylandı

## 1. Amaç

cocuk.turna.org.tr, çocukların ücretsiz ve reklamsız oyun oynayabildiği, ebeveynleriyle
birlikte basit kodlama öğrenebildiği bir portal olacak. Portal faz faz geliştirilecek.

Bu belge yalnızca **Faz 1'i** kapsıyor: çevrimiçi boyama bölümü.

Projenin açık kaynak olması bir yan özellik değil, temel bir gereklilik. Çocuğunun
vakit geçirdiği sitenin kodunu okumak isteyen bir ebeveyn, deponun tamamını açıp
ne olup bittiğini anlayabilmeli. Bu yüzden basitlik ve okunabilirlik, her teknik
kararda en az işlevsellik kadar ağırlık taşıyor.

## 2. Kapsam

### Faz 1'e dahil olanlar

- Portal ana sayfası (bölüm kartları)
- Kategorili boyama galerisi
- Boyama ekranı: kova (tıkla-doldur), fırça, silgi, geri al, baştan başla
- Çizimlerin tarayıcıda otomatik kaydedilmesi
- Türkçe dokümantasyon ve eksiksiz lisans kaydı
- GitHub Pages'e otomatik yayınlama

### Faz 1'e dahil OLMAYANLAR (bilinçli karar)

İndirme ve yazdırma, ses efektleri, çok dillilik, oyunlar bölümü, kodlama bölümü,
kullanıcı hesapları, sunucu tarafı kayıt.

## 3. Temel kararlar

| Konu | Karar |
|---|---|
| Yayınlama | Statik dosyalar, GitHub Actions ile GitHub Pages'e otomatik deploy |
| Teknoloji | Next.js (App Router) + `output: 'export'`, TypeScript |
| Boyama motoru | Saf SVG (aşağıda gerekçesi) |
| İsimlendirme | Türkçe isimler ve Türkçe yorumlar, Türkçe karakter kullanılmadan |
| Dil | Yalnızca Türkçe |
| Veri toplama | Hiç. Analitik yok, çerez yok, hesap yok, form yok |
| Kayıt | Yalnızca localStorage; hiçbir veri cihazdan çıkmaz |
| Hedef kitle | 4-8 yaş, tablet ve dokunmatik öncelikli |
| Görsel kaynağı | Açık lisanslı (CC0/CC-BY) arşivler, her biri kaynağıyla kayıtlı |
| Lisans | Kod MIT; görseller kendi lisanslarıyla ayrıca kayıtlı |

### Boyama motoru neden saf SVG?

Değerlendirilen üç seçenek:

- **Saf SVG (seçilen):** Çizgi resimler SVG. Her kapalı bölge bir `<path>`; dokunulduğunda
  `fill` niteliği değişir. Serbest fırça da SVG'ye eklenen bir `<path>`. Tek model,
  tek geri-al yığını, her ölçekte keskin görüntü. Doldurma işlemi tek satırlık bir
  koda iniyor, bu da kodu öğretici düzeyde okunabilir kılıyor.
- **Saf Canvas:** PNG çizgi resim üzerinde taşma-doldurma (flood fill) algoritması.
  Fırça daha akıcı olurdu, ancak algoritmayı elde yazmak gerekiyor ve yumuşatılmış
  çizgi kenarlarında renk sızıntısı yapıyor. Kod belirgin biçimde zor okunur.
- **Hibrit (SVG + üstte canvas):** İki ayrı geri-al sistemi ve koordinat eşleme
  yükü getiriyor. En karmaşık seçenek.

Bilinen ödünleşme: çok sayıda fırça vuruşunda DOM büyür. Hedef yaş grubunun kullanım
yoğunluğunda sorun beklenmiyor; sorun çıkarsa vuruş sadeleştirme eklenebilir.

## 4. Mimari

### Klasör düzeni

```
app/
  layout.tsx                 ortak çerçeve (üst bar, alt bilgi)
  page.tsx                   portal ana sayfası
  boyama/
    page.tsx                 kategoriler ve resim galerisi
    [resimId]/page.tsx       boyama ekranı
components/
  boyama/
    Tuval.tsx                SVG tuval, dokunma olaylarını yönetir
    RenkPaleti.tsx           renk seçimi
    AracCubugu.tsx           kova / fırça / silgi / geri al / baştan başla
lib/
  boyama/
    durum.ts                 çizim durumu ve geri al (saf fonksiyonlar)
    yerelKayit.ts            localStorage okuma ve yazma
content/
  boyama-katalogu.json       resim kataloğu
public/
  boyama/*.svg               hazırlanmış çizgi resimler
  boyama/LISANSLAR.md        lisans özeti
docs/                        Türkçe dokümantasyon
scripts/
  kontrol.ts                 SVG ve katalog denetimi
```

### Katmanlama ilkesi

Boyama mantığının tamamı `lib/boyama/durum.ts` içinde, React'tan bağımsız saf
fonksiyonlar olarak yaşar. Bileşenler yalnızca bu mantığı ekrana bağlar.

Bunun iki nedeni var: mantık React bilmeden okunabilir ve tarayıcı olmadan test
edilebilir hale gelir. Bu, React seçimine rağmen "ebeveyn kodu okuyabilsin" hedefini
korumanın yolu.

### Veri modeli

Bir resmin boyama durumu:

```ts
type BoyamaDurumu = {
  dolgular: Record<string, string>          // path kimliği -> renk
  fircaCizgileri: FircaCizgisi[]
}

type FircaCizgisi = {
  d: string        // SVG path verisi
  renk: string
  kalinlik: number
}
```

Geri al, bu iki koleksiyona uygulanan işlemlerin yığını olarak tutulur.

Katalog girdisi:

```ts
type KatalogGirdisi = {
  id: string
  ad: string
  kategori: string
  dosya: string
  lisans: string
  kaynak: string
  kaynakUrl: string
}
```

localStorage anahtarı: `boyama:<resimId>`.

## 5. Arayüz ve etkileşim

**Ana sayfa.** Üç büyük kart: Boyama (aktif), Oyunlar (yakında), Kodlama (yakında).
Okuma bilmeyen çocuk için her kartta büyük ikon ve tek kelime.

**Galeri (`/boyama`).** Kategori sekmeleri (Hayvanlar, Araçlar, Doğa, Şekiller) ve
resimlerin küçük önizlemeleri. Yarım kalmış resimlerin köşesinde devam ediyor işareti.

**Boyama ekranı (`/boyama/[resimId]`).** Ekranın çoğunu SVG tuval kaplar. Altta
16 renklik büyük yuvarlak buton paleti, yanında araç çubuğu.

| Araç | Davranış |
|---|---|
| Kova | Bölgeye dokunulduğunda seçili renkle dolar |
| Fırça | Parmakla serbest çizgi, üç kalınlık seçeneği |
| Silgi | Dokunulan fırça çizgisini tümüyle siler; dolguya dokunulursa bölge boyanmamış haline döner |
| Geri Al | Son işlemi iptal eder |
| Temizle | Onay sorar, sonra tuvali temizler |

Erişilebilirlik kuralları: tüm dokunma hedefleri en az 56 piksel; boyama sırasında
sayfa kaydırması `touch-action: none` ile engellenir; renk butonlarında rengin adı
da yazar (renk körlüğü ve okuma öğrenimi için).

## 6. Görsel içerik ve lisans

Çizgi resimler CC0 veya CC-BY lisanslı arşivlerden toplanacak.

**Bilinen risk:** Bu arşivlerdeki SVG'lerin çoğu tıkla-doldur için hazır değil;
bölgeler kapalı doldurulabilir alanlar yerine yalnızca çizgilerden oluşuyor.

Karşı önlem: her SVG elde bir hazırlama adımından geçer ve doldurulabilir bölgeler
`class="boyanabilir"` ile işaretlenir. Bu adım `docs/boyama-sayfasi-hazirlama.md`
belgesinde anlatılır.

**Denetim.** `npm run kontrol` script'i şunları doğrular:

- Her SVG'de en az bir `class="boyanabilir"` bölge var mı
- Katalogdaki her girdinin lisans, kaynak ve kaynakUrl alanları dolu mu
- Katalogdaki her dosya diskte gerçekten var mı, diskteki her dosya katalogda mı

Bu script sürekli entegrasyonda da çalışır, böylece kaynağı belirsiz hiçbir görsel
depoya giremez.

Lisans yapısı: kod MIT (`LICENSE`), görseller kendi lisanslarıyla katalog içinde
girdi bazında ve `public/boyama/LISANSLAR.md` özetinde kayıtlı.

## 7. Test

**Birim testleri (Vitest), test-önce yazılır.** `lib/boyama/durum.ts` kapsamı:
bölge doldurma, fırça çizgisi ekleme, silme, geri alma, kaydetme ve yükleme.

**Duman testi (Playwright), tek senaryo.** Galeriden resim aç, bir bölgeyi boya,
geri al, sayfayı yenile ve çizimin korunduğunu doğrula.

**Denetim script'i.** `npm run kontrol`, yukarıda anlatıldığı gibi.

Üçü de sürekli entegrasyonda deploy öncesi çalışır.

## 8. Dokümantasyon

Depo herkese açık olduğu için dokümantasyon birinci sınıf iş kabul edilir.

| Dosya | İçerik |
|---|---|
| `README.md` | Proje amacı, kurulum, yol haritası |
| `docs/ebeveynler-icin.md` | Hiçbir veri toplanmadığının açıklaması ve bunun nasıl doğrulanacağı |
| `docs/gelistirici-rehberi.md` | Mimari ve klasör anlatımı |
| `docs/boyama-sayfasi-hazirlama.md` | Yeni boyama sayfası ekleme adımları |
| `docs/yol-haritasi.md` | Fazlar ve ilerleme |
| `CONTRIBUTING.md` | Katkı kuralları |
| `LICENSE` | MIT |

## 9. Faz 1 tamamlanma ölçütleri

1. cocuk.turna.org.tr yayında, `main` dalına her push otomatik deploy ediyor
2. Dört kategoride en az on iki hazırlanmış boyama sayfası
3. Kova, fırça, silgi, geri al ve baştan başla araçları tablette çalışıyor
4. Yarım kalan çizim tarayıcıda saklanıyor ve sayfa yenilendiğinde geri geliyor
5. Yukarıdaki yedi doküman yazılmış, her görselin lisansı kayıtlı
6. Birim testleri, duman testi ve denetim script'i sürekli entegrasyonda geçiyor
