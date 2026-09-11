"use client";

// Olay duragi: cocuk "suna dokununca su olsun" kurallari yazar.
//
// Onceki iki mekanigin kabugundan bilerek AYRILIR: burada program seridi,
// palet ve calistir dugmesi yoktur, cunku programi calistiran sey cocugun
// kendi dokunusudur (docs/tasarim/kodlama-olaylar.md §1). Ortak kalan
// seyler ilerleme kaydi, nokta gostergesi ve kutlama katmanidir.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  EYLEMLER,
  istekTamamMi,
  kuralBul,
  kuralYaz,
  type Eylem,
  type Kural,
} from "@/lib/kodla/olay/kurallar";
import { bolumSiralamasi, bulmacaBul, bulmacaSayisi, type OlayBolumu } from "@/lib/kodla/bolumler";
import { baslangicBulmacasi, bulmacaSonrasi } from "@/lib/kodla/durak";
import {
  bolumSonucuKaydet,
  bulmacaCozuldu,
  demoGosterildi,
  demoGosterildiMi,
  durakIlerlemesi,
  durakIlerlemesiniSil,
  type YildizTuru,
} from "@/lib/kodla/yerelKayit";
import { BOSTA_SURESI, VARIS_BEKLEME_SURESI, GECIS_SURESI } from "../zamanlama";
import BulmacaNoktalari from "../labirent/BulmacaNoktalari";
import Konfeti from "../labirent/Konfeti";
import "../kodla.css";

const EYLEM_ADLARI: Record<Eylem, string> = {
  zipla: "Zıpla",
  ot: "Öt",
  don: "Dön",
  buyu: "Büyü",
};

// Ikonlar okunmaz, DENENIR: cocuk bir eyleme dokundugunda nesne onu hemen
// oynar. Bu yuzden ikonun tek isi ayirt edilebilir olmak; "buyu" icin
// buyutec (🔍) "ara" diye okunabiliyordu, disa dogru oklar daha yansiz.
const EYLEM_IKONLARI: Record<Eylem, string> = {
  zipla: "⬆",
  ot: "🎵",
  don: "🔄",
  buyu: "⤢",
};

// Bir eylemin ekranda surdugu sure. CSS'teki .olayNesnesi.oynuyor-*
// animasyonlariyla ayni: erken temizlenirse animasyon yarida kesilir.
const EYLEM_SURESI = 700;

type Durum = {
  kurallar: Kural[];
  /** Kural yazmak icin secili nesne; hicbiri secili degilse null. */
  secili: string | null;
  /** Su an eylemi oynayan nesne. */
  oynayan: string | null;
  bitti: YildizTuru | null;
  bulmacaSirasi: number;
  gecis: boolean;
  sonrakiHazirlaniyor: boolean;
};

/** Demo adimlari arasindaki bekleme; labirent demosuyla ayni ritim. */
const DEMO_ARALIGI = 1400;

