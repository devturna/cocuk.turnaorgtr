// Durak isaretlerinin harita uzerindeki YERLESIMI.
//
// Gercek cografi konumlar yakin duraklari ust uste getirir: on bes durak
// dar bir ekranda birbirini yutar (Sultansazligi ile Kapadokya arasinda
// yaklasik 100 km var, telefonda bu on pikseldir). Cozum
// docs/kodlama-bolumu-hazirlama.md'de yazili: isaret gercek noktasindan
// hafifce kaydirilir ve kisa bir KILAVUZ CIZGIYLE asil noktaya baglanir.
// Koordinatin kendisi degismez, yalnizca cizimi kayar.
//
// Burasi React bilmez ve olcum yapmaz: saf geometri.

/** Yuzde konum (haritanin sol ust kosesi 0,0). */
export type Nokta = { x: number; y: number };

export type Yerlesim = {
  /** Isaretin cizilecegi yer. */
  cizim: Nokta;
  /** Gercek cografi konum; kilavuz cizgi buraya baglanir. */
  gercek: Nokta;
  /** Isaret gercek noktasindan gorunur bicimde kaydi mi. */
  kaydi: boolean;
};

// Harita silueti 1000x422 birimlik bir kutu: dikey bir yuzde, yatay bir
// yuzdenin ancak bu kadarina denk gelir. Mesafeler bu carpanla duzeltilmezse
// yerlesim dikeyde gereginden az, yatayda gereginden cok iter.
const EN_BOY_ORANI = 422 / 1000;

// Bir isaretin varsayilan yariciapi, haritanin GENISLIGININ yuzdesi olarak.
// Telefonda harita yaklasik 390 piksel genisliginde ve isaret 48 piksel:
// 24/390 ≈ %6. Cagiran taraf gercek genisligi olctuyse kendi degerini
// verir -- genis ekranda isaretler zaten sigar ve haritayi bosuna
// dagitmanin alemi yoktur.
const VARSAYILAN_YARICAP = 6;

// Kaydirmanin gorunur sayilmasi icin gereken en kucuk mesafe. Bunun
// altindaki kaymalar icin kilavuz cizgi cizilmez: cizgi isaretin altinda
// kalir ve yalnizca gurultu olur.
const GORUNUR_KAYMA = 1.2;

/**
 * Bir isaret gercek noktasindan en fazla bu kadar kayabilir (harita
 * genisliginin yuzdesi).
 *
 * Sinir OLMAZSA cakisma butun kumeye yayilir: bir yerdeki itme komsuyu,
 * o da bir sonrakini iter ve harita cografya olmaktan cikip bir yildiz
 * yiginina doner. Sinirla birlikte, birbirine cok yakin duraklar tam
 * ayrilamayabilir; orada ust uste binen isaretlerden ustteki her zaman
 * cocugun su an isi olan duraktir (z-index sira ile verilir).
 */
const EN_FAZLA_KAYMA = 5;

// Itme kac tur tekrarlanir. Her tur cakisan her cifti biraz ayirir; birkac
// tur sonra kume acilir. Sabit sayi, cunku sonuc HER ZAMAN ayni olmali:
// yerlesim bir animasyon degil, deterministik bir cizim.
const TUR_SAYISI = 60;

/** Isareti gercek noktasindan en fazla EN_FAZLA_KAYMA kadar uzakta tutar. */
function kaymayiSinirla(cizim: Nokta, gercek: Nokta): Nokta {
  const kayma = uzaklik(cizim, gercek);
  if (kayma <= EN_FAZLA_KAYMA) return cizim;
  const oran = EN_FAZLA_KAYMA / kayma;
  return {
    x: gercek.x + (cizim.x - gercek.x) * oran,
    y: gercek.y + (cizim.y - gercek.y) * oran,
  };
}

function uzaklik(a: Nokta, b: Nokta): number {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) * EN_BOY_ORANI;
  return Math.hypot(dx, dy);
}

/**
 * Cakisan isaretleri birbirinden iter ve her birinin gercek noktasini
 * yaninda tutar.
 *
 * `yerlesimeGirenler` yalnizca DOKUNULABILIR duraklar icin anlamlidir:
 * kilitli bir durak zaten dokunmayi yutmaz ve suslu bir isaretten
 * ibarettir, onu itmek haritayi bosuna dagitir.
 */
export function duraklariYay(
  noktalar: Nokta[],
  yaricap: number = VARSAYILAN_YARICAP,
): Yerlesim[] {
  const cizimler = noktalar.map((nokta) => ({ ...nokta }));

  for (let tur = 0; tur < TUR_SAYISI; tur++) {
    let cakisanVar = false;

    for (let i = 0; i < cizimler.length; i++) {
      for (let j = i + 1; j < cizimler.length; j++) {
        const mesafe = uzaklik(cizimler[i], cizimler[j]);
        const gereken = yaricap * 2;
        if (mesafe >= gereken) continue;
        cakisanVar = true;

        // Tam ust uste duran iki isaretin yonu yoktur; sabit bir yone
        // (yatay) itiyoruz ki sonuc rastgele olmasin.
        const dx = mesafe === 0 ? 1 : (cizimler[i].x - cizimler[j].x) / mesafe;
        const dy = mesafe === 0 ? 0 : ((cizimler[i].y - cizimler[j].y) * EN_BOY_ORANI) / mesafe;
        const itme = (gereken - mesafe) / 2;

        cizimler[i].x += dx * itme;
        cizimler[i].y += (dy * itme) / EN_BOY_ORANI;
        cizimler[j].x -= dx * itme;
        cizimler[j].y -= (dy * itme) / EN_BOY_ORANI;
      }
    }

    // Her turun sonunda isaretler gercek noktalarina geri cekilir: kayma
    // sinirdan buyukse o yonde sinira oturtulur.
    for (let i = 0; i < cizimler.length; i++) {
      cizimler[i] = kaymayiSinirla(cizimler[i], noktalar[i]);
    }

    if (!cakisanVar) break;
  }

  return cizimler.map((cizim, sira) => {
    // Isaret haritanin disina tasmasin: yaricap kadar kenardan iceride
    // kalir. Dikeyde sinir en-boy oraniyla olculur.
    const dikeyYaricap = yaricap / EN_BOY_ORANI;
    const sinirli = {
      x: Math.min(100 - yaricap, Math.max(yaricap, cizim.x)),
      y: Math.min(100 - dikeyYaricap, Math.max(dikeyYaricap, cizim.y)),
    };
    const gercek = noktalar[sira];
    return { cizim: sinirli, gercek, kaydi: uzaklik(sinirli, gercek) > GORUNUR_KAYMA };
  });
}
