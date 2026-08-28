"use client";

// Bolumun tamami: sahne, program seridi, palet ve calistirma.
//
// Durum tek bir nesnede tutulur. Ayri useState'lere bolmek Harfler ve
// Sayilar bolumunde gercek bir cokmeye yol acmisti: birlikte degismesi
// gereken degerler bir render boyunca birbirinden ayri kaliyordu.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calistir, type Adim } from "@/lib/kodla/labirent/calistir";
import {
  KOMUT_SETLERI,
  komutAnahtari,
  type Komut,
  type KomutSeti,
  type Yon,
} from "@/lib/kodla/labirent/komutlar";
import { kareAnahtari, type Harita } from "@/lib/kodla/labirent/harita";
import { onizlemeYolu } from "@/lib/kodla/labirent/onizleme";
import { temaBul } from "@/lib/kodla/labirent/temalar";
import { blokEkle, programiTemizle, sonBlokuSil } from "@/lib/kodla/program";
import {
  bulmacaBul,
  bulmacaHaritasi,
  bulmacaSayisi,
  bolumSiralamasi,
  type BolumVerisi,
} from "@/lib/kodla/bolumler";
import { baslangicBulmacasi, bulmacaSonrasi } from "@/lib/kodla/durak";
import { varsayilanKarakter } from "@/lib/kodla/karakterler";
import {
  bolumSonucuKaydet,
  bulmacaCozuldu,
  demoGosterildi,
  demoGosterildiMi,
  denemeArtir,
  durakIlerlemesi,
  durakIlerlemesiniSil,
  seciliKarakter,
  type YildizTuru,
} from "@/lib/kodla/yerelKayit";
import Sahne from "./Sahne";
import KomutPaleti from "./KomutPaleti";
import ProgramSeridi from "./ProgramSeridi";
import Konfeti from "./Konfeti";
import { VARSAYILAN_PALET, type KarakterPozu } from "./Simgeler";
import "../kodla.css";

// Uc zamanlama sabiti birbirine bagli ve SIRALARI onemlidir, kucukten
// buyuge:
//   1. kodla.css --kodla-adim-suresi (bugun 380ms) — kareler arasi CSS
//      gecis suresi.
//   2. POZ_SIFIRLAMA_GECIKMESI (asagida, 400ms) — carpma/inis pozunun
//      "durus"a donme gecikmesi. Bu, CSS gecisinin/animasyonunun BITMESINI
//      beklemek zorunda; erken donerse pozun kendi animasyonu yarida
//      kesilir.
//   3. ADIM_SURESI (asagida, 450ms) — bu bilesenin bir sonraki adima
//      gectigi JS tik suresi. Bu, CSS gecisinden UZUN olmak zorunda;
//      kisaltilirsa karakter gecis bitmeden bir sonraki kareye ISINLANIR
//      (transform hala eski konuma dogru animasyon oynatirken React yeni
//      --kare-x/--kare-y degerini yazar, gecis yarida kesilip yeniden
//      baslar — akici yurume hissi bozulur).
// Uc deger elle senkron tutuluyor (calisma zamaninda CSS degiskenini okuyup
// eslemek yerine): React'in ilk render'i ile DOM'a yazilmis CSS custom
// property'nin okunabilir olmasi arasinda senkron bir an yok, bu da "once
// oku, sonra zamanlayiciyi kur" akisini kirilgan yapardi. Bu ucunu
// DEGISTIRIRKEN sirayi (1 < 2 < 3) koruyun; kodla.css'teki degisken de
// yanindaki yorumda bu dosyaya isaret eder.
const ADIM_SURESI = 450;
const POZ_SIFIRLAMA_GECIKMESI = 400;

// Cocuk bu kadar sure hicbir sey yapmazsa demo sessizce tekrarlanir.
const BOSTA_SURESI = 12000;

