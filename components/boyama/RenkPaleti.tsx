"use client";

// Renk secim butonlari. Her butonun altinda rengin adi yazar;
// boylece okumaya yeni baslayan cocuk da renk adlarini ogrenir.
import { PALET } from "@/lib/boyama/renkler";
import "./kontroller.css";

type RenkPaletiOzellikleri = {
  secili: string;
  renkSecildi: (renk: string) => void;
};

export default function RenkPaleti({ secili, renkSecildi }: RenkPaletiOzellikleri) {
  const seciliRenk = PALET.find((renk) => renk.deger === secili);

  return (
    <div className="renkPaleti">
      {/* Renk adi her dugmenin ustune sigmadigi icin sadece secili olan yazilir.
          Cocuk renge dokundukca adini burada okur. */}
      <p className="seciliRenkAdi" aria-live="polite">{seciliRenk?.ad}</p>

      <div className="renkIzgara" role="group" aria-label="Renkler">
        {PALET.map((renk) => (
          <button
            key={renk.deger}
            type="button"
            className={"renkDugmesi" + (renk.deger === secili ? " secili" : "")}
            style={{ background: renk.deger }}
            aria-label={renk.ad}
            aria-pressed={renk.deger === secili}
            onClick={() => renkSecildi(renk.deger)}
          />
        ))}
      </div>
    </div>
  );
}
