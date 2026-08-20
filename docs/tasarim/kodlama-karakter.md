# Tasarım Belgesi — Kodlama Bölümü Karakter Seçimi

**Tarih:** 20 Ağustos 2026
**Proje:** cocuk.turna.org.tr
**Durum:** Onaylandı, uygulama Faz 4c
**İlgili belgeler:** motor ve içerik için [kodlama.md](kodlama.md), arayüz için
[kodlama-arayuz.md](kodlama-arayuz.md)

## 1. Amaç

Çocuğun, yola çıkmadan önce hangi kuşla uçacağını seçmesi.

Şimdilik iki kuş: mevcut beyaz turna ve pembe flamingo. Her rota kendi
kuşlarıyla gelecek; karakter listesi kurs bazlıdır.

## 2. Neden karakter seçimi?

Bir çocuğun oyuna bağlanmasını sağlayan tek en güçlü şey karakterdir. Bölüm
tasarımı, animasyon ve ses hepsi önemlidir ama çocuğun kendi seçtiği bir
arkadaşı olması başka bir şeydir: seçim, oyunu "bana ait" yapar.

Seçimin ikinci getirisi yapısaldır. Kurs katmanı yaş grupları için kurulmuştu;
karakter ekseni onun dikine geçer. Yeni bir rota eklendiğinde o rotanın
kuşları da onunla gelir, mevcut hiçbir şey değişmeden.

### Flamingo turna değildir

Flamingo *Phoenicopteridae*, turna *Gruidae* familyasındandır; ikisi de uzun
bacaklı, sulak alanlarda yaşayan büyük kuşlardır ama akraba değillerdir.

Bu ayrım burada önemli çünkü portal ebeveyne gerçek bilgi vermeyi iddia
ediyor. Bu yüzden seçim ekranı "turna cinsleri" diye çerçevelenmez;
"Turna'nın Yolu'nda sana eşlik edecek kuşlar" diye çerçevelenir.

## 3. Temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Seçim anı | Kursa girerken bir kez | Çocuk yola çıkmadan arkadaşını seçer |
| Değiştirme | Göç haritasındaki madalyondan | Karar hapis değil, ama her ekranda önüne çıkmaz |
| Ekran | Ayrı adres değil, haritanın bir hâli | Statik sitede istemci yönlendirmesi kırılgandır |
| Kapsam | Tamamen kozmetik | Motor, çözücü, yıldız, kilit, demo değişmez |
| Kayıt | Kurs bazlı, `localStorage` | Her rota kendi kuşunu hatırlar |
| İpuçları | Durak ipucu yere dair, kuş bilgisi seçim ekranında | İçerik durak + kuş kadar büyür, çarpımı kadar değil |

## 4. Veri modeli

```ts
type Karakter = {
  id: string;        // "turna"
  ad: string;        // "Turna"
  bilgi: string;     // ebeveyne tek cumle
  palet: {
    govde: string;   // "#f4f1ea"
    gaga: string;
    bacak: string;
  };
};
```

`content/kodla/karakterler.json`, kurs kimliğine göre anahtarlanmış bir
kayıttır:

```json
{
  "turna-yolu": [
    {
      "id": "turna",
      "ad": "Turna",
      "bilgi": "Turnalar her ilkbahar Anadolu üzerinden kuzeye göç eder.",
      "palet": { "govde": "#f4f1ea", "gaga": "#e08a2e", "bacak": "#33312e" }
    },
    {
      "id": "flamingo",
      "ad": "Flamingo",
      "bilgi": "Flamingolar Tuz Gölü'nde binlerce çift halinde ürer.",
      "palet": { "govde": "#f2a2b8", "gaga": "#e8556d", "bacak": "#d4849a" }
    }
  ]
}
```

### Neden palet?

Karakter çizimleri şimdilik kodla üretilen yer tutuculardır; bir karakteri
diğerinden ayıran şey renktir. Palet, çizimi karakterden ayıran ince
arayüzdür.

İllüstrasyonlar geldiğinde bu alan dosya yollarına dönüşür ve çağıran kod
değişmez — `KarakterSimgesi` yön ve poz dışında hiçbir şey bilmez.

### Kayıt

```ts
type KarakterSecimi = Record<string, string>;
// { "turna-yolu": "flamingo" }
```

localStorage anahtarı: `kodla:karakter`.

Hiç seçim yapılmamışsa listedeki **ilk karakter** geçerlidir. Bölüm adresine
doğrudan girildiğinde (uçtan uca testler böyle yapar) ekran boş kalmaz.

### `ilerleme.ts` → `yerelKayit.ts`

