"use client";

// Kursun bolum secim ekrani: Turkiye silueti ve uzerinde duraklar.
// Tamamlanan duraklar arasina kesik cizgi bir ucus yolu cizilir.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { BolumVerisi } from "@/lib/kodla/bolumler";
import { kursKarakterleri, varsayilanKarakter } from "@/lib/kodla/karakterler";
import { bolumAcikMi, bolumSonucu, karakterSec, secimSorulmaliMi, seciliKarakter, type YildizTuru } from "@/lib/kodla/yerelKayit";
import { KarakterSimgesi } from "./Simgeler";
import KarakterKartlari from "./KarakterKartlari";
import "../kodla.css";

export default function GocHaritasi({
  kursId,
  kursAdi,
  bolumler,
  haritaSvg,
}: {
  kursId: string;
  kursAdi: string;
  bolumler: BolumVerisi[];
  haritaSvg: string;
}) {
  const [sonuclar, setSonuclar] = useState<Record<string, YildizTuru | undefined>>({});
  // Ilk durak her zaman aciktir; bu bir kural, kayitli veri degil. Sunucuda
  // uretilen HTML'de de dogru olsun diye baslangic degeri burada kurulur,
  // boylece ilk durak kilitli gorunup effect calisinca acilmiyor.
  const [acilanlar, setAcilanlar] = useState<Record<string, boolean>>(() =>
    bolumler.length > 0 ? { [bolumler[0].id]: true } : {},
  );

  // useMemo sart: kursKarakterleri bilinmeyen bir kurs icin her cagrida
  // YENI bir bos dizi doner; asagidaki etkinin bagimlilik listesinde ham
  // cagri dursaydi bu sonsuz donguye girerdi.
  const karakterler = useMemo(() => kursKarakterleri(kursId), [kursId]);
  // Sunucuda uretilen HTML varsayilan kusu gosterir; secim ekrani ancak
  // tarayicida, gercekten secim yapilmamissa acilir. Boylece harita
  // "once kartlar acik sonra kapali" diye zipzalmaz.
  const [karakter, setKarakter] = useState(() => varsayilanKarakter(kursId));
  const [secimAcik, setSecimAcik] = useState(false);
  // Ilk giriste secim ZORUNLUDUR: arkada gecerli bir durum yok, Escape ile
  // kapatan cocuk kussuz bir haritada kalirdi. Madalyondan yeniden
  // acildiginda secim zaten var; orada vazgecmek gecerli bir cevaptir.
  const [secimZorunlu, setSecimZorunlu] = useState(false);

  // Kapanis turu (review): diyalog kapaninca odak <body>'ye dusmemeli -
  // duserse klavye kullanan cocuk belgenin basindan yeniden sekmelemek
  // zorunda kalir. Standart sozlesme odagi CAGIRANA geri verir; madalyondan
  // yeniden acilan yolda cagiran odur. Ilk giriste geri donulecek bir
  // cagiran yoktur (secim karttan yapilir, madalyona hic tiklanmamistir);
  // orada odagi ilk duraga koyuyoruz - cocugun bir sonraki dogal adimi
  // zaten oraya gitmektir, madalyon ise yalnizca "kusu degistir" gibi
  // ikincil bir eylemi tekrar sunar.
  const madalyonRef = useRef<HTMLButtonElement>(null);
  const haritaRef = useRef<HTMLDivElement>(null);
  // Kapanisin hangi yoldan geldigini (ilk giris mi, yeniden acilis mi)
  // asagidaki [secimAcik] etkisi calisana kadar tasir. null: henuz bir
  // kapanis olmadi (ilk mount'ta odak tasinmamali).
  const kapanisIlkGirisRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (secimAcik) return;
    const ilkGiristi = kapanisIlkGirisRef.current;
    if (ilkGiristi === null) return;
    kapanisIlkGirisRef.current = null;
    if (ilkGiristi) {
      haritaRef.current?.querySelector<HTMLAnchorElement>("a.gocDuragi")?.focus();
    } else {
      madalyonRef.current?.focus();
    }
  }, [secimAcik]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKarakter(seciliKarakter(kursId));
    const sorulmali = secimSorulmaliMi(kursId, karakterler);
    setSecimAcik(sorulmali);
    setSecimZorunlu(sorulmali);
  }, [kursId, karakterler]);

  function karakteriSec(karakterId: string) {
    kapanisIlkGirisRef.current = secimZorunlu;
    karakterSec(kursId, karakterId);
    setKarakter(seciliKarakter(kursId));
    setSecimAcik(false);
    setSecimZorunlu(false);
  }

  function secimiKapat() {
    kapanisIlkGirisRef.current = secimZorunlu;
    setSecimAcik(false);
  }

  // Ilerleme yalnizca tarayicida bulunur; sayfa sunucuda uretilirken okunamaz.
  useEffect(() => {
    // sirali burada uretiliyor: render icinde uretilseydi her render'da yeni
    // bir dizi kimligi olusur ve bu etki sonsuz donguye girerdi.
    const sirali = bolumler.map((bolum) => bolum.id);
    const okunanSonuclar: Record<string, YildizTuru | undefined> = {};
    const okunanAcilanlar: Record<string, boolean> = {};
    for (const bolum of bolumler) {
      okunanSonuclar[bolum.id] = bolumSonucu(kursId, bolum.id);
      okunanAcilanlar[bolum.id] = bolumAcikMi(kursId, bolum.id, sirali);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSonuclar(okunanSonuclar);
    setAcilanlar(okunanAcilanlar);
  }, [kursId, bolumler]);

  // Bir durak tamamlandiysa kendisi ile sonraki durak arasina yol cizilir.
  const yolParcalari = bolumler.slice(0, -1).flatMap((bolum, sira) =>
    sonuclar[bolum.id] ? [{ baslangic: bolum.durak, bitis: bolumler[sira + 1].durak }] : [],
  );

  return (
    <div className="gocEkrani">
      {/*
        Secim ekrani acikken arkasindaki her sey `inert` olur. Ustunu
        opak bir ortuyle kapatmak yalnizca FAREYI durdurur; durak
        <Link>'leri DOM'da kalir ve sekme sirasindan cikmaz, yani
        klavyeyle Tab-Tab-Enter kus secmeden bir bolume girerdi. `inert`
        hem odagi hem erisilebilirlik agacini kapatir; React 19 bunu duz
        bir ozellik olarak geciriyor (bkz. e2e'deki "secim yapilmadan
        durak klavyeyle de acilamaz" testi).
      */}
      <h1 inert={secimAcik}>{kursAdi}</h1>

      {karakter && (
        <button
          type="button"
          ref={madalyonRef}
          inert={secimAcik}
          className="karakterMadalyonu"
          aria-label={`Kuşu değiştir: ${karakter.ad}`}
          onClick={() => setSecimAcik(true)}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <KarakterSimgesi yon="sag" poz="durus" palet={karakter.palet} />
          </svg>
          {/*
            Rozet: "buraya dokunursan degisir" bilgisini SEKILDE tasir, cunku
            aria-label ("Kusu degistir: ...") okuyamayan cocuga hicbir sey
            soylemez ve gorsel olarak madalyon suslu bir kus resminden farksiz
            durur. Takas oku ciftidir (ikon fontu yok, kutuphane yok - dogrudan
            cizilmis SVG). aria-hidden: madalyonun tek erisilebilir adi hala
            yukaridaki aria-label'dir, rozet ikinci bir dugme gibi OKUNMAZ.
            pointer-events: none (CSS): butonun kendi tiklama alanini asla
            bolmez, rozet sadece madalyonun UZERINE cizilir.
          */}
          <svg className="madalyonRozeti" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <circle cx="10" cy="10" r="9" fill="var(--vurgu)" stroke="var(--kenar)" strokeWidth="2" />
            <path
              d="M4 6H14M14 6L11 3.5M14 6L11 8.5M16 14H6M6 14L9 11.5M6 14L9 16.5"
              fill="none"
              stroke="var(--kenar)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="gocHaritasi" ref={haritaRef} inert={secimAcik}>
        {/*
          Silueti dogrudan basiyoruz. Icerik kullanicidan gelmiyor: depoya
          commit edilmis tek bir dosya derleme aninda okunuyor. Boyama
          bolumundeki ayni gerekce gecerli.
        */}
        <div
          className="gocSiluet"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: haritaSvg }}
        />

        <svg className="gocYolu" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {yolParcalari.map((parca, sira) => (
            <line
              key={sira}
              x1={parca.baslangic.x}
              y1={parca.baslangic.y}
              x2={parca.bitis.x}
              y2={parca.bitis.y}
              stroke="#33312e"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {bolumler.map((bolum, sira) => {
          const sonuc = sonuclar[bolum.id];
          const acik = acilanlar[bolum.id];
          // Gercek konumlar yakin duraklari ust uste getirebilir (Sultansazligi
          // ve Kapadokya gibi). Kilitli olanlar zaten dokunmayi yutmaz
          // (.gocDuragi.kilitli, pointer-events: none); acik/tamamlanmis
          // duraklar arasindaki cizim sirasi da CSS'e veya DOM sirasina
          // birakilmaz, her durak icin siraya gore acikca verilir.
          const konum = {
            left: `${bolum.durak.x}%`,
            top: `${bolum.durak.y}%`,
            zIndex: acik ? 2 + sira : 1,
          };
          const isaret = sonuc === "altin" ? "🌟" : sonuc === "yildiz" ? "⭐" : acik ? "🕊️" : "🔒";
          const sinif = `gocDuragi${sonuc ? " bitti" : ""}${acik ? "" : " kilitli"}`;

          if (!acik) {
            return (
              <div key={bolum.id} className={sinif} style={konum} aria-label={`${bolum.ad} kilitli`}>
                <span aria-hidden="true">{isaret}</span>
              </div>
            );
          }
          return (
            <Link
              key={bolum.id}
              href={`/kodla/${kursId}/${bolum.id}/`}
              className={sinif}
              style={konum}
              aria-label={`${sira + 1}. durak: ${bolum.ad}`}
            >
              <span aria-hidden="true">{isaret}</span>
            </Link>
          );
        })}
      </div>

      {secimAcik && (
        <KarakterKartlari
          karakterler={karakterler}
          onSec={karakteriSec}
          kapatilabilir={!secimZorunlu}
          onKapat={secimiKapat}
        />
      )}
    </div>
  );
}
