"use client";

// Boyama ekraninin butun parcalarini birlestirir ve durumu yonetir.
// Cizim degistikce tarayiciya kaydedilir; hicbir veri cihazdan cikmaz.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  yeniGecmis,
  simdikiDurum,
  bolgeyiDoldur,
  fircaCizgisiEkle,
  sil,
  geriAl,
  geriAlinabilirMi,
  bastanBasla,
  type BoyamaGecmisi,
  type FircaCizgisi,
} from "@/lib/boyama/durum";
import { durumuKaydet, durumuYukle } from "@/lib/boyama/yerelKayit";
import { PALET, FIRCA_KALINLIKLARI } from "@/lib/boyama/renkler";
import Tuval, { type Arac } from "./Tuval";
import RenkPaleti from "./RenkPaleti";
import AracCubugu from "./AracCubugu";
import "./boyamaEkrani.css";

type BoyamaEkraniOzellikleri = {
  resimId: string;
  resimAdi: string;
  svgIcerigi: string;
  viewBox: string;
};

export default function BoyamaEkrani({
  resimId,
  resimAdi,
  svgIcerigi,
  viewBox,
}: BoyamaEkraniOzellikleri) {
  const [gecmis, setGecmis] = useState<BoyamaGecmisi>(() => yeniGecmis());
  const [arac, setArac] = useState<Arac>("kova");
  const [renk, setRenk] = useState(PALET[0].deger);
  const [kalinlik, setKalinlik] = useState(FIRCA_KALINLIKLARI[1]);
  // Kayit yuklenmeden yazma yapmayalim; yoksa bos tuval kaydin uzerine biner.
  const [yuklendi, setYuklendi] = useState(false);

  // Kayitli cizim sadece tarayicida bulunur; sayfa sunucuda uretilirken localStorage yoktur.
  // Bu yuzden okuma ancak ekran acildiktan sonra yapilabilir ve state'e burada yazilir.
  useEffect(() => {
    const kayitli = durumuYukle(resimId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (kayitli) setGecmis(yeniGecmis(kayitli));
    setYuklendi(true);
  }, [resimId]);

  const durum = simdikiDurum(gecmis);

  // Her degisiklikten sonra cizimi tarayiciya yaz.
  useEffect(() => {
    if (!yuklendi) return;
    durumuKaydet(resimId, durum);
  }, [resimId, durum, yuklendi]);

  function bolgeyeDokunuldu(bolgeId: string) {
    if (arac === "silgi") {
      setGecmis((onceki) => sil(onceki, { tur: "bolge", bolgeId }));
    } else {
      setGecmis((onceki) => bolgeyiDoldur(onceki, bolgeId, renk));
    }
  }

  function cizgiTamamlandi(cizgi: FircaCizgisi) {
    setGecmis((onceki) => fircaCizgisiEkle(onceki, cizgi));
  }

  function cizgiyeDokunuldu(indeks: number) {
    setGecmis((onceki) => sil(onceki, { tur: "cizgi", indeks }));
  }

  return (
    <div className="boyamaEkrani">
      <div className="boyamaBaslik">
        <Link href="/boyama/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Resimler
        </Link>
        <h1>{resimAdi}</h1>
      </div>

      <Tuval
        svgIcerigi={svgIcerigi}
        viewBox={viewBox}
        durum={durum}
        arac={arac}
        renk={renk}
        kalinlik={kalinlik}
        bolgeyeDokunuldu={bolgeyeDokunuldu}
        cizgiTamamlandi={cizgiTamamlandi}
        cizgiyeDokunuldu={cizgiyeDokunuldu}
      />

      <AracCubugu
        arac={arac}
        kalinlik={kalinlik}
        geriAlinabilir={geriAlinabilirMi(gecmis)}
        aracSecildi={setArac}
        kalinlikSecildi={setKalinlik}
        geriAlIstendi={() => setGecmis((onceki) => geriAl(onceki))}
        bastanBaslaIstendi={() => setGecmis((onceki) => bastanBasla(onceki))}
      />

      <RenkPaleti secili={renk} renkSecildi={setRenk} />
    </div>
  );
}
