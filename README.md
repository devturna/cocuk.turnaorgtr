# Turna Çocuk

Çocuklar için ücretsiz, reklamsız ve **hiçbir veri toplamayan** bir boyama ve
oyun portalı. 4-8 yaş çocukların tablette parmaklarıyla rahatça kullanabilmesi
için tasarlandı.

Yayın adresi: https://cocuk.turna.org.tr

## Ebeveynler için

Çocuğunuzun vakit geçirdiği bir siteyi merak etmeniz çok doğal. Bu yüzden
projenin tamamı açık kaynak: burada gördüğünüz kod, sitede çalışan kodun
kendisidir.

Kısaca: hesap yok, çerez yok, reklam yok, analitik yok, form yok. Çocuğunuzun
çizimleri yalnızca kendi cihazının tarayıcı hafızasında durur ve hiçbir yere
gönderilmez.

Bunu bize güvenerek kabul etmeniz gerekmiyor — kendiniz doğrulayabilirsiniz:
**[Ebeveynler için](docs/ebeveynler-icin.md)**

## Bölümler

| Bölüm | Durum |
|---|---|
| Boyama | Yayında |
| Harfler ve Sayılar | Dört oyun da rakamlarla yayında (Yaz, Say, Bul, Eşleştir); harf içeriği geliştiriliyor |
| Oyunlar | Hafıza oyunu yayında; Gölge ve Sırala planlanıyor |
| Kodlama | Yayında (üç kurs, üç mekanik): **Turna'nın Yolu** on beş durak, elli sekiz bulmaca — sıralama, hata ayıklama, döngü, dönüş komutları; **Kilimin İzi** dört durak — kilim ve çini motifleri çizme; **Göl Kıyısı** iki durak — "dokununca ne olsun" kuralları ve serbest oyun |

Ayrıntılar: [yol haritası](docs/yol-haritasi.md)

## Çalıştırma

Node.js 20 veya üstü gerekir.

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Siteyi `out/` klasörüne statik dosyalar olarak üretir |
| `npm run test` | Boyama mantığının birim testlerini çalıştırır |
| `npm run e2e` | Tarayıcıda uçtan uca testleri çalıştırır |
| `npm run kontrol` | Boyama sayfalarını, lisans kayıtlarını ve kodlama bölümlerini denetler |
| `npm run lint` | Kod denetimi yapar |

## Klasör yapısı

```
app/                     Sayfalar (Next.js App Router)
  page.tsx                 ana sayfa
  boyama/page.tsx          resim galerisi
  boyama/[resimId]/        boyama ekranı
  ogren/                   harf ve sayı oyunları
  oyunlar/                 küçük oyunlar
  kodla/                   kodlama bölümü (kurs > bölüm)
components/boyama/       Arayüz bileşenleri
components/kodla/        Kodlama arayüz bileşenleri
lib/boyama/              Boyama mantığı (React'tan bağımsız, test edilir)
lib/ogren/               Harf ve sayı oyunlarının mantığı (React'tan bağımsız)
lib/oyunlar/             Küçük oyunların mantığı (React'tan bağımsız)
lib/kodla/               Üç mekaniğin motoru ve ilerleme (React'tan bağımsız)
  labirent/                kareler arası hareket
  desen/                   ızgara köşelerinde çizim
  olay/                    "dokununca ne olsun" kuralları
content/                 Boyama sayfası kataloğu
content/kodla/           Kurs ve bölüm içeriği
public/boyama/           Çizgi resimler (SVG)
public/kodla/            Türkiye silueti
scripts/                 Denetim ve içerik üretim script'leri
docs/                    Belgeler
e2e/                     Uçtan uca testler
```

## Katkıda bulunmak

Yeni bir boyama sayfası eklemek en kolay başlangıç:
[boyama sayfası hazırlama](docs/boyama-sayfasi-hazirlama.md)

Yeni bir kodlama bölümü eklemek için:
[kodlama bölümü hazırlama](docs/kodlama-bolumu-hazirlama.md)

Kod tarafı için: [geliştirici rehberi](docs/gelistirici-rehberi.md) ve
[katkı kuralları](CONTRIBUTING.md)

## Lisans

Kod MIT lisanslıdır ([LICENSE](LICENSE)).

Boyama sayfalarının görselleri kendi lisanslarıyla `content/boyama-katalogu.json`
içinde girdi bazında kayıtlıdır; özet tablo:
[public/boyama/LISANSLAR.md](public/boyama/LISANSLAR.md)

Kodlama bölümündeki Türkiye silueti için lisans kaydı:
[content/kodla/LISANSLAR.md](content/kodla/LISANSLAR.md)
