# Kodlama Bölümü Hazırlama

Yeni bir durak eklemek kod yazmayı gerektirmez; `content/kodla/<kurs>.json`
dosyasına bir girdi eklemek yeterlidir.

## 1. Girdiyi yaz

```json
{
  "id": "van-golu",
  "ad": "Van Gölü",
  "mekanik": "labirent",
  "komutSeti": "yonler",
  "tema": "su",
  "durak": { "x": 82, "y": 47 },
  "idealAdim": 4,
  "ipucu": "Van Gölü Türkiye'nin en büyük gölüdür.",
  "harita": {
    "bakis": "sag",
    "satirlar": [".....", ".T.oH", "....."]
  }
}
```

## 2. Harita işaretleri

| İşaret | Anlamı |
|---|---|
| `.` | boş kare |
| `#` | engel |
| `T` | Turna'nın başlangıcı (tam bir tane) |
| `H` | yuva, hedef (tam bir tane) |
| `o` | toplanacak başak (istediğin kadar) |

Bütün satırlar aynı uzunlukta olmalı.

## 3. Alanlar

- `id`, `ad`, `ipucu`: boş bırakılamayan metin alanları.
- `mekanik`: bugün yalnızca `"labirent"` var.
- `komutSeti`: `yonler` (mutlak yön) veya `donusler` (ileri + dön).
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
  yeterlidir. Faz 4c'de on beş durağa çıkılınca ve aynı bölgede birden
  fazla durak açılabilir hale gelince muhtemelen **kılavuz çizgi** (leader
  line) gerekecek: işaret gerçek noktasından hafifçe kaydırılıp kısa bir
  çizgiyle asıl noktaya bağlanır. O zaman bile koordinatın kendisi
  değişmez, yalnızca çizimi kaydırılır.
- `harita.bakis`: `yukari`, `asagi`, `sol` veya `sag` olmalı.
- `idealAdim`: en kısa çözümün adım sayısı. **Tahmin etme** — denetim
  script'i doğru değeri sana söyler.
- `ipucu`: çocuğa değil, yanındaki ebeveyne yazılmış tek cümle.

## 4. Denetle

```bash
npm run kontrol
```

`scripts/kontrol.ts` her kodlama bölümünü denetler ve şunlardan biri
bulunursa bölümü reddeder (harita çözülemeden yapılamayan denetimler —
çözüm arama, `idealAdim` karşılaştırması — geçerli bir harita gerektirir,
bu yüzden önce harita biçimi doğrulanır):

- zorunlu alanlardan biri boş veya eksikse (`id`, `ad`, `mekanik`,
  `komutSeti`, `tema`, `ipucu`),
- `mekanik` `"labirent"` değilse,
- `komutSeti` `yonler`/`donusler` dışında bir değerse,
- `tema` `lib/kodla/labirent/temalar.ts` içinde tanımlı değilse,
- `durak.x` veya `durak.y` 0-100 aralığının dışındaysa,
- `harita.satirlar` bir dizi değilse veya `harita.bakis` geçerli bir yön
  değilse,
- harita satırları eşit uzunlukta değilse, tam bir `T` veya tam bir `H`
  yoksa ya da tanınmayan bir işaret varsa,
- Turna'nın hedefe ulaşacağı hiçbir yol yoksa (çözümü olmayan harita),
- `idealAdim` genişlik öncelikli aramanın bulduğu en kısa çözümden
  farklıysa — script doğrusunu yazar:

  ```
  turna-yolu/van-golu: idealAdim 6 yazilmis ama en kisa cozum 4 adim
  ```

- en kısa çözüm `EN_FAZLA_BLOK` (20) bloktan uzunsa; program şeridi bu
  sınırı aşan bir çözümü oynatamaz.

Denetim geçtikten sonra:

```bash
npm run e2e
```

uçtan uca test yeni bölümü otomatik olarak oynar ve bitirilebildiğini
doğrular.

## 5. Yeni bir DURAK mı, yeni bir KURS mu?

Yukarıdaki adımlar yalnızca **mevcut bir kursa durak eklemek** içindir ve
kod yazmayı gerektirmez.

Yeni bir **kurs** (yaş grubu) eklemek farklıdır ve tek satırlık bir kod
değişikliği ister: `lib/kodla/bolumler.ts` içindeki `KURS_BOLUMLERI`
kaydına yeni kursun içerik dosyasını import edip bir girdi eklemen gerekir
(`"turna-yolu"` girdisiyle aynı desen). Bu satır unutulursa `npm run kontrol`
hatayla durur — sessizce geçmez — çünkü `content/kodla/kurslar.json`
içindeki `"yayinda"` kurslarla `KURS_BOLUMLERI` kaydı burada karşılaştırılır.