// Bulmacalar arasi gecis katmaninin ekranda kaldigi sure. Yukaridaki uclu
// zamanlamayla iliskisi yok: gecis, bir bulmaca zaten bitmisken oynar. Ama
// kendi kuplaji var: kodla.css'teki .bulmacaGecisi'nin bulmacaGecisBelir
// belirme animasyonundan (220ms) KISA OLAMAZ, yoksa katman belirme
// ortasinda kaldirilir.
const GECIS_SURESI = 1100;

// Bulmaca kazanilinca kutlama pozu, gecis katmani onu ortmeden once bu kadar
// sure ekranda kalir. Yukaridaki hicbir sureyle bagli degil: sadece cocugun
// varisi GORMESI icin bilincli bir bekleme.
const VARIS_BEKLEME_SURESI = 500;

/**
 * Demo icin bir komut secer: karakter GORULEBILIR sekilde yurumeli (cocuk bir
 * seyin oldugunu gormeli) ama bolumu BITIRMEMELI (yoksa cocugun ilk
 * deneyimi, kendisi hic dokunmadan "kazanilmis" bir bolum olur). Komut
 * setindeki her komutu tek basina calistirip bu iki sarti saglayan ilkini
 * doner. Harita boyle bir komut sunmuyorsa (ornegin tek adimda hem yuruyup
 * hem bitirmeyen hicbir yon yoksa) null doner; cagiran taraf bu durumda
 * demoyu hic gostermez. Yanlis bir sey gostermek, hic gostermemekten kotu.
 */
function demoKomutuSec(seti: KomutSeti, harita: Harita): Komut | null {
  for (const komut of KOMUT_SETLERI[seti]) {
    const sonuc = calistir([komut], harita);
    const yurudu = sonuc.adimlar.some((adim) => adim.olay === "yurudu");
    if (yurudu && !sonuc.basarili) return komut;
  }
  return null;
}

type Durum = {
  program: Komut[];
  // Programdaki hangi blogun EN SON EKLENEN blok oldugu (ProgramSeridi'nin
  // giris animasyonu icin). Konuma gore turetilmez (program.length - 1):
  // son blogu silince onceki blok konum olarak "son" olur ama YENI EKLENMIS
  // degildir; konuma gore turetmek geri alma sonrasi onceki bloga tekrar
  // giris animasyonu oynatirdi.
  sonEklenenSira: number | null;
  oynatma: { adimlar: Adim[]; sira: number } | null;
  vurgulanan: number | null;
  karakterKonumu: { x: number; y: number; bakis: Yon };
  poz: KarakterPozu;
  toplananlar: string[];
  bitti: YildizTuru | null;
  /** Su an oynanan bulmacanin durak icindeki sirasi. */
  bulmacaSirasi: number;
  /** Bulmacalar arasi gecis katmani goruntudeyken true. */
  gecis: boolean;
  /**
   * Bulmaca kazanildi, sirada bir sonraki bulmaca var; kutlama pozu bir
   * "nefes" suresi ekranda kalsin diye gecis katmani HEMEN degil, bu bayrak
   * kapaninca acilir (Duzeltme turu 1, Onemli 1).
   */
  sonrakiHazirlaniyor: boolean;
};