Bu dosyada artık ilerleme, deneme sayacı, demo bayrağı ve karakter seçimi
var; adı yalan söylüyor. `lib/kodla/yerelKayit.ts` olarak yeniden
adlandırılır. Boyama bölümünde `lib/boyama/yerelKayit.ts` zaten aynı işi
görüyor, yani depoda kardeşi var.

Kural değişmiyor: **`localStorage`'a yalnızca bu dosya dokunur.**

## 5. Ekranlar

### Seçim, göç haritasının bir hâlidir

Kurs kartına dokununca göç haritası açılır. O kurs için henüz karakter
seçilmemişse haritanın üstünde iki büyük kart belirir; seçilince kartlar
kapanır ve altındaki harita kalır.

Ayrı bir adres ve yönlendirme kurulmaz: statik sitede istemci tarafı
yönlendirme kırılgandır ve geri düğmesini bozar.

```
KURS KARTI  →   KİMİNLE UÇALIM?      →   GÖÇ HARİTASI
                ┌────────┐ ┌────────┐     ┌────────────┐
                │  kuş   │ │  kuş   │     │ (o)  harita │
                │ Turna  │ │Flamingo│     │  ⭐┈┈○┈┈·   │
                └────────┘ └────────┘     └────────────┘
                                            ↑ madalyon
```

Kartlarda kuşun çizimi, adı ve ebeveyne yazılmış tek cümlelik bilgisi
bulunur. Çocuk yazıyı okumaz; kuşa bakar ve seçer.

### Madalyon

Göç haritasının köşesinde seçili kuşun 64 piksellik yuvarlağı durur.
Dokunmak seçim kartlarını yeniden açar.

## 6. Kodda adlandırma geçişi

Hareket eden şeyin adı şu an her yerde `turna`: `durum.turna`,
`TurnaSimgesi`, `.kodlaTurna`. Flamingo seçiliyken `TurnaSimgesi` çizmek, bu
deponun "kod ne yapıyorsa onu söyler" ilkesini çiğner.

| Eski | Yeni |
|---|---|
| `TurnaSimgesi` | `KarakterSimgesi` |
| `.kodlaTurna` | `.kodlaKarakter` |
| `durum.turna` | `durum.karakter` |
| `Adim.turna` | `Adim.karakter` |

Beyaz kuşun **içerikteki kimliği** `turna` olarak kalır — o gerçekten bir
turnadır. Değişen, türü değil rolü adlandıran isimlerdir.

Motorun kendisi (`calistir`, `cozucu`, `onizleme`) yalnızca alan adı
düzeyinde etkilenir; mantığı değişmez.

## 7. İçerik değişikliği

Altı durağın dördü zaten yere dair yazılmıştır. Kuşa dair olan ikisi
değişir:

| Durak | Eski | Yeni |
|---|---|---|
| Göksu Deltası | "Turnalar Anadolu'ya güneyden, Göksu Deltası üzerinden girer." | "Göksu Deltası Mersin'de, Türkiye'nin en zengin kuş sulak alanlarından biridir." |
| Sultansazlığı | "Turnalar her ilkbahar Sultansazlığı'nda dinlenir." | "Sultansazlığı Kayseri'de sazlıklar ve göllerden oluşan bir kuş cennetidir." |

Kuş gerçekleri kaybolmaz; seçim ekranına taşınır. Çocuk kuşunu seçerken
ebeveyn o kuşu okur.

Kural: **durak ipucu yere dairdir, kuşa değil.** Yeni bir durak eklerken bu
kurala uyulur; aksi halde her yeni karakter bütün ipuçlarını yanlış hale
getirir.

## 8. Varlık sözleşmesi

Sözleşme karakter başına çoğalır.

| Varlık | Karakter başına | İki kuş için |
|---|---|---|
| 4 yön × 2 poz (duruş + adım) | 8 | 16 |
| Çarpma pozu | 1 | 2 |
| Kutlama pozu | 1 | 2 |
| **Toplam** | **10** | **20** |

Ortak varlıklar değişmez: yuva, başak, yedi tema engeli.

Format şartları [kodlama-arayuz.md](kodlama-arayuz.md) §8 ile aynıdır: SVG,
poz başına tek dosya, `viewBox="0 0 100 100"`, gömülü raster yok, harici font
yok, kaynağı ve lisansı `content/kodla/LISANSLAR.md` içine işlenir.

## 9. Test

