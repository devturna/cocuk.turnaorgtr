# Kodlama Bölümü Hazırlama

Yeni bir durak eklemek kod yazmayı gerektirmez; `content/kodla/<kurs>.json`
dosyasına bir girdi eklemek yeterlidir. Bir durak, ortak bir yer (Sultansazlığı,
Kapadokya...) etrafında dizilmiş **bir bulmaca dizisidir** — tek bir harita
değil.

## 1. Bir durak kaç bulmaca tutar?

Üç ile altı arası. Bir durak bir konuyu öğretir; o konuyu üç bulmacadan az
anlatmak pekiştirmez, altıdan fazlası aynı yerde sıkar.

Bulmacalar **kolaydan zora** dizilir. İlk bulmaca konuyu tek başına gösterir,
sonrakiler üstüne bir şey ekler. Çocuk durağın ortasında bırakırsa kaldığı
bulmacadan devam eder.

Altın yıldız durağın **tamamı** ideal adımda çözüldüğünde verilir. Tek bir
bulmacada fazla blok kullanmak altını kaçırır; bu bilinçlidir, yoksa altın
yıldız durak uzadıkça kolaylaşırdı.

Bu kural yeni içerik içindir. Bugün yayında olan altı duraktan dördü
(Göksu Deltası, Tuz Gölü, Pamukkale, Efes) hâlâ **tek** bulmaca taşıyor —
bu bir hata değil, bilinçli bir ara durumdur: bu duraklar sonraki fazda
yeni konular (döngü, dönüş komutları) alacak ve o zaman 3-6 bulmacaya
çıkacaklar. Yeni bir durak eklerken örnek aldığın yer bu dördü değil,
**Sultansazlığı** (3 bulmaca) veya **Kapadokya** (4 bulmaca) olmalı.

## 2. Girdiyi yaz

```json
{
  "id": "van-golu",
  "ad": "Van Gölü",
  "mekanik": "labirent",
  "tema": "su",
  "durak": { "x": 82, "y": 47 },
  "ipucu": "Van Gölü Türkiye'nin en büyük gölüdür.",
  "bulmacalar": [
    {
      "komutSeti": "yonler",
      "idealAdim": 1,
      "harita": {
        "bakis": "sag",
        "satirlar": ["...", ".TH", "..."]
      }
    },
    {
      "komutSeti": "yonler",
      "idealAdim": 2,
      "harita": {
        "bakis": "sag",
        "satirlar": ["....", ".T.H", "...."]
      }
    },
    {
      "komutSeti": "yonler",
      "idealAdim": 5,
      "harita": {
        "bakis": "sag",
        "satirlar": ["...H", "....", "T..."]
      }
    }
  ]
}
```

Üçüncü bulmaca ilk ikisinin üstüne bir şey ekler: artık tek yönde değil, hem
yukarı hem sağa gitmek gerekiyor. Bu, §1'deki "kolaydan zora" kuralının
somut hâlidir.

`id`, `ad`, `mekanik`, `tema`, `durak`, `ipucu` **durak seviyesindedir** — o
duraktaki bütün bulmacalar için tek bir kez yazılır. `komutSeti`,
`idealAdim`, `harita` ise **bulmaca seviyesindedir** — dizideki her bulmaca
kendi haritasını, kendi komut setini ve kendi ideal adım sayısını taşır.

## 3. Harita işaretleri

| İşaret | Anlamı |
|---|---|
| `.` | boş kare |
| `#` | engel |
| `T` | Turna'nın başlangıcı (tam bir tane) |
| `H` | yuva, hedef (tam bir tane) |
| `o` | toplanacak başak (istediğin kadar) |

Bütün satırlar aynı uzunlukta olmalı. Bu tablo dizideki **her** bulmacanın
kendi `harita` alanı için geçerlidir.

## 4. Alanlar

### Durak seviyesinde (bir kez yazılır)

- `id`, `ad`, `ipucu`: boş bırakılamayan metin alanları.
- `mekanik`: bugün yalnızca `"labirent"` var.
- `tema`: `lib/kodla/labirent/temalar.ts` içinde tanımlı olmalı. Yeni bir
  tema eklemek istiyorsan oraya zemin rengi ve engel çizimi ekle.
