"use client";

// Desen duraginin tamami: sahne, program seridi, palet ve calistirma.
//
// Labirent bolumunun (components/kodla/labirent/BolumEkrani.tsx) kardesi:
// serit, palet, katlama cipi, nokta gostergesi ve ilerleme kaydi AYNI
// bilesenlerden gelir; ayrilan tek sey sahne ve motor. Iki ekran tek bir
// bilesende birlestirilmedi, cunku labirent ekrani sessiz demo, basak
// toplama ve carpma pozlari gibi yalnizca ona ait bir surunun tasiyor;
// ortak kabugu paylasmak icin ikisini birbirine bagli iki mekanik haline
// getirmek, iki dosyayi ayri tutmaktan pahaliya gelirdi.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ciz, type CizimAdimi } from "@/lib/kodla/desen/ciz";
import type { Komut } from "@/lib/kodla/labirent/komutlar";
import { katla, katlamaOnerisi } from "@/lib/kodla/katlama";
import {
  blokEkle,
  blokSayisi,
  blokSil,
  kezDegistir,
  programAyniMi,
  sonBlokuSil,
  tekrarEkle,
  EN_FAZLA_BLOK,
  type Blok,
  type BlokYolu,
} from "@/lib/kodla/program";
import {
  baslangicProgrami,
  bulmacaBul,
  bulmacaDeseni,
  bulmacaSayisi,
  type DesenBolumu,
  type DesenBulmacasi,
} from "@/lib/kodla/bolumler";
import { baslangicBulmacasi, bulmacaSonrasi } from "@/lib/kodla/durak";
import { temaBul } from "@/lib/kodla/labirent/temalar";
import { varsayilanKarakter } from "@/lib/kodla/karakterler";
import {
  bolumSonucuKaydet,
  bulmacaCozuldu,
  denemeArtir,
  durakIlerlemesi,
  durakIlerlemesiniSil,
  seciliKarakter,
  type YildizTuru,
} from "@/lib/kodla/yerelKayit";
import {
  ADIM_SURESI,
  GECIS_SURESI,
  POZ_SIFIRLAMA_GECIKMESI,
  VARIS_BEKLEME_SURESI,
} from "../zamanlama";
import ProgramSeridi from "../labirent/ProgramSeridi";
import KomutPaleti from "../labirent/KomutPaleti";
import KatlamaCipi from "../labirent/KatlamaCipi";
import BulmacaNoktalari from "../labirent/BulmacaNoktalari";
import Konfeti from "../labirent/Konfeti";
import { VARSAYILAN_PALET, type KarakterPozu } from "../labirent/Simgeler";
import DesenSahne from "./DesenSahne";
import "../kodla.css";

type Durum = {
  program: Blok[];
  sonEklenen: BlokYolu | null;
  acikKutu: number | null;
  oynatma: { adimlar: CizimAdimi[]; sira: number } | null;
  vurgulanan: BlokYolu | null;
  /** Su ana kadar cizilmis kenarlar. */
  cizilenler: string[];
  karakterKonumu: { x: number; y: number; bakis: "yukari" | "asagi" | "sol" | "sag" };
  poz: KarakterPozu;
  bitti: YildizTuru | null;
  bulmacaSirasi: number;
  gecis: boolean;
  sonrakiHazirlaniyor: boolean;
};

/** Bulmacanin baslangic konumu; bulmacaSirasi ile AYNI commit'te yazilir. */
function bulmacaBaslangicKonumu(bolum: DesenBolumu, sira: number) {
  const bulmaca = bulmacaBul(bolum, sira) ?? bolum.bulmacalar[0];
  return { ...bulmacaDeseni(bulmaca).baslangic };
}

function bulmacaBaslangicKutusu(bulmaca: DesenBulmacasi): number | null {
  if (bulmaca.kucak?.asama !== "hazir") return null;
  const sira = baslangicProgrami(bulmaca).findIndex((blok) => blok.tur === "tekrar");
  return sira === -1 ? null : sira;
}