| Katman | Araç | Neyi doğrular |
|---|---|---|
| Katalog | Vitest | Kimlik benzersiz, palet geçerli renk, bilgi dolu, her kursun en az bir karakteri |
| Kayıt | Vitest | Kurs bazlı izolasyon, varsayılan ilk karakter, silinince sıfırlanır |
| İçerik | `npm run kontrol` | Yayındaki her kursun karakter listesi var; paletler geçerli; bilgi boş değil |
| Arayüz | Playwright | Seçim çıkıyor, seçilince kapanıyor ve hatırlanıyor, madalyon tekrar açıyor, 64 piksel, kaydırma yok |

### Seçimin ekrana gerçekten yansıdığı nasıl doğrulanır?

Sahnedeki gövdenin `fill` değeri, seçilen karakterin paletiyle
karşılaştırılır.

Renk karşılaştırması kırılgan görünür, ama tam bu yüzden değerlidir:
"flamingo seçtim, hâlâ beyaz kuş yürüyor" hatasını başka hiçbir test
yakalamaz.

## 10. Fazın işi

Yedi görev:

1. Karakter kataloğu ve okuma katmanı
2. `ilerleme.ts` → `yerelKayit.ts` geçişi ve karakter seçimi kaydı
3. Simgelerin palet parametrizasyonu (`KarakterSimgesi`)
4. `turna` → `karakter` adlandırma geçişi
5. Seçim ekranı ve madalyon
6. İçerik güncellemesi ve denetim kuralları
7. Uçtan uca testler ve belgeler

## 11. Faz 4c tamamlanma ölçütleri

Görev 7'de tek tek doğrulanmış, işaretli olmayan madde yok (bkz.
`.superpowers/sdd/2026-08-20-kodlama-faz4c/gorev-7-report.md`).

- [x] 1. Kursa ilk girişte iki kuş kartı çıkıyor ve seçim yapılmadan harita
      kullanılamıyor — `e2e/kodla.spec.ts`'teki "ilk giriste kus secimi
      sorulur..." testi diyaloğun açıldığını doğruluyor; iki kart sayısı ve
      diyalog açıkken durağa tıklanamadığı elle (Playwright ile, tek seferlik
      bir denetim testiyle) doğrulandı — bkz. görev 7 raporu.
- [x] 2. Seçim hatırlanıyor; ikinci girişte sorulmuyor — aynı testin
      "Ikinci acilista sorulmaz" adımı.
- [x] 3. Göç haritasındaki madalyon seçimi yeniden açıyor — aynı testin son
      adımı.
- [x] 4. Seçilen kuş bölüm ekranında gerçekten çiziliyor (renk testiyle
      doğrulanmış) — "secilen kus bolum ekraninda gercekten cizilir" testi;
      `Sahne.tsx`'te paleti geçici olarak varsayılana sabitleyip testin
      kırmızıya döndüğü görüldü (görev 7 raporunda kanıtlı).
- [x] 5. Karakter seçimi kurs bazlı; yeni kurs eskisini bozmuyor —
      `lib/kodla/yerelKayit.test.ts`'teki "kurslar birbirini etkilemez" birim
      testi.
- [x] 6. Kodda hareket eden öğe `karakter` diye adlandırılmış; `turna`
      yalnızca içerikteki kuşun kimliği — `components/` ve `lib/kodla/`
      içinde `kodlaTurna`/`turnaKonumu`/`TurnaSimgesi` gibi bir kalıntı yok
      (grep ile doğrulandı); `turna` yalnızca `karakterler.json` ve
      testlerdeki içerik kimliği olarak geçiyor.
- [x] 7. İki durağın ipucu yere dair hale gelmiş; kuş bilgileri seçim
      ekranında — `content/kodla/turna-yolu.json`'daki altı ipucu da yere
      dair (kuş göçüne değinen yok); kuş bilgisi yalnızca
      `content/kodla/karakterler.json`'daki `bilgi` alanında.
- [x] 8. Dokunma hedefleri en az 64 piksel, ekranda kaydırma yok — bölüm
      ekranı için mevcut test, seçim ekranı için yeni eklenen "karakter
      secim ekraninda dokunma hedefleri en az 64 piksel" testi (beş ekran
      boyutunda `.karakterKarti` ve `.karakterMadalyonu`).
- [x] 9. `prefers-reduced-motion` açıkken seçim ekranında da animasyon yok —
      reduced-motion testi artık göç haritasını ve seçim ekranını da
      ziyaret ediyor (Görev 7'ye yönlendirilen madde 2).
- [x] 10. Birim testleri, denetim ve uçtan uca testler geçiyor — Adım 5'te
       `npm run lint && npm run test && npm run kontrol && npm run e2e`
       çalıştırıldı, sonuçlar görev 7 raporunda.