- `durak`: Türkiye haritasındaki yüzde konum (sol üst köşe 0,0; `x` ve `y`
  0-100 arasında olmalı). Bu, durağın gerçek konumunun `public/kodla/turkiye.svg`
  siluetiyle **aynı projeksiyon hattından** geçirilmiş halidir (bkz. commit
  `b942064`). **Yerleşim için taşınmaz.** Bu sayı bir çocuğun kendi
  coğrafyasını öğrendiği tek referans; Kapadokya'yı Erzurum'un yanına
  koymak, iki 64 piksellik işaretin görsel olarak çakışmasından çok daha
  büyük bir hatadır.

  Bilinen kısıt: harita ince olduğu için (yaklaşık 1000×422) gerçekten
  yakın duraklar (ör. Sultansazlığı ve Kapadokya, ikisi de Orta Anadolu'da,
  aralarında ~100 km var) küçük ekranda görsel olarak üst üste düşebilir.
  Bu, koordinatı değil, etkileşim katmanını ilgilendiren bir sorundur ve
  şöyle çözülür: kilitli bir durak `.gocDuragi.kilitli { pointer-events:
  none }` sayesinde asla dokunmayı yutmaz, açık/tamamlanmış duraklar
  arasında da `GocHaritasi.tsx` her durağa açıkça bir `z-index` verir. Faz
  4a'da aynı anda yalnızca tek durak açık olduğu için bu her zaman
  yeterlidir. İlerideki fazlarda durak sayısı arttıkça (nihai hedef için
  bkz. [kodlama.md](tasarim/kodlama.md) §8) ve aynı bölgede birden fazla
  durak açılabilir hale gelince muhtemelen **kılavuz çizgi** (leader line)
  gerekecek: işaret gerçek noktasından hafifçe kaydırılıp kısa bir
  çizgiyle asıl noktaya bağlanır. O zaman bile koordinatın kendisi
  değişmez, yalnızca çizimi kaydırılır.
- `ipucu`: çocuğa değil, yanındaki ebeveyne yazılmış tek cümle. **Yere
  dairdir, kuşa değil** — kurs birden fazla kuş sunuyorsa (bkz. §7) kuşa
  dair bir ipucu, seçilmeyen kuşlar için yanlış olur. Durakta birden fazla
  bulmaca olsa da ipucu tektir; her bulmacada tekrar yazılmaz.

### Bulmaca seviyesinde (dizideki her girdi için ayrı yazılır)

- `komutSeti`: `yonler` (mutlak yön) veya `donusler` (ileri + dön).
- `harita.bakis`: `yukari`, `asagi`, `sol` veya `sag` olmalı.
- `harita.satirlar`: §3'teki işaretlerle yazılmış ızgara.
- `idealAdim`: en kısa çözümün adım sayısı. **Tahmin etme** — denetim
  script'i doğru değeri sana söyler.

**Bir kursun ilk durağının ilk (ve bugün tek) bulmacası öğreticidir ve her
zaman tek adımda (`idealAdim: 1`) bitmelidir.** Çocuğun bu bölümle ilk
karşılaşması "denedim" değil "başardım" olmalı; üç adımlık bir çözüm bile
ilk deneyim için fazladır. Bkz. `turna-yolu.json` içindeki `goksu-deltasi`
(3×3 harita, Turna ortada, yuva hemen yanında, tek yön komutuyla biter).

## 5. Denetle

```bash
npm run kontrol
```

`scripts/kontrol.ts` her kodlama durağını denetler ve şunlardan biri
bulunursa durağı reddeder (harita çözülemeden yapılamayan denetimler —
çözüm arama, `idealAdim` karşılaştırması — geçerli bir harita gerektirir,
bu yüzden önce harita biçimi doğrulanır):

- durak seviyesindeki zorunlu alanlardan biri boş veya eksikse (`id`, `ad`,
  `mekanik`, `tema`, `ipucu`),
- `mekanik` `"labirent"` değilse,
- `tema` `lib/kodla/labirent/temalar.ts` içinde tanımlı değilse,
- `durak.x` veya `durak.y` 0-100 aralığının dışındaysa ya da nokta
  `turkiye.svg`'deki kara parçasının dışına düşüyorsa,
- `bulmacalar` dizisi yoksa veya boşsa — bir durak en az bir bulmaca
  taşımalı, üst sınır yoktur ama §1'deki 3-6 kuralı yeni içerik için
  geçerlidir,
- dizideki herhangi bir bulmacada `komutSeti` `yonler`/`donusler` dışında
  bir değerse,
