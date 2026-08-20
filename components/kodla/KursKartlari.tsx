"use client";

// Kodlama bolumunun girisi: yas gruplari.
// Ilerleme yalnizca tarayicida bulunur; sayfa sunucuda uretilirken
// localStorage yoktur, bu yuzden okuma ekran acildiktan sonra yapilir.
import { useEffect, useState } from "react";
import Link from "next/link";
import { tumKurslar } from "@/lib/kodla/kurslar";
import { kursBolumleri } from "@/lib/kodla/bolumler";
import { kursYildizSayisi } from "@/lib/kodla/yerelKayit";
import "./kodla.css";

export default function KursKartlari() {
  const kurslar = tumKurslar();
  const [yildizlar, setYildizlar] = useState<Record<string, number>>({});

  useEffect(() => {
    const okunan: Record<string, number> = {};
    for (const kurs of kurslar) okunan[kurs.id] = kursYildizSayisi(kurs.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYildizlar(okunan);
  }, [kurslar]);

  return (
    <div className="kodlaGirisi">
      <h1>Kaç yaşındasın?</h1>
      <div className="kursKartlari">
        {kurslar.map((kurs) => {
          const toplam = kursBolumleri(kurs.id).length;
          const icerik = (
            <>
              <span className="kursIkon" aria-hidden="true">{kurs.ikon}</span>
              <span className="kursAd">{kurs.ad}</span>
              <span className="kursYas">{kurs.yas} yaş</span>
              {kurs.durum === "yayinda" ? (
                <span className="kursIlerleme">{`${yildizlar[kurs.id] ?? 0}/${toplam}`}</span>
              ) : (
                <span className="kursYakinda">Yakında</span>
              )}
            </>
          );

          if (kurs.durum !== "yayinda") {
            return (
              <div key={kurs.id} className="kursKarti pasif">
                {icerik}
              </div>
            );
          }
          return (
            <Link key={kurs.id} href={`/kodla/${kurs.id}/`} className="kursKarti">
              {icerik}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
