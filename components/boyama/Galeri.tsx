"use client";

// Kategori sekmeleri ve resim listesi.
// Hangi resimlere baslanmis oldugu sadece tarayicidan okunur.
import { useEffect, useState } from "react";
import type { KatalogGirdisi } from "@/lib/boyama/katalog";
import { baslanmisResimler } from "@/lib/boyama/yerelKayit";
import GaleriKarti from "./GaleriKarti";
import "./galeri.css";

export default function Galeri({
  resimler,
  kategoriler,
}: {
  resimler: KatalogGirdisi[];
  kategoriler: string[];
}) {
  const [seciliKategori, setSeciliKategori] = useState(kategoriler[0]);
  const [baslananlar, setBaslananlar] = useState<string[]>([]);

  // localStorage yalnizca tarayicida vardir; sayfa sunucuda uretilirken erisilemez.
  // Bu yuzden hangi resimlere baslandigi ancak galeri acildiktan sonra okunabilir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaslananlar(baslanmisResimler());
  }, []);

  const gosterilecekler = resimler.filter((resim) => resim.kategori === seciliKategori);

  return (
    <div className="galeri">
      <h1>Hangi resmi boyayalım?</h1>

      <div className="kategoriSekmeleri" role="group" aria-label="Kategoriler">
        {kategoriler.map((kategori) => (
          <button
            key={kategori}
            type="button"
            className={"kategoriSekmesi" + (kategori === seciliKategori ? " secili" : "")}
            aria-pressed={kategori === seciliKategori}
            onClick={() => setSeciliKategori(kategori)}
          >
            {kategori}
          </button>
        ))}
      </div>

      <div className="galeriIzgara">
        {gosterilecekler.map((resim) => (
          <GaleriKarti
            key={resim.id}
            resim={resim}
            baslanmis={baslananlar.includes(resim.id)}
          />
        ))}
      </div>
    </div>
  );
}