- `harita.satirlar` bir dizi değilse veya `harita.bakis` geçerli bir yön
  değilse,
- harita satırları eşit uzunlukta değilse, tam bir `T` veya tam bir `H`
  yoksa ya da tanınmayan bir işaret varsa,
- Turna'nın hedefe ulaşacağı hiçbir yol yoksa (çözümü olmayan harita),
- `idealAdim` genişlik öncelikli aramanın bulduğu en kısa çözümden
  farklıysa — script doğrusunu yazar:

  ```
  turna-yolu/van-golu bulmaca 3: idealAdim 6 yazilmis ama en kisa cozum 5 adim
  ```

- en kısa çözüm `EN_FAZLA_BLOK` (20) bloktan uzunsa; program şeridi bu
  sınırı aşan bir çözümü oynatamaz.

Denetim geçtikten sonra:

```bash
npm run e2e
```

uçtan uca test yeni durağı otomatik olarak oynar ve bitirilebildiğini
doğrular.

## 6. Yeni bir DURAK mı, yeni bir KURS mu?

Yukarıdaki adımlar yalnızca **mevcut bir kursa durak eklemek** içindir ve
kod yazmayı gerektirmez.

Yeni bir **kurs** (yaş grubu) eklemek farklıdır ve tek satırlık bir kod
değişikliği ister: `lib/kodla/bolumler.ts` içindeki `KURS_BOLUMLERI`
kaydına yeni kursun içerik dosyasını import edip bir girdi eklemen gerekir
(`"turna-yolu"` girdisiyle aynı desen). Bu satır unutulursa `npm run kontrol`
hatayla durur — sessizce geçmez — çünkü `content/kodla/kurslar.json`
içindeki `"yayinda"` kurslarla `KURS_BOLUMLERI` kaydı burada karşılaştırılır.

## 7. Yeni bir kursun karakterleri

Yeni bir kurs, kendi kuş seçeneklerini de getirmelidir:
`content/kodla/karakterler.json` içine kurs kimliğiyle eşleşen bir anahtar
altında en az bir karakter eklenir (`id`, `ad`, `bilgi`, `palet.govde`,
`palet.gaga`, `palet.bacak`, `palet.kanat` — renkler `"#rrggbb"`
biçiminde). `npm run kontrol` bu dosyayı da denetler: karakteri olmayan
`"yayinda"` bir kurs, eksik/boş bir alan veya geçersiz bir renk denetimi
düşürür.

`palet.kanat`, gövdenin gölgede kalan tonudur: aynı kuşun tüyü olarak
okunmalı, gövdeden ayırt edilebilecek kadar da koyu olmalı.
`karakterler.test.ts` bunu `kanat`/`govde` arasında en az 1.5:1 WCAG
kontrast oranı olarak sınar. Bu, metin dışı elemanlar için WCAG'in
önerdiği 3:1 eşiğinin altındadır — bugün hiçbir kuş 3:1'e ulaşmıyor
(Turna ~1.57:1, Flamingo ~1.80:1); 3:1'e çıkmak iki kuşun da görünümünü
değiştirmeyi gerektirir, bu yüzden test eşiği bugün gemiye çıkan en düşük
değerin hemen altına, 1.5:1'e konmuştur — hedef gerçek bir gerilemeyi
yakalamak, 3:1'i simüle etmek değil. Turna'da `#c9c2b4`, flamingoda
`#c96a8a`.

**Kursta tek karakter varsa seçim ekranı hiç açılmaz.** Seçecek bir şey
yokken çocuğu kart ekranında durdurmanın anlamı yok; o tek kuş sessizce
geçerli sayılır. Kural `secimSorulmaliMi` içinde yaşar
(`lib/kodla/yerelKayit.ts`) ve `yerelKayit.test.ts` ile korunur. İki veya
daha fazla kuş varsa seçim sorulur ve seçilene kadar harita kullanılamaz.

Kuşa dair bilgi (adı, göç öyküsü, vb.) burada, karakter kartında durur —
durak `ipucu`sine asla sızmaz, çünkü `ipucu` yere dairdir (bkz. §4). Aynı
kursta birden fazla kuş varsa, her ikisi de aynı duraklardan geçer; bir
durağın ipucu belirli bir kuşa özgü bir gerçek içeriyorsa, o kuşu seçmeyen
çocuklar için ipucu yanlış olur.