export default function OlayEkrani({
  kursId,
  bolum,
  sonrakiBolumId,
}: {
  kursId: string;
  bolum: OlayBolumu;
  sonrakiBolumId: string | null;
}) {
  const toplamBulmaca = bulmacaSayisi(bolum);
  // Demo yalnizca kursun ilk duraginda ve kurs basina bir kez oynar.
  const ilkDurakDegil = bolumSiralamasi(kursId)[0] !== bolum.id;
  const [demo, setDemo] = useState<"nesne" | "eylem" | "izliyor" | null>(null);

  const [durum, setDurum] = useState<Durum>({
    kurallar: [],
    secili: null,
    oynayan: null,
    bitti: null,
    bulmacaSirasi: 0,
    gecis: false,
    sonrakiHazirlaniyor: false,
  });

  useEffect(() => {
    const ilerleme = durakIlerlemesi(kursId, bolum.id);
    const baslangic = baslangicBulmacasi(ilerleme.cozulen, toplamBulmaca);
    if (ilerleme.cozulen >= toplamBulmaca) durakIlerlemesiniSil(kursId, bolum.id);
    if (baslangic === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurum((onceki) => ({ ...onceki, bulmacaSirasi: baslangic }));
  }, [kursId, bolum, toplamBulmaca]);

  useEffect(() => {
    document.body.classList.add("tamEkran");
    return () => document.body.classList.remove("tamEkran");
  }, []);

  const bulmaca = bulmacaBul(bolum, durum.bulmacaSirasi) ?? bolum.bulmacalar[0];
  const istek = bulmaca.istek;
  const girdiEngelli =
    durum.bitti !== null || durum.gecis || durum.sonrakiHazirlaniyor || demo !== null;

  /**
   * Demonun yazacagi kural, bulmacanin ISTEDIGI kural DEGILDIR: aksi halde
   * cocugun ilk deneyimi, kendisi hic dokunmadan "kazanilmis" bir bulmaca
   * olurdu. Baska bir nesne ve baska bir eylem seciliyor.
   */
  const demoNesne =
    bulmaca.sahne.find((nesne) => nesne.id !== istek?.nesne) ?? bulmaca.sahne[0];
  const demoEylem: Eylem = EYLEMLER.find((eylem) => eylem !== istek?.eylem) ?? "zipla";

  useEffect(() => {
    if (ilkDurakDegil || demoGosterildiMi(kursId)) return;
    demoGosterildi(kursId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDemo("nesne");
  }, [ilkDurakDegil, kursId]);

  // Demo adimlari: nesneye "dokunur", bir eylem secer, eylemin oynamasini
  // bekler ve tahtayi tertemiz birakir.
  useEffect(() => {
    if (demo === null) return;

    if (demo === "nesne") {
      const zamanlayici = setTimeout(() => {
        setDurum((onceki) => ({ ...onceki, secili: demoNesne.id }));
        setDemo("eylem");
      }, DEMO_ARALIGI);
      return () => clearTimeout(zamanlayici);
    }

    if (demo === "eylem") {
      const zamanlayici = setTimeout(() => {
        setDurum((onceki) => ({
          ...onceki,
          kurallar: kuralYaz(onceki.kurallar, demoNesne.id, demoEylem),
          oynayan: demoNesne.id,
        }));
        setDemo("izliyor");
      }, DEMO_ARALIGI);
      return () => clearTimeout(zamanlayici);
    }

    // Eylem oynadi; bir nefes sonra tahta cocuga temiz gecer.
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({ ...onceki, kurallar: [], secili: null, oynayan: null }));
      setDemo(null);
    }, EYLEM_SURESI + VARIS_BEKLEME_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [demo, demoNesne, demoEylem]);

  // Cocuk uzun sure hicbir sey yapmazsa demo hatirlatma olarak tekrarlanir.
  useEffect(() => {
    if (ilkDurakDegil || demo !== null) return;
    if (durum.bulmacaSirasi !== 0 || durum.kurallar.length > 0 || durum.bitti) return;
    const zamanlayici = setTimeout(() => setDemo("nesne"), BOSTA_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [ilkDurakDegil, demo, durum.bulmacaSirasi, durum.kurallar.length, durum.bitti]);

  // Eylem animasyonu kendi kendine sonlanir: sahne hicbir zaman bozulmaz,
  // o yuzden temizlenecek bir "geri alma" da yok.
  useEffect(() => {
    if (durum.oynayan === null) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, oynayan: null })),
      EYLEM_SURESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [durum.oynayan]);

  useEffect(() => {
    if (!durum.sonrakiHazirlaniyor) return;
    const zamanlayici = setTimeout(
      () => setDurum((onceki) => ({ ...onceki, sonrakiHazirlaniyor: false, gecis: true })),
      VARIS_BEKLEME_SURESI,
    );
    return () => clearTimeout(zamanlayici);
  }, [durum.sonrakiHazirlaniyor]);

  useEffect(() => {
    if (!durum.gecis) return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({
        ...onceki,
        bulmacaSirasi: onceki.bulmacaSirasi + 1,
        kurallar: [],
        secili: null,
        oynayan: null,
        gecis: false,
        bitti: null,
      }));
    }, GECIS_SURESI);
    return () => clearTimeout(zamanlayici);
  }, [durum.gecis]);

  /**
   * Istegin karsilandigi ANDA bulmaca biter: calistirmaya gerek yok.
   *
   * Ilerleme kaydi setDurum GUNCELLEYICISININ DISINDA yaziliyor.
   * bulmacaCozuldu sayaci bir artirir ve localStorage'a yazar, yani
   * idempotent DEGILDIR; React guncelleyicileri iki kez cagirabildigi icin
   * (gelistirme kipindeki cift cagri) iceride yazmak tek bulmacayi iki
   * cozulmus gibi kaydeder ve cocuk bir sonraki girisinde bir bulmacayi
   * hic gormez.
   */
  function kurallariDegistir(yeniKurallar: Kural[]) {
    if (!istekTamamMi(yeniKurallar, istek)) {
      setDurum((onceki) => ({ ...onceki, kurallar: yeniKurallar }));
      return;
    }

    const ilerleme = bulmacaCozuldu(kursId, bolum.id, true);
    const sonrasi = bulmacaSonrasi(durum.bulmacaSirasi, toplamBulmaca, ilerleme.hepsiIdeal);
    if (sonrasi.tur === "bitti") {
      bolumSonucuKaydet(kursId, bolum.id, sonrasi.yildiz);
      setDurum((onceki) => ({
        ...onceki,
        kurallar: yeniKurallar,
        bitti: sonrasi.yildiz,
        secili: null,
      }));
      return;
    }
    setDurum((onceki) => ({
      ...onceki,
      kurallar: yeniKurallar,
      sonrakiHazirlaniyor: true,
      secili: null,
    }));
  }

  /**
   * Nesneye dokunmak IKI is birden yapar: nesneyi secer (bir eylem
   * secilirse kural ona yazilir) ve kurali varsa onu OYNATIR. Iki ayri mod
   * (yazma modu / oynama modu) bu yasta anlasilmaz; tek dokunusun iki
   * karsiligi olmasi ise dogal: "dokundum, bir sey oldu".
   */
  function nesneyeDokunuldu(nesneId: string) {
    if (girdiEngelli) return;
    const kural = kuralBul(durum.kurallar, nesneId);
    setDurum((onceki) => ({
      ...onceki,
      secili: nesneId,
      oynayan: kural === undefined ? null : nesneId,
    }));
  }

  function eylemSecildi(eylem: Eylem) {
    if (girdiEngelli || durum.secili === null) return;
    const nesneId = durum.secili;
    kurallariDegistir(kuralYaz(durum.kurallar, nesneId, eylem));
    setDurum((onceki) => ({ ...onceki, oynayan: nesneId }));
  }

  function duraktanTekrarBasla() {
    durakIlerlemesiniSil(kursId, bolum.id);
    setDurum({
      kurallar: [],
      secili: null,
      oynayan: null,
      bitti: null,
      bulmacaSirasi: 0,
      gecis: false,
      sonrakiHazirlaniyor: false,
    });
  }

  const istenenNesne =
    istek === undefined ? undefined : bulmaca.sahne.find((nesne) => nesne.id === istek.nesne);

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

      {/* Istek okunamaz, GORULUR: hangi nesneye dokununca ne olacagi iki
          simge ve bir okla anlatiliyor. Serbest oyun duraginda istek yok. */}
      {istek !== undefined && istenenNesne !== undefined ? (
        <div className="olayIstegi" role="note" aria-label={`İstek: ${istenenNesne.ad} dokununca ${EYLEM_ADLARI[istek.eylem].toLocaleLowerCase("tr")}`}>
          <span className="olayIstekSimgesi" aria-hidden="true">{istenenNesne.simge}</span>
          <span aria-hidden="true">👆</span>
          <span aria-hidden="true">→</span>
          <span className="olayIstekSimgesi" aria-hidden="true">{EYLEM_IKONLARI[istek.eylem]}</span>
        </div>
      ) : (
        <p className="olayIstegi olaySerbest">Ne istersen onu yap</p>
      )}

      <div className="sahneAlani">
        <div className="olaySahnesi">
          {bulmaca.sahne.map((nesne) => {
            const kural = kuralBul(durum.kurallar, nesne.id);
            const oynuyor = durum.oynayan === nesne.id && kural !== undefined;
            return (
              <button
                key={nesne.id}
                type="button"
                className={
                  `olayNesnesi${durum.secili === nesne.id ? " secili" : ""}` +
                  `${oynuyor ? ` oynuyor-${kural.eylem}` : ""}` +
                  `${demo === "nesne" && nesne.id === demoNesne.id ? " hayaletli" : ""}`
                }
                style={{ left: `${nesne.x}%`, top: `${nesne.y}%` }}
                aria-label={
                  kural === undefined
                    ? nesne.ad
                    : `${nesne.ad}: dokununca ${EYLEM_ADLARI[kural.eylem].toLocaleLowerCase("tr")}`
                }
                disabled={girdiEngelli}
                onClick={() => nesneyeDokunuldu(nesne.id)}
              >
                <span aria-hidden="true">{nesne.simge}</span>
                {kural !== undefined ? (
                  <span className="olayRozeti" aria-hidden="true">
                    {EYLEM_IKONLARI[kural.eylem]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kurallar: her satir tek bir cumledir. Yazi yok, iki simge ve bir ok. */}
      <div className="olayKurallari" role="list" aria-label="Kurallar">
        {durum.kurallar.map((kural) => {
          const nesne = bulmaca.sahne.find((aday) => aday.id === kural.nesne);
          if (nesne === undefined) return null;
          return (
            <span
              key={kural.nesne}
              role="listitem"
              className="olayKurali"
              aria-label={`${nesne.ad} dokununca ${EYLEM_ADLARI[kural.eylem].toLocaleLowerCase("tr")}`}
            >
              <span aria-hidden="true">{nesne.simge}</span>
              <span aria-hidden="true">👆</span>
              <span aria-hidden="true">→</span>
              <span aria-hidden="true">{EYLEM_IKONLARI[kural.eylem]}</span>
            </span>
          );
        })}
      </div>

      <div className="bolumAltBar">
        <div className="olayEylemleri" role="group" aria-label="Eylemler">
          {EYLEMLER.map((eylem) => (
            <button
              key={eylem}
              type="button"
              className={`komutDugmesi${
                demo === "eylem" && eylem === demoEylem ? " hayaletli" : ""
              }`}
              aria-label={EYLEM_ADLARI[eylem]}
              disabled={girdiEngelli || durum.secili === null}
              onClick={() => eylemSecildi(eylem)}
            >
              <span aria-hidden="true">{EYLEM_IKONLARI[eylem]}</span>
            </button>
          ))}
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
            <p>Senin oyunun!</p>
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