export default function DesenEkrani({
  kursId,
  bolum,
  sonrakiBolumId,
}: {
  kursId: string;
  bolum: DesenBolumu;
  sonrakiBolumId: string | null;
}) {
  const toplamBulmaca = bulmacaSayisi(bolum);
  const [karakter, setKarakter] = useState(() => varsayilanKarakter(kursId));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKarakter(seciliKarakter(kursId));
  }, [kursId]);

  const [durum, setDurum] = useState<Durum>(() => ({
    program: baslangicProgrami(bolum.bulmacalar[0]),
    sonEklenen: null,
    acikKutu: bulmacaBaslangicKutusu(bolum.bulmacalar[0]),
    oynatma: null,
    vurgulanan: null,
    cizilenler: [],
    karakterKonumu: bulmacaBaslangicKonumu(bolum, 0),
    poz: "durus",
    bitti: null,
    bulmacaSirasi: 0,
    gecis: false,
    sonrakiHazirlaniyor: false,
  }));

  // Durak kaldigi yerden devam eder; bitmis durak bastan baslar.
  useEffect(() => {
    const ilerleme = durakIlerlemesi(kursId, bolum.id);
    const baslangic = baslangicBulmacasi(ilerleme.cozulen, toplamBulmaca);
    if (ilerleme.cozulen >= toplamBulmaca) durakIlerlemesiniSil(kursId, bolum.id);
    if (baslangic === 0) return;
    const acilan = bulmacaBul(bolum, baslangic) ?? bolum.bulmacalar[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum((onceki) => ({
      ...onceki,
      bulmacaSirasi: baslangic,
      karakterKonumu: bulmacaBaslangicKonumu(bolum, baslangic),
      program: baslangicProgrami(acilan),
      acikKutu: bulmacaBaslangicKutusu(acilan),
    }));
  }, [kursId, bolum, toplamBulmaca]);

  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  const bulmaca = bulmacaBul(bolum, durum.bulmacaSirasi) ?? bolum.bulmacalar[0];
  const desen = bulmacaDeseni(bulmaca);
  const hazirProgram = baslangicProgrami(bulmaca);
  const calisiyor = durum.oynatma !== null;
  const girdiEngelli = calisiyor || durum.bitti !== null || durum.gecis || durum.sonrakiHazirlaniyor;
  const oynananBlokAdedi = blokSayisi(durum.program);

  // Adimlari sirayla oynatir; son adimda sonucu kaydeder.
  useEffect(() => {
    if (!durum.oynatma) return;
    const { adimlar, sira } = durum.oynatma;
    const adim = adimlar[sira];
    const sonAdim = sira === adimlar.length - 1;

    const zamanlayici = setTimeout(() => {
      let kazanilan: YildizTuru | null = null;
      let sonrakiBulmacaVar = false;
      if (sonAdim) {
        if (adim.olay === "bitti") {
          const idealMi = oynananBlokAdedi <= bulmaca.idealAdim;
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
        karakterKonumu: { ...adim.karakter },
        cizilenler:
          adim.kenar !== undefined && !onceki.cizilenler.includes(adim.kenar)
            ? [...onceki.cizilenler, adim.kenar]
            : onceki.cizilenler,
        poz:
          adim.olay === "carpti"
            ? "carpma"
            : adim.olay === "bitti"
              ? "kutlama"
              : adim.olay === "cizdi"
                ? onceki.poz === "adim"
                  ? "durus"
                  : "adim"
                : onceki.poz,
        vurgulanan: sonAdim && !kazanilan ? null : adim.blokYolu,
        oynatma: sonAdim ? null : { adimlar, sira: sira + 1 },
        bitti: kazanilan,
        sonrakiHazirlaniyor: sonrakiBulmacaVar,
      }));
    }, ADIM_SURESI);

    return () => clearTimeout(zamanlayici);
  }, [
    durum.oynatma,
    oynananBlokAdedi,
    durum.bulmacaSirasi,
    bulmaca.idealAdim,
    toplamBulmaca,
    bolum.id,
    kursId,
  ]);

  // Kosu bitince poz dinlenme haline doner. Son adim bir carpmaysa (program
  // izgaranin disina yuruyerek biter, denerken sik olur) baska bir adim
  // gelmedigi icin kus o pozda kalirdi. Labirent ekranindaki ayni etki;
  // sonrakiHazirlaniyor penceresinde ATLANIR, cunku orada poz "kutlama"dir.
  useEffect(() => {
    if (calisiyor || durum.poz === "durus" || durum.sonrakiHazirlaniyor) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, poz: "durus" })),
      POZ_SIFIRLAMA_GECIKMESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [calisiyor, durum.poz, durum.sonrakiHazirlaniyor]);

  // Kutlama pozu bir "nefes" ekranda kalsin diye gecis perdesi hemen degil,
  // bu bayrak kapaninca acilir (labirent ekranindaki ayni kuplaj).
  useEffect(() => {
    if (!durum.sonrakiHazirlaniyor) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, sonrakiHazirlaniyor: false, gecis: true })),
      VARIS_BEKLEME_SURESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [durum.sonrakiHazirlaniyor]);

  // Gecis perdesi kalkinca siradaki bulmaca kurulur.
  useEffect(() => {
    if (!durum.gecis) return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => {
        const yeniSira = onceki.bulmacaSirasi + 1;
        const yeniBulmaca = bulmacaBul(bolum, yeniSira) ?? bolum.bulmacalar[0];
        return {
          ...onceki,
          bulmacaSirasi: yeniSira,
          karakterKonumu: bulmacaBaslangicKonumu(bolum, yeniSira),
          program: baslangicProgrami(yeniBulmaca),
          acikKutu: bulmacaBaslangicKutusu(yeniBulmaca),
          cizilenler: [],
          gecis: false,
          oynatma: null,
          sonEklenen: null,
          vurgulanan: null,
          poz: "durus",
          bitti: null,
        };
      });
    }, GECIS_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.gecis, bolum]);

  function blokEklendi(komut: Komut) {
    setDurum((onceki) => {
      const program = blokEkle(
        onceki.program,
        komut,
        bulmaca.enFazlaBlok ?? EN_FAZLA_BLOK,
        onceki.acikKutu,
      );
      if (blokSayisi(program) === blokSayisi(onceki.program)) return { ...onceki, program };
      const acikKucak = onceki.acikKutu === null ? undefined : program[onceki.acikKutu];
      const sonEklenen =
        acikKucak !== undefined && acikKucak.tur === "tekrar"
          ? { ust: onceki.acikKutu!, ic: acikKucak.govde.length - 1 }
          : { ust: program.length - 1, ic: null };
      return { ...onceki, program, sonEklenen };
    });
  }

  function blogaDokunuldu(yol: BlokYolu) {
    setDurum((onceki) => {
      const program = blokSil(onceki.program, yol);
      if (program === onceki.program) return onceki;
      const acikKutu =
        onceki.acikKutu !== null && yol.ic === null && yol.ust < onceki.acikKutu
          ? onceki.acikKutu - 1
          : onceki.acikKutu;
      return { ...onceki, program, acikKutu, sonEklenen: null };
    });
  }

  /**
   * Geri al: seritte en sonda gorunen blogu siler.
   *
   * Acik kucagin adresi de yenileniyor: silinen blok kucagin KENDISIYSE ya
   * da onunden bir blok gittiyse, eski adres ya bos bir yeri ya da baska
   * bir blogu gosterirdi. O adres bozuk kalirsa paletten eklenen her blok
   * sessizce kaybolur (blokEkle gecersiz hedef kutuyu reddeder).
   */
  function sonBlokSilindi() {
    setDurum((onceki) => {
      const program = sonBlokuSil(onceki.program);
      const kutu = onceki.acikKutu === null ? undefined : program[onceki.acikKutu];
      return {
        ...onceki,
        program,
        acikKutu: kutu !== undefined && kutu.tur === "tekrar" ? onceki.acikKutu : null,
        sonEklenen: null,
      };
    });
  }

  function kucagaDokunuldu(ust: number) {
    setDurum((onceki) => ({ ...onceki, acikKutu: onceki.acikKutu === ust ? null : ust }));
  }

  function noktalaraDokunuldu(ust: number) {
    setDurum((onceki) => ({
      ...onceki,
      program: kezDegistir(onceki.program, ust),
      sonEklenen: null,
    }));
  }

  function kutuEklendi() {
    setDurum((onceki) => {
      const program = tekrarEkle(onceki.program, bulmaca.enFazlaBlok ?? EN_FAZLA_BLOK);
      if (program === onceki.program) return onceki;
      const ust = program.length - 1;
      return { ...onceki, program, acikKutu: ust, sonEklenen: { ust, ic: null } };
    });
  }

  function katlandi() {
    setDurum((onceki) => {
      const oneri = katlamaOnerisi(onceki.program);
      if (oneri === null) return onceki;
      return { ...onceki, program: katla(onceki.program, oneri), acikKutu: null, sonEklenen: null };
    });
  }

  /** Tahtayi temizler ama programa dokunmaz: "kusu basa al". */
  function bastanBasla() {
    setDurum((onceki) => ({
      ...onceki,
      karakterKonumu: { ...desen.baslangic },
      cizilenler: [],
      poz: "durus",
      vurgulanan: null,
      oynatma: null,
      bitti: null,
    }));
  }

  function duraktanTekrarBasla() {
    durakIlerlemesiniSil(kursId, bolum.id);
    setDurum({
      program: baslangicProgrami(bolum.bulmacalar[0]),
      sonEklenen: null,
      acikKutu: bulmacaBaslangicKutusu(bolum.bulmacalar[0]),
      oynatma: null,
      vurgulanan: null,
      cizilenler: [],
      karakterKonumu: bulmacaBaslangicKonumu(bolum, 0),
      poz: "durus",
      bitti: null,
      bulmacaSirasi: 0,
      gecis: false,
      sonrakiHazirlaniyor: false,
    });
  }

  function calistirmayiBaslat() {
    // Cift-odul korumasi dugmedeki disabled niteliginde YASAYAMAZ: cagri
    // klavyeden veya yardimci teknolojiden de gelebilir.
    if (girdiEngelli) return;
    const sonuc = ciz(durum.program, desen);
    if (sonuc.adimlar.length === 0) return;
    setDurum((onceki) => ({
      ...onceki,
      karakterKonumu: { ...desen.baslangic },
      cizilenler: [],
      poz: "durus",
      vurgulanan: null,
      bitti: null,
      oynatma: { adimlar: sonuc.adimlar, sira: 0 },
    }));
  }

  // Geri al, baslangic programinin ALTINA inmez: hazir gelen kucak
  // bulmacanin mobilyasidir. Temizle ise BASKA bir soruya cevap verir --
  // "bastan dene" -- ve program baslangictan her farkli oldugunda acik
  // olmali. Ikisini tek olcuye baglamak, hata ayiklama duraginda bir blok
  // silen cocugun temizle dugmesini de kapatiyordu: geri donusu olmayan
  // tek yol oydu.
  const silinebilir = !girdiEngelli && oynananBlokAdedi > blokSayisi(hazirProgram);
  const temizlenebilir = !girdiEngelli && !programAyniMi(durum.program, hazirProgram);
  const katlama =
    bulmaca.kucak !== undefined && bulmaca.kucak.asama !== "hazir" && !girdiEngelli
      ? katlamaOnerisi(durum.program)
      : null;

  // Onizleme gercek motordan uretilir; "onizlemede baska, calisinca baska"
  // durumu yapisal olarak imkansiz.
  const onizleme = ciz(durum.program, desen).cizilenler;

  return (
    <div className="bolumEkrani">
      <div className="bolumUstBar">
        <Link href={`/kodla/${kursId}/`} className="geriDugmesi">
          <span aria-hidden="true">←</span> Duraklar
        </Link>
        <h1 className="bolumAdi">{bolum.ad}</h1>
        {toplamBulmaca > 1 ? (
          <BulmacaNoktalari
            toplam={toplamBulmaca}
            doluSira={durum.bulmacaSirasi}
            etiket={`${bolum.ad}: ${toplamBulmaca} bulmacadan ${durum.bulmacaSirasi + 1}. bulmaca`}
          />
        ) : null}
      </div>

      <div className="sahneAlani">
        <DesenSahne
          desen={desen}
          tema={temaBul(bolum.tema)}
          onizleme={onizleme}
          cizilenler={durum.cizilenler}
          karakterKonumu={durum.karakterKonumu}
          poz={durum.poz}
          bulmacaSirasi={durum.bulmacaSirasi}
          palet={karakter?.palet ?? VARSAYILAN_PALET}
          bekliyor={!calisiyor}
          bitti={durum.bitti !== null || durum.sonrakiHazirlaniyor || durum.gecis}
          bolumAdi={bolum.ad}
        />
      </div>

      <ProgramSeridi
        program={durum.program}
        vurgulanan={durum.vurgulanan}
        sonEklenen={durum.sonEklenen}
        acikKutu={durum.acikKutu}
        kilitli={girdiEngelli}
        onKucakDokun={kucagaDokunuldu}
        onNoktalarDokun={noktalaraDokunuldu}
        onBlokDokun={blogaDokunuldu}
      />

      {katlama !== null ? (
        <KatlamaCipi oneri={katlama} program={durum.program} onKatla={katlandi} />
      ) : null}

      <div className="bolumAltBar">
        <KomutPaleti
          seti={bulmaca.komutSeti}
          kilitli={girdiEngelli}
          onEkle={blokEklendi}
          hayalet={null}
          nabiz={!girdiEngelli && durum.program.length === 0}
          kutuEklenebilir={bulmaca.kucak?.asama === "serbest"}
          onKutuEkle={kutuEklendi}
        />

        <div className="bolumKontrolleri">
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Son bloğu sil"
            disabled={!silinebilir}
            onClick={sonBlokSilindi}
          >
            <span aria-hidden="true">↩</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Hepsini temizle"
            disabled={!temizlenebilir}
            onClick={() =>
              setDurum((o) => ({
                ...o,
                program: hazirProgram,
                acikKutu: bulmacaBaslangicKutusu(bulmaca),
                sonEklenen: null,
              }))
            }
          >
            <span aria-hidden="true">🗑</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Kuşu başa al"
            disabled={girdiEngelli}
            onClick={bastanBasla}
          >
            <span aria-hidden="true">↺</span>
          </button>
          <button
            type="button"
            className={`calistirDugmesi${
              !girdiEngelli && durum.program.length > 0 ? " nabiz" : ""
            }`}
            aria-label="Çalıştır"
            disabled={girdiEngelli || durum.program.length === 0}
            onClick={calistirmayiBaslat}
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>

      <p className="bolumIpucu">{bolum.ipucu}</p>

      {durum.gecis ? (
        <div className="bulmacaGecisi" role="status">
          <BulmacaNoktalari
            toplam={toplamBulmaca}
            doluSira={durum.bulmacaSirasi}
            yeniDolanSira={durum.bulmacaSirasi}
            buyuk
            etiket={`${durum.bulmacaSirasi + 1}. bulmaca bitti`}
          />
          <span className="bulmacaGecisYazi">Sıradaki bulmaca</span>
        </div>
      ) : null}

      {durum.bitti && (
        <div className="kodlaKutlama" role="status" onPointerDown={duraktanTekrarBasla}>
          <div className="kutlamaKutusu" onPointerDown={(olay) => olay.stopPropagation()}>
            <Konfeti yogun={durum.bitti === "altin"} />
            <span className={`kodlaKutlamaYildiz ${durum.bitti}`} aria-hidden="true">
              {durum.bitti === "altin" ? "🌟" : "⭐"}
            </span>
            {/* Labirentte "en kisa yol", cizimde "en kisa cizim": olcu ayni
                (blok sayisi ideali gecmedi) ama cocugun gordugu sey farkli. */}
            <p>{durum.bitti === "altin" ? "Harika! En kısa çizim!" : "Aferin!"}</p>
            {sonrakiBolumId ? (
              <Link href={`/kodla/${kursId}/${sonrakiBolumId}/`} className="kodlaYardimciDugme">
                Sonraki durak
              </Link>
            ) : (
              <Link href={`/kodla/${kursId}/`} className="kodlaYardimciDugme">
                Duraklar
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
