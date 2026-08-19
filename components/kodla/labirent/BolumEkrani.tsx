"use client";

// Bolumun tamami: sahne, program seridi, palet ve calistirma.
//
// Durum tek bir nesnede tutulur. Ayri useState'lere bolmek Harfler ve
// Sayilar bolumunde gercek bir cokmeye yol acmisti: birlikte degismesi
// gereken degerler bir render boyunca birbirinden ayri kaliyordu.
import { useEffect, useState } from "react";
import Link from "next/link";
import { calistir, type Adim } from "@/lib/kodla/labirent/calistir";
import type { Komut, Yon } from "@/lib/kodla/labirent/komutlar";
import { kareAnahtari } from "@/lib/kodla/labirent/harita";
import { onizlemeYolu } from "@/lib/kodla/labirent/onizleme";
import { temaBul } from "@/lib/kodla/labirent/temalar";
import { blokEkle, programiTemizle, sonBlokuSil } from "@/lib/kodla/program";
import { bolumHaritasi, type BolumVerisi } from "@/lib/kodla/bolumler";
import { bolumSonucuKaydet, denemeArtir, type YildizTuru } from "@/lib/kodla/ilerleme";
import Sahne from "./Sahne";
import KomutPaleti from "./KomutPaleti";
import ProgramSeridi from "./ProgramSeridi";
import type { TurnaPozu } from "./Simgeler";
import "../kodla.css";

const ADIM_SURESI = 450;

type Durum = {
  program: Komut[];
  oynatma: { adimlar: Adim[]; sira: number } | null;
  vurgulanan: number | null;
  turna: { x: number; y: number; bakis: Yon };
  poz: TurnaPozu;
  toplananlar: string[];
  bitti: YildizTuru | null;
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
  const harita = bolumHaritasi(bolum);
  const tema = temaBul(bolum.tema);
  const baslangicTurna = { ...harita.baslangic, bakis: harita.bakis };

  const [durum, setDurum] = useState<Durum>({
    program: [],
    oynatma: null,
    vurgulanan: null,
    turna: baslangicTurna,
    poz: "durus",
    toplananlar: [],
    bitti: null,
  });

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
      if (sonAdim) {
        if (adim.olay === "vardi") {
          kazanilan = durum.program.length <= bolum.idealAdim ? "altin" : "yildiz";
          bolumSonucuKaydet(kursId, bolum.id, kazanilan);
        } else {
          denemeArtir(kursId, bolum.id);
        }
      }

      setDurum((onceki) => ({
        ...onceki,
        turna: { x: adim.turna.x, y: adim.turna.y, bakis: adim.turna.bakis },
        toplananlar:
          adim.olay === "topladi"
            ? [...onceki.toplananlar, kareAnahtari(adim.turna)]
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
      }));
    }, ADIM_SURESI);

    return () => clearTimeout(zamanlayici);
  }, [durum.oynatma, durum.program.length, bolum.idealAdim, bolum.id, kursId]);

  // Kosu bitince poz dinlenme haline doner. Tek blokluk bir carpmada
  // "carpma" pozunu temizleyecek baska bir adim olmadigi icin gerekli.
  useEffect(() => {
    if (durum.oynatma || durum.bitti) return;
    if (durum.poz === "durus") return;
    const zamanlayici = setTimeout(() => {
      setDurum((onceki) => ({ ...onceki, poz: "durus" }));
    }, 400);
    return () => clearTimeout(zamanlayici);
  }, [durum.oynatma, durum.bitti, durum.poz]);

  const calisiyor = durum.oynatma !== null;

  function blokEklendi(komut: Komut) {
    setDurum((onceki) => ({ ...onceki, program: blokEkle(onceki.program, komut) }));
  }

  function bastanBasla() {
    setDurum((onceki) => ({
      ...onceki,
      turna: baslangicTurna,
      poz: "durus",
      toplananlar: [],
      vurgulanan: null,
      oynatma: null,
      bitti: null,
    }));
  }

  function calistirmayiBaslat() {
    const sonuc = calistir(durum.program, harita);
    if (sonuc.adimlar.length === 0) return;
    setDurum((onceki) => ({
      ...onceki,
      turna: baslangicTurna,
      poz: "durus",
      toplananlar: [],
      bitti: null,
      vurgulanan: null,
      oynatma: { adimlar: sonuc.adimlar, sira: 0 },
    }));
  }

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
      </div>

      <div className="sahneAlani">
        <Sahne
          harita={harita}
          tema={tema}
          turna={durum.turna}
          poz={durum.poz}
          bekliyor={!calisiyor}
          yol={yol}
          calisan={durum.vurgulanan}
          toplananlar={durum.toplananlar}
          vardi={durum.bitti !== null}
          bolumAdi={bolum.ad}
        />
      </div>

      <ProgramSeridi program={durum.program} vurgulanan={durum.vurgulanan} />

      <div className="bolumAltBar">
        <KomutPaleti seti={bolum.komutSeti} kilitli={calisiyor} onEkle={blokEklendi} />

        <div className="bolumKontrolleri">
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Son bloğu sil"
            disabled={calisiyor || durum.program.length === 0}
            onClick={() => setDurum((o) => ({ ...o, program: sonBlokuSil(o.program) }))}
          >
            <span aria-hidden="true">↩</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Hepsini temizle"
            disabled={calisiyor || durum.program.length === 0}
            onClick={() => setDurum((o) => ({ ...o, program: programiTemizle() }))}
          >
            <span aria-hidden="true">🗑</span>
          </button>
          <button
            type="button"
            className="kodlaYardimciDugme"
            aria-label="Turna'yı başa al"
            disabled={calisiyor}
            onClick={bastanBasla}
          >
            <span aria-hidden="true">↺</span>
          </button>
          <button
            type="button"
            className="calistirDugmesi"
            aria-label="Çalıştır"
            disabled={calisiyor || durum.program.length === 0}
            onClick={calistirmayiBaslat}
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>

      <p className="bolumIpucu">{bolum.ipucu}</p>

      {durum.bitti && (
        <div className="kodlaKutlama" role="status" onPointerDown={bastanBasla}>
          <div className="kutlamaKutusu" onPointerDown={(olay) => olay.stopPropagation()}>
            <span className="kodlaKutlamaYildiz" aria-hidden="true">
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
      )}
    </div>
  );
}