export default function BolumEkrani({
  kursId,
  bolum,
  sonrakiBolumId,
}: {
  kursId: string;
  bolum: BolumVerisi;
  sonrakiBolumId: string | null;
}) {
  const toplamBulmaca = bulmacaSayisi(bolum);

  // Karakter yalnizca tarayicida secilir; sayfa sunucuda uretilirken
  // localStorage yoktur. Bu yuzden once varsayilanla cizip, ekran acilinca
  // secileni okuyoruz.
  const [karakter, setKarakter] = useState(() => varsayilanKarakter(kursId));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKarakter(seciliKarakter(kursId));
  }, [kursId]);

  // Demo yalnizca kursun ilk duraginda anlamli; sonrakilerde cocuk zaten
  // nasil oynandigini biliyor.
  const ilkDurakDegil = bolumSiralamasi(kursId)[0] !== bolum.id;

  // Baslangicta bulmacaSirasi her zaman 0'dir (localStorage sunucuda yok);
  // ilk karakter konumu da bu yuzden burada, dogrudan 0. bulmacadan
  // hesaplanir. Asagidaki `bulmaca`/`harita` degiskenleri ise her render'da
  // GUNCEL durum.bulmacaSirasi'ni okur (bir sonraki adimda tanimli) —
  // ikisi ayni yerde birlesmiyor cunku bu ilk deger yalnizca mount anini,
  // digerleri her render'i temsil eder.
  const [durum, setDurum] = useState<Durum>(() => {
    const ilkBulmaca = bulmacaBul(bolum, 0) ?? bolum.bulmacalar[0];
    const ilkHarita = bulmacaHaritasi(ilkBulmaca);
    return {
      program: [],
      sonEklenenSira: null,
      oynatma: null,
      vurgulanan: null,
      karakterKonumu: { ...ilkHarita.baslangic, bakis: ilkHarita.bakis },
      poz: "durus",
      toplananlar: [],
      bitti: null,
      bulmacaSirasi: 0,
      gecis: false,
      sonrakiHazirlaniyor: false,
    };
  });

  // Durak ilk acildiginda kaldigi yerden devam eder. Bitmis bir durak bastan
  // oynaniyorsa sayac da sifirlanir; yoksa ikinci turda "cozulen" toplami
  // asar ve altin sansi eski turdan miras kalir.
  useEffect(() => {
    const ilerleme = durakIlerlemesi(kursId, bolum.id);
    const baslangic = baslangicBulmacasi(ilerleme.cozulen, toplamBulmaca);
    if (ilerleme.cozulen >= toplamBulmaca) {
      durakIlerlemesiniSil(kursId, bolum.id);
    }
    if (baslangic === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum((onceki) => ({ ...onceki, bulmacaSirasi: baslangic }));
  }, [kursId, bolum.id, toplamBulmaca]);

  const bulmaca = bulmacaBul(bolum, durum.bulmacaSirasi) ?? bolum.bulmacalar[0];
  const harita = useMemo(() => bulmacaHaritasi(bulmaca), [bulmaca]);
  const tema = temaBul(bolum.tema);
  const baslangicKarakterKonumu = { ...harita.baslangic, bakis: harita.bakis };

  // Lazy initializer: bir kez hesaplanir, sonraki render'larda ayni referans
  // kalir (bagimlilik dizilerinde guvenle kullanilabilir). ilkDurakDegil
  // true ise hesaplamaya bile gerek yok.
  const [demoKomut] = useState<Komut | null>(() =>
    ilkDurakDegil ? null : demoKomutuSec(bulmaca.komutSeti, harita),
  );

  // Demo yalnizca ilk durakta ve ilk giriste oynar. Sahte animasyon degil:
  // gercek arayuzu surer, cocuk tam olarak kendi yapacagi seyi gorur.
  // Ucuncu asama ("izliyor"), demo'nun kendi kosusunun bitmesini bekler ki
  // kontrol cocuga temiz bir tahtayla gecsin.
  const [demo, setDemo] = useState<"yon" | "calistir" | "izliyor" | null>(null);

  useEffect(() => {
    if (ilkDurakDegil) return;
    if (demoGosterildiMi()) return;
    // Haritada tek adimda hem yuruyup hem bitirmeyen bir komut yoksa
    // (demoKomut null) demo yaniltici olurdu; sessizce atlanir. Bayrak
    // BUNDAN SONRA yazilir, once degil: bayrak tek bir global anahtar
    // (kodla:demo), kursa gore ayrilmaz. Once yazip sonra cikarsak, ilk
    // duragi gecerli bir demo komutu sunmayan bir kurs, bayragi kalici
    // olarak "gosterildi" isaretler ve demo baska hicbir kursta bir daha
    // hic oynamaz.
    if (demoKomut === null) return;
    demoGosterildi();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemo("yon");
  }, [ilkDurakDegil, demoKomut]);

  // Ekranda kaydirma yok: cocuk komut secmek icin sayfayi kaydirmamali.
  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  // Adimlari sirayla oynatir. Her tik bir adimi uygular; son adimda sonucu
  // kaydeder.
  useEffect(() => {
    if (!durum.oynatma) return;
    const { adimlar, sira } = durum.oynatma;
    const adim = adimlar[sira];
    const sonAdim = sira === adimlar.length - 1;

    const zamanlayici = setTimeout(() => {
      let kazanilan: YildizTuru | null = null;
      let sonrakiBulmacaVar = false;
      if (sonAdim) {
        if (adim.olay === "vardi") {
          const idealMi = durum.program.length <= bulmaca.idealAdim;
          const ilerleme = bulmacaCozuldu(kursId, bolum.id, idealMi);
          const sonrasi = bulmacaSonrasi(durum.bulmacaSirasi, toplamBulmaca, ilerleme.hepsiIdeal);
          if (sonrasi.tur === "bitti") {
            kazanilan = sonrasi.yildiz;
            bolumSonucuKaydet(kursId, bolum.id, kazanilan);
          } else {
            sonrakiBulmacaVar = true;
          }
        } else {
          denemeArtir(kursId, bolum.id, durum.bulmacaSirasi);
        }
      }

      setDurum((onceki) => ({
        ...onceki,
        karakterKonumu: { x: adim.karakter.x, y: adim.karakter.y, bakis: adim.karakter.bakis },
        toplananlar:
          adim.olay === "topladi"
            ? [...onceki.toplananlar, kareAnahtari(adim.karakter)]
            : onceki.toplananlar,
        // Yurume dongusu iki pozun degismesiyle olusur; her adimda takla
        // atmasin diye "adim" ile "durus" arasinda gidip geliyor.
        poz:
          adim.olay === "carpti"
            ? "carpma"
            : adim.olay === "vardi"
              ? "kutlama"
              : adim.olay === "yurudu"
                ? onceki.poz === "adim"
                  ? "durus"
                  : "adim"
                : onceki.poz,
        // Basarisiz bitince vurgu sonsuza kadar son blokta kalmasin.
        vurgulanan: sonAdim && !kazanilan ? null : adim.blokSirasi,
        oynatma: sonAdim ? null : { adimlar, sira: sira + 1 },
        bitti: kazanilan,
        // gecis BURADA acilmiyor: kutlama pozu (yukarida "kutlama") once bir
        // nefes gorunsun diye asagidaki sonrakiHazirlaniyor efekti acar.
        sonrakiHazirlaniyor: sonrakiBulmacaVar,
      }));
    }, ADIM_SURESI);

    return () => clearTimeout(zamanlayici);
  }, [
    durum.oynatma,
    durum.program.length,
    durum.bulmacaSirasi,
    bulmaca.idealAdim,
    toplamBulmaca,
    bolum.id,
    kursId,
  ]);

  // Kosu bitince poz dinlenme haline doner. Tek blokluk bir carpmada
  // "carpma" pozunu temizleyecek baska bir adim olmadigi icin gerekli.
  useEffect(() => {
    if (durum.oynatma || durum.bitti) return;
    if (durum.poz === "durus") return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({ ...onceki, poz: "durus" }));
    }, POZ_SIFIRLAMA_GECIKMESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.oynatma, durum.bitti, durum.poz]);

  // Kutlama pozu bir nefes gorundukten sonra gecis katmanini acar. Bu efekt
  // olmasa "vardi" ile ayni commit'te gecis:true yazilir, kutlama pozu
  // dogunca ANINDA ortulur ve cocuk varisi hic gormez (durak son bulmacada
  // degilse) — bkz. Duzeltme turu 1, Onemli 1.
  useEffect(() => {
    if (!durum.sonrakiHazirlaniyor) return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({ ...onceki, sonrakiHazirlaniyor: false, gecis: true }));
    }, VARIS_BEKLEME_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.sonrakiHazirlaniyor]);

  // Gecis katmani kisa sure gorunur, sonra sonraki bulmaca ortunun ALTINDA
  // acilir: bulmacaSirasi burada ilerler ama gecis HENUZ kapanmaz. Kapatma
  // isini, konumu yeni haritaya senkronlayan asagidaki etki, kendi ayri
  // commit'inde yapar — boylece kus, ortu kalkmadan ONCE yeni karesine
  // gecmis olur; ayni commit'te kapatilsaydi cocuk kusun eski kareden yeniye
  // "kaydigini" gorurdu (bkz. Duzeltme turu 1, Onemli 1). karakterKonumu
  // burada da YAZILMAZ: yeni haritanin baslangici baslangicKarakterKonumu'ndan
  // gelir ve bulmacaSirasi degistiginde yeniden hesaplanir; konumu burada
  // da yazmak ikinci bir kaynak yaratirdi.
  useEffect(() => {
    if (!durum.gecis) return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({
        ...onceki,
        bulmacaSirasi: onceki.bulmacaSirasi + 1,
        program: [],
        sonEklenenSira: null,
        vurgulanan: null,
        toplananlar: [],
        poz: "durus",
        bitti: null,
      }));
    }, GECIS_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.gecis]);

  // Harita DEGISTIGINDE (yeni bulmacaya gecince) kus karesini o haritanin
  // baslangicina esitleyen TEK yer burasidir; gecis etkisi konumu ayrica
  // yazmiyor, tam da bu yuzden. (Bu, karakterKonumu'nu yazan TEK kod demek
  // DEGIL: oynatma-tikleme etkisi kosu sirasinda, bastanBasla/
  // calistirmayiBaslat el ile, demo-sifirlama etkisi de kendi aninda
  // konumu ayrica yazar — hepsi farkli anlarda calisir, bu etkiyle
  // cakismazlar.)
  //
  // Gecis hala aciksa (durum.gecis true), konum senkronu ORTUNUN ALTINDA
  // olur; bu etki kendisi de gecisi kapatir ama AYRI bir commit'te — aynen
  // kapatilirsa .kodlaKarakter'in CSS transform gecisi (kodla.css) tam bu
  // anda tetiklenir ve kus, ortu kalkarken eski kareden yeniye "belirir"
  // gibi kayar. .gecisSirasinda sinifi (kodla.css) bu sirada zaten transform
  // gecisini kapatiyor; iki onlem birlikte kaymayi engeller — AMA setTimeout
  // 0ms yetmiyor: iki commit birbirine bu kadar yakinsa tarayici arada hic
  // BOYAMA yapmadan ikisini TEK gorsel kareye sikistirabilir, "gecisSirasinda"
  // ilk commit'te hic gorunmemis gibi davranir ve kayma yine olusur (bu,
  // elle test sirasinda GERCEKTEN gozlemlendi — bkz. Duzeltme turu 1 raporu).
  // Cift requestAnimationFrame, tarayicinin konum-senkron commit'ini
  // GERCEKTEN boyadigini garanti eden standart teknik: ilk rAF bir sonraki
  // karenin basinda calisir (onceki kare zaten boyanmis olur), ikinci rAF
  // ondan bir kare sonra — boylece gecis:false'un tetikledigi commit, konum
  // degisikliginden kesinlikle AYRI bir boyamadan sonra gelir.
  useEffect(() => {
    const gecisOrtusuAcikMiydi = durum.gecis;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum((onceki) => ({
      ...onceki,
      karakterKonumu: { ...harita.baslangic, bakis: harita.bakis },
    }));
    if (!gecisOrtusuAcikMiydi) return;
    let ikinciKare: number | null = null;
    const ilkKare = requestAnimationFrame(() => {
      ikinciKare = requestAnimationFrame(() => {
        setDurum((onceki) => ({ ...onceki, gecis: false }));
      });
    });
    return () => {
      cancelAnimationFrame(ilkKare);
      if (ikinciKare !== null) cancelAnimationFrame(ikinciKare);
    };
    // durum.gecis BILEREK bagimlilik degil: bu etki SADECE harita
    // degisince calismali. gecis'i eklemek, gecis kendi basina true/false
    // oldugunda (sonrakiHazirlaniyor efekti acinca, ya da bu etkinin kendi
    // ic zamanlayicisi kapatinca) da bu etkiyi tekrar tetikler — ilki
    // ortuyu harita henuz degismeden erken kapatir, ikincisi gereksiz bir
    // tekrar calisir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harita]);

  function blokEklendi(komut: Komut) {
    setDurum((onceki) => {
      const program = blokEkle(onceki.program, komut);
      // Serit doluysa (EN_FAZLA_BLOK) blokEkle hicbir sey eklemez; boyle bir
      // durumda "yeni" isaretini de degistirmiyoruz, cunku gercekten yeni
      // bir blok yok.
      const sonEklenenSira =
        program.length > onceki.program.length ? program.length - 1 : onceki.sonEklenenSira;
      return { ...onceki, program, sonEklenenSira };
    });
  }

  function bastanBasla() {
    setDurum((onceki) => ({
      ...onceki,
      karakterKonumu: baslangicKarakterKonumu,
      poz: "durus",
      toplananlar: [],
      vurgulanan: null,
      oynatma: null,
      bitti: null,
    }));
  }

  /**
   * Kutlama katmanina dokunmak SADECE son bulmacayi degil, TUM DURAGI
   * bastan baslatir. bastanBasla (yukarida) "Kusu basa al" dugmesi icindir
   * ve kasten bulmacaSirasi'na dokunmaz — o, tek bir bulmacayi yeniden
   * denemektir. Kutlama ise durak BITTIKTEN sonra gorunur; oradan "yeniden
   * oyna" demek nokta gostergesindeki HER noktayi bos, altin sansini da
   * yeniden acik saymak demektir (bkz. Duzeltme turu 1, Onemli 3) — yoksa
   * cocuk yalnizca SON bulmacayi tekrar cozer ve butun durak icin yildiz
   * tekrar kazanir, oysa durum.bulmacaSirasi hala son bulmacayi gosterir ve
   * durakIlerlemesi silinmedigi icin bir sonraki acilista sayac eski
   * turden miras kalir.
   *
   * karakterKonumu burada YAZILMAZ (ayni tek-kaynak kurali): bulmacaSirasi
   * 0'a donunce harita da 0. bulmacaya doner, harita-senkron etkisi konumu
   * o haritanin baslangicina kendisi tasir. Burada yazsaydik, hala eski
   * (son) bulmacanin haritasina ait baslangicKarakterKonumu kullanilirdi —
   * bir tik sonra dogrusuyla degistirilene kadar yanlis karede gorunurdu.
   */
  function duraktanTekrarBasla() {
    durakIlerlemesiniSil(kursId, bolum.id);
    setDurum((onceki) => ({
      ...onceki,
      bulmacaSirasi: 0,
      program: [],
      sonEklenenSira: null,
      poz: "durus",
      toplananlar: [],
      vurgulanan: null,
      oynatma: null,
      bitti: null,
      gecis: false,
      sonrakiHazirlaniyor: false,
    }));
  }

  function calistirmayiBaslat() {
    const sonuc = calistir(durum.program, harita);
    if (sonuc.adimlar.length === 0) return;
    setDurum((onceki) => ({
      ...onceki,
      karakterKonumu: baslangicKarakterKonumu,
      poz: "durus",
      toplananlar: [],
      bitti: null,
      vurgulanan: null,
      oynatma: { adimlar: sonuc.adimlar, sira: 0 },
    }));
  }

  const calisiyor = durum.oynatma !== null;

  // Demo adimlarini yurutur: yon dugmesine "dokunur", calistirir, sonra
  // kosunun bitmesini bekleyip tahtayi sifirlar. calistirmayiBaslat asagida
  // tanimlandiktan sonra kullaniliyor diye bu etki buraya, fonksiyon
  // bildirimlerinin ardina alindi.
  useEffect(() => {
    if (demo === null) return;

    if (demo === "yon") {
      // demoKomut burada asla null olamaz: demo yalnizca mount ve
      // bosta-tekrar etkilerinde demoKomut !== null iken "yon" yapilir.
      const secilenKomut = demoKomut!;
      const zamanlayici = setTimeout(() => {
        setDurum((onceki) => {
          const program = blokEkle(onceki.program, secilenKomut);
          return { ...onceki, program, sonEklenenSira: program.length - 1 };
        });
        setDemo("calistir");
      }, 1400);
      return () => clearTimeout(zamanlayici);
    }

    if (demo === "calistir") {
      const zamanlayici = setTimeout(() => {
        calistirmayiBaslat();
        setDemo("izliyor");
      }, 1400);
      return () => clearTimeout(zamanlayici);
    }

    // demo === "izliyor": kosu suruyorsa bekle. Kosu bitince "kontrol
    // cocuga gecer": tahta, cocugun hicbir seye dokunmamis gibi tertemiz
    // baslamasi icin sifirlanir (program dahil; bastanBasla programi
    // korur, o yuzden burada ayrica programiTemizle cagriliyor).
    if (calisiyor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum((onceki) => ({
      ...onceki,
      program: programiTemizle(),
      sonEklenenSira: null,
      karakterKonumu: baslangicKarakterKonumu,
      poz: "durus",
      toplananlar: [],
      vurgulanan: null,
      oynatma: null,
      bitti: null,
    }));
    setDemo(null);
    // calistirmayiBaslat her render'da yeniden kuruluyor; bagimliliga
    // eklemek zamanlayiciyi her render'da sifirlar, demo hic bitmez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, demoKomut, calisiyor]);

  // Cocuk uzun sure hicbir sey yapmazsa demo hatirlatma olarak tekrarlanir.
  // Yalnizca ilk durakta, o durak 0. bulmacadayken ve gecerli bir demo
  // komutu varsa: baska bir durakta bosta kalmak, cocuga o haritada
  // anlamsiz olabilecek sabit bir hareketi (demoKomut, ilk duragin 0.
  // bulmacasina gore secilir) izletmemeli — AYNI gerekce, ayni durak
  // icinde bulmaca ilerledikten sonra da gecerli: demoKomutuSec, o
  // komutun 0. bulmacanin haritasinda YURUYUP BITIRMEDIGINI garanti eder;
  // bulmacaSirasi ilerleyince bu garanti baska bir haritada gecersizdir —
  // komut o haritada bulmacayi BITIREBILIR ve cocuk hic dokunmadan
  // kazanir (bulmacaCozuldu tetiklenir, sayac ilerler). Bu yuzden
  // bulmacaSirasi === 0 sarti sart.
  useEffect(() => {
    if (ilkDurakDegil || demoKomut === null) return;
    if (durum.bulmacaSirasi !== 0) return;
    if (calisiyor || durum.bitti || demo !== null) return;
    if (durum.program.length > 0) return;
    const zamanlayici = setTimeout(() => setDemo("yon"), BOSTA_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [
    ilkDurakDegil,
    demoKomut,
    durum.bulmacaSirasi,
    calisiyor,
    durum.bitti,
    durum.program.length,
    demo,
  ]);

  // Onizleme, gercek calistirmayla ayni fonksiyondan uretiliyor; ikisi
  // ayrisamaz. Program kisa oldugu icin her render'da hesaplamak ucuz.
  const yol = onizlemeYolu(durum.program, harita);

  return (
    <div className="bolumEkrani">
      <div className="bolumUstBar">
        <Link href={`/kodla/${kursId}/`} className="geriDugmesi">
          <span aria-hidden="true">←</span> Duraklar
        </Link>
        <h1 className="bolumAdi">{bolum.ad}</h1>
        {/* Nokta gostergesi, durakta birden fazla bulmaca varken bolum
            basliginin yaninda durur: cocuk durakta nerede oldugunu gorur.
            Dolu nokta ULASILAN bulmacadir (cozulmus olan degil): su an
            oynanan bulmacanin noktasi da doludur, ki durak acilir acilmaz
            en az bir nokta dolu gorunsun. */}
        {toplamBulmaca > 1 ? (
          <div
            className="bulmacaNoktalari"
            role="img"
            aria-label={`${bolum.ad}: ${toplamBulmaca} bulmacadan ${durum.bulmacaSirasi + 1}. bulmaca`}
          >
            {bolum.bulmacalar.map((_, sira) => (
              <span
                key={sira}
                className={sira <= durum.bulmacaSirasi ? "bulmacaNoktasi dolu" : "bulmacaNoktasi"}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="sahneAlani">
        <Sahne
          harita={harita}
          tema={tema}
          karakterKonumu={durum.karakterKonumu}
          poz={durum.poz}
          gecisSirasinda={durum.gecis}
          palet={karakter?.palet ?? VARSAYILAN_PALET}
          bekliyor={!calisiyor}
          yol={yol}
          calisan={durum.vurgulanan}
          toplananlar={durum.toplananlar}
          vardi={durum.bitti !== null}
          bolumAdi={bolum.ad}
        />
      </div>

      <ProgramSeridi
        program={durum.program}
        vurgulanan={durum.vurgulanan}
        sonEklenenSira={durum.sonEklenenSira}
      />

      <div className="bolumAltBar">
        <KomutPaleti
          seti={bulmaca.komutSeti}
          kilitli={calisiyor || demo !== null}
          onEkle={blokEklendi}
          hayalet={demo === "yon" && demoKomut !== null ? komutAnahtari(demoKomut) : null}
          nabiz={!calisiyor && demo === null && durum.program.length === 0}
        />

        <div className="bolumKontrolleri">
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Son bloğu sil"
            disabled={calisiyor || durum.program.length === 0}
            onClick={() =>
              setDurum((o) => ({ ...o, program: sonBlokuSil(o.program), sonEklenenSira: null }))
            }
          >
            <span aria-hidden="true">↩</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Hepsini temizle"
            disabled={calisiyor || durum.program.length === 0}
            onClick={() =>
              setDurum((o) => ({ ...o, program: programiTemizle(), sonEklenenSira: null }))
            }
          >
            <span aria-hidden="true">🗑</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Kuşu başa al"
            disabled={calisiyor}
            onClick={bastanBasla}
          >
            <span aria-hidden="true">↺</span>
          </button>
          <button
            type="button"
            className={`calistirDugmesi${demo === "calistir" ? " hayaletli" : ""}${
              !calisiyor && durum.program.length > 0 && demo === null ? " nabiz" : ""
            }`}
            aria-label="Çalıştır"
            disabled={calisiyor || durum.program.length === 0 || demo !== null}
            onClick={calistirmayiBaslat}
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>

      <p className="bolumIpucu">{bolum.ipucu}</p>

      {durum.gecis ? (
        <div className="bulmacaGecisi" role="status">
          <span className="bulmacaGecisSimgesi" aria-hidden="true">✓</span>
          <span className="bulmacaGecisYazi">Sıradaki bulmaca</span>
        </div>
      ) : null}

      {durum.bitti && (
        <>
          <Konfeti yogun={durum.bitti === "altin"} />
          <div className="kodlaKutlama" role="status" onPointerDown={duraktanTekrarBasla}>
            <div className="kutlamaKutusu" onPointerDown={(olay) => olay.stopPropagation()}>
              <span
                className={`kodlaKutlamaYildiz${durum.bitti === "altin" ? " altin" : ""}`}
                aria-hidden="true"
              >
                {durum.bitti === "altin" ? "🌟" : "⭐"}
              </span>
            <p>{durum.bitti === "altin" ? "Harika! En kısa yol!" : "Aferin!"}</p>
            {sonrakiBolumId ? (
              <Link href={`/kodla/${kursId}/${sonrakiBolumId}/`} className="calistirDugmesi">
                Sonraki durak <span aria-hidden="true">➡</span>
              </Link>
            ) : (
              <Link href={`/kodla/${kursId}/`} className="calistirDugmesi">
                Duraklar
              </Link>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
