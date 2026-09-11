"use client";

// Dort oyunun kartlari. Yildiz sayilari yalnizca tarayicidan okunur.
import { useEffect, useState } from "react";
import { oyunYildizSayisi } from "@/lib/ogren/yildiz";
import { sayilabilirMiktarlar, yazilabilirRakamlar } from "@/lib/ogren/sayilar";
import { HARFLER } from "@/lib/ogren/harfler";
import OyunKarti from "./OyunKarti";
import "./ogren.css";

export default function BolumGirisi() {
  const [yazYildizi, setYazYildizi] = useState(0);
  const [sayYildizi, setSayYildizi] = useState(0);
  const [bulYildizi, setBulYildizi] = useState(0);
  const [eslestirYildizi, setEslestirYildizi] = useState(0);

  // Yildizlar yalnizca tarayicida bulunur; sayfa sunucuda uretilirken
  // localStorage yoktur. Bu yuzden okuma ekran acildiktan sonra yapilir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYazYildizi(oyunYildizSayisi("yaz"));
    setSayYildizi(oyunYildizSayisi("say"));
    setBulYildizi(oyunYildizSayisi("bul"));
    setEslestirYildizi(oyunYildizSayisi("eslestir"));
  }, []);

  // Yaz oyunu hem harfleri hem rakamlari yazdirir; ilerleme ikisinin
  // toplamina gore olculur.
  const toplamYazilabilir = yazilabilirRakamlar().length + HARFLER.length;
  // Her oyunun kendi olcusu var: Say yalnizca rakamlari sayar (1-10),
  // Eslestir hem harfleri hem rakamlari eslestirir, Bul harfle baslayan
  // kelimeyi ve nesne grubunu bulur (Ğ ile baslayan Turkce kelime yok).
  const toplamMiktar = sayilabilirMiktarlar().length;
  const toplamEslestirme = HARFLER.length + toplamMiktar;
  const toplamBulunacak = HARFLER.filter((harf) => !harf.basindaGecmez).length + toplamMiktar;

  return (
    <div className="ogrenGirisi">
      <h1>Ne öğrenmek istersin?</h1>
      <div className="oyunKartlari">
        <OyunKarti
          ad="Yaz"
          aciklama="Parmağınla harfleri ve rakamları yaz"
          adres="/ogren/yaz/"
          ikon="✏️"
          ilerleme={`${yazYildizi}/${toplamYazilabilir}`}
        />
        <OyunKarti
          ad="Say"
          aciklama="Kaç tane var?"
          adres="/ogren/say/"
          ikon="🔢"
          ilerleme={`${sayYildizi}/${toplamMiktar}`}
        />
        <OyunKarti
          ad="Eşleştir"
          aciklama="Büyük ↔ küçük, rakam ↔ nokta"
          adres="/ogren/eslestir/"
          ikon="🧩"
          ilerleme={`${eslestirYildizi}/${toplamEslestirme}`}
        />
        <OyunKarti
          ad="Bul"
          aciklama="Harfle başlayanı, sayı kadar olanı bul"
          adres="/ogren/bul/"
          ikon="🔍"
          ilerleme={`${bulYildizi}/${toplamBulunacak}`}
        />
      </div>
    </div>
  );
}
