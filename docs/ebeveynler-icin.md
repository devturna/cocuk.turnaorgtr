# Ebeveynler İçin

Bu sayfa, çocuğunuzun kullandığı sitenin ne yaptığını ve ne yapmadığını
anlatır. Amacımız size güvenmenizi söylemek değil, kendiniz kontrol
edebilmenizi sağlamak.

## Bu site nedir?

cocuk.turna.org.tr, çocukların ücretsiz olarak boyama yapabildiği bir
portaldır. İlerleyen aşamalarda basit oyunlar ve ebeveynle birlikte
yapılabilecek kodlama etkinlikleri eklenecek.

Site ücretsizdir ve ücretli hale gelmeyecektir. Reklam yoktur ve
eklenmeyecektir.

## Hangi bilgileri topluyoruz?

Hiçbirini.

| | |
|---|---|
| Kullanıcı hesabı | Yok. Kayıt olmak gerekmiyor. |
| Çerez (cookie) | Yok. |
| Analitik / izleme | Yok. Google Analytics dahil hiçbir izleme aracı yok. |
| Reklam | Yok. |
| Form | Yok. Çocuğa hiçbir soru sorulmuyor. |
| Sunucuya gönderilen veri | Yok. Site tamamen sabit dosyalardan oluşuyor. |

Çocuğunuzun adını, yaşını, konumunu veya cihaz bilgisini bilmiyoruz.
Kaç çocuğun siteyi kullandığını bile bilmiyoruz.

## Çizimler nerede duruyor?

Yarım kalan bir boyama, yalnızca kullandığınız cihazın tarayıcı hafızasında
(localStorage) saklanır. Bu, tarayıcının kendi içinde tuttuğu küçük bir not
defteri gibidir. Bize veya başka bir yere gönderilmez.

Bunun pratik sonucu: çocuğunuz tablette başladığı bir resmi bilgisayarda
bulamaz. Bu bilinçli bir tercihtir — çizimleri eşleştirmek için hesap
açmak gerekirdi, biz de hesap istemiyoruz.

## Bunu nasıl kendiniz doğrularsınız?

Teknik bilgi gerektirmeyen iki yöntem:

### 1. Ağ trafiğine bakın

1. Siteyi bilgisayarda açın.
2. `F12` tuşuna basın (Mac'te `Cmd + Option + I`). Geliştirici araçları açılır.
3. **Network** (Ağ) sekmesine geçin ve sayfayı yenileyin.
4. Listelenen isteklere bakın: hepsi `cocuk.turna.org.tr` adresine gider.
   Başka hiçbir alan adı görmezsiniz.
5. Şimdi çocuğunuzun yapacağı gibi bir resmi boyayın. Boyarken listeye yeni
   hiçbir istek eklenmediğini göreceksiniz — çünkü hiçbir şey gönderilmiyor.

### 2. Saklanan veriye bakın

1. Aynı geliştirici araçlarında **Application** (Uygulama) sekmesine geçin.
2. Soldaki menüden **Local Storage** > `cocuk.turna.org.tr` seçin.
3. Burada şu anahtarları görürsünüz:

   | Anahtar | Ne içerir |
   |---|---|
   | `boyama:kedi` gibi `boyama:` ile başlayanlar | Hangi bölgenin hangi renge boyandığı |
   | `ogren:yildizlar` | Harfler ve Sayılar bölümünde tamamlanan harf/sayılar |
   | `kodla:ilerleme` | Kodlama bölümünde kazanılan yıldızlar (kurs ve durak bazında) |
   | `kodla:denemeler` | Bir duraktaki deneme sayısı (kilit açma kuralı için, geçici) |

   Hepsinin içeriği bu kadardır. İsim, tarih, kimlik numarası gibi hiçbir
   bilgi yoktur.

### 3. Kodun kendisine bakın

Sitenin tüm kaynak kodu herkese açıktır:
https://github.com/devturna/cocuk.turnaorgtr

Verilerin saklanmasıyla ilgili kod her bölüm için ayrı, küçük bir
dosyadadır: boyama için `lib/boyama/yerelKayit.ts`, Harfler ve Sayılar için
`lib/ogren/yildiz.ts`, Kodlama için `lib/kodla/ilerleme.ts`. Yazılımcı
olmasanız bile dosyaların kısalığı fikir verir.

## Çizimleri nasıl silerim?

Tarayıcınızın "site verilerini temizle" seçeneği yeterlidir. Sitede tuttuğumuz
bir kopya olmadığı için başka bir şey yapmanıza gerek yoktur.

## Bir sorun görürsem ne yapmalıyım?

Hatalı bir davranış, uygunsuz bir görsel veya telif sorunu fark ederseniz
depoda konu (issue) açabilirsiniz:
https://github.com/devturna/cocuk.turnaorgtr/issues

İnceleyip gereğini yaparız.
