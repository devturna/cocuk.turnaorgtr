"use client";

// Ebeveyn icin ilerleme ozeti: hangi harf hangi oyunlarda tamamlandi.
//
// Bu sayfa COCUK icin degil: tablo okumak gerekir, dokunma hedefleri de
// oyun ekranlarindaki gibi buyuk degildir. Bolum girisinde kucuk bir
// baglantiyla duruyor, cunku cocugun oraya dalmasi icin bir sebep yok.
//
// Kayit yalnizca bu cihazin tarayici hafizasindadir; sifirlama da onu
// siler, baska hicbir yere dokunmaz.
import { useEffect, useState } from "react";
import Link from "next/link";
import { HARFLER } from "@/lib/ogren/harfler";
import { SAYILAR } from "@/lib/ogren/sayilar";
import { ogeAnahtari, tumYildizlar, yildizlariSil, type OyunAdi } from "@/lib/ogren/yildiz";
import "./ogren.css";

const OYUNLAR: { ad: OyunAdi; baslik: string }[] = [
  { ad: "yaz", baslik: "Yaz" },
  { ad: "say", baslik: "Say" },
  { ad: "eslestir", baslik: "Eşleştir" },
  { ad: "bul", baslik: "Bul" },
];

type Satir = { anahtar: string; etiket: string; oynanabilir: OyunAdi[] };

/**
 * Tablodaki satirlar.
 *
 * Her oge her oyunda oynanmaz: harf sayilmaz (Say yalnizca sayilara ait),
 * Ğ ile baslayan Turkce kelime olmadigi icin Bul'da hedef olamaz, ve Yaz
 * oyunu ona (0-9) kadar rakam yazdirir ama Say 1-10 arasini sayar. Tablo
 * bunu bos hucre degil CIZGI ile gosterir: bos hucre "yapilmadi" demektir,
 * cizgi "burada boyle bir sey yok".
 */
function satirlar(): Satir[] {
  const harfSatirlari = HARFLER.map((harf) => ({
    anahtar: ogeAnahtari("harf", harf.buyuk),
    etiket: harf.buyuk,
    oynanabilir: (harf.basindaGecmez
      ? ["yaz", "eslestir"]
      : ["yaz", "eslestir", "bul"]) as OyunAdi[],
  }));

  const sayiSatirlari = SAYILAR.map((sayi) => {
    const oynanabilir: OyunAdi[] = [];
    if (sayi.rakam <= 9) oynanabilir.push("yaz");
    if (sayi.rakam >= 1) oynanabilir.push("say", "eslestir", "bul");
    return {
      anahtar: ogeAnahtari("sayi", String(sayi.rakam)),
      etiket: String(sayi.rakam),
      oynanabilir,
    };
  });

  return [...harfSatirlari, ...sayiSatirlari];
}

export default function IlerlemeOzeti() {
  const [yildizlar, setYildizlar] = useState<Record<string, string[]>>({});
  // Silme iki adimli: ilk dokunus soruyu acar, ikincisi siler. Onay
  // penceresi (confirm) yerine bu, cunku sayfa bir oyun ekranindan
  // acilabiliyor ve tarayici penceresi bu yasta cocugu da sasirtir.
  const [silmeSoruldu, setSilmeSoruldu] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYildizlar(tumYildizlar());
  }, []);

  function sifirla() {
    yildizlariSil();
    setYildizlar({});
    setSilmeSoruldu(false);
  }

  const tumSatirlar = satirlar();
  const toplam = tumSatirlar.reduce((sayi, satir) => sayi + satir.oynanabilir.length, 0);
  const kazanilan = tumSatirlar.reduce(
    (sayi, satir) =>
      sayi + satir.oynanabilir.filter((oyun) => (yildizlar[satir.anahtar] ?? []).includes(oyun)).length,
    0,
  );

  return (
    <div className="ilerlemeSayfasi">
      <div className="oyunBaslik">
        <Link href="/ogren/" className="geriDugmesi">
          <span aria-hidden="true">←</span> Oyunlar
        </Link>
        <h1>İlerleme</h1>
      </div>

      <p className="ilerlemeOzet">
        {kazanilan}/{toplam} yıldız. Bu kayıt yalnızca bu cihazın tarayıcı hafızasındadır;
        hiçbir yere gönderilmez.
      </p>

      <div className="ilerlemeTablosu">
        <table>
          <thead>
            <tr>
              <th scope="col">Harf / Rakam</th>
              {OYUNLAR.map((oyun) => (
                <th key={oyun.ad} scope="col">
                  {oyun.baslik}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tumSatirlar.map((satir) => (
              <tr key={satir.anahtar}>
                <th scope="row">{satir.etiket}</th>
                {OYUNLAR.map((oyun) => {
                  if (!satir.oynanabilir.includes(oyun.ad)) {
                    return (
                      <td key={oyun.ad} className="yok" aria-label="bu oyunda yok">
                        –
                      </td>
                    );
                  }
                  const kazandi = (yildizlar[satir.anahtar] ?? []).includes(oyun.ad);
                  return (
                    <td key={oyun.ad} aria-label={kazandi ? "tamamlandı" : "henüz yok"}>
                      {kazandi ? "★" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="oyunAltBar">
        {silmeSoruldu ? (
          <>
            <button type="button" className="oyunDugmesi" onClick={() => setSilmeSoruldu(false)}>
              Vazgeç
            </button>
            <button type="button" className="oyunDugmesi vurgulu" onClick={sifirla}>
              Evet, sıfırla
            </button>
          </>
        ) : (
          <button type="button" className="oyunDugmesi" onClick={() => setSilmeSoruldu(true)}>
            İlerlemeyi sıfırla
          </button>
        )}
      </div>
    </div>
  );
}
