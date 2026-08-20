// Sahnedeki cizimler ve dis dunyaya verdigimiz sozlesme.
//
// Her simge 0-100 birimlik bir kutuya cizilir; sahne translate ile
// yerlestirir. Karakter dort yon ve dort poz tasir: yurume dongusu "durus"
// ile "adim" pozlarinin degismesiyle olusur.
//
// Illustrator ciktisi geldiginde yalnizca bu dosyanin govdesi degisir.
// Cagiran bilesenler poz ve yon disinda hicbir sey bilmez.
import type { Yon } from "@/lib/kodla/labirent/komutlar";

export type KarakterPozu = "durus" | "adim" | "carpma" | "kutlama";

export type KarakterPaleti = { govde: string; gaga: string; bacak: string; kanat: string };

// Sunucuda uretilen HTML'de ve secim daha okunmamisken gorunen kus:
// katalogdaki "turna" girdisinin paleti. Ikisi AYNI kalmalidir, yoksa
// sayfa once bir renkte cizilip effect calisinca digerine atlar. Bagi
// tutan sey lib/kodla/karakterler.test.ts icindeki esitlik testidir.
export const VARSAYILAN_PALET: KarakterPaleti = {
  govde: "#f4f1ea",
  gaga: "#e08a2e",
  bacak: "#33312e",
  kanat: "#c9c2b4",
};

// Karakter saga bakacak sekilde cizilir; digerleri dondurulerek elde edilir.
// Sola bakarken ters donmemesi icin dondurme degil aynalama kullanilir.
const YON_DONUSUMU: Record<Yon, string> = {
  sag: "",
  sol: "scale(-1 1) translate(-100 0)",
  yukari: "translate(0 -6)",
  asagi: "translate(0 6)",
};

// Uc alan da zorunlu: cizim karakteri yalnizca palet uzerinden tanir ve
// sessizce varsayilana dusen bir cagri, "flamingo sectim ama beyaz kus
// yuruyor" hatasini derleyiciden gizler.
export function KarakterSimgesi({
  yon,
  poz,
  palet,
}: {
  yon: Yon;
  poz: KarakterPozu;
  palet: KarakterPaleti;
}) {
  // Bacak ve kanat pozisyonu poza gore degisir; govde ayni kalir.
  const bacakSol = poz === "adim" ? "M40 73 L34 88" : "M40 73 L38 88";
  const bacakSag = poz === "adim" ? "M54 73 L60 88" : "M54 73 L56 88";
  const kanat =
    poz === "kutlama"
      ? "M24 56 Q34 26 52 40"
      : poz === "adim"
        ? "M24 60 Q38 40 58 50"
        : "M24 60 Q40 44 58 52";
  const bas = poz === "carpma" ? { x: 68, y: 26 } : { x: 72, y: 22 };

  return (
    <g transform={YON_DONUSUMU[yon]}>
      <ellipse cx="46" cy="58" rx="26" ry="16" fill={palet.govde} stroke="#33312e" strokeWidth="4" />
      <path d={kanat} fill="none" stroke={palet.kanat} strokeWidth="5" strokeLinecap="round" />
      <path d={`M62 50 L${bas.x - 2} ${bas.y + 4}`} stroke="#33312e" strokeWidth="4" fill="none" />
      <circle cx={bas.x} cy={bas.y} r="9" fill={palet.govde} stroke="#33312e" strokeWidth="4" />
      <path d={`M${bas.x + 8} ${bas.y} L${bas.x + 22} ${bas.y + 3}`} stroke={palet.gaga} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx={bas.x + 2} cy={bas.y - 2} r="2" fill="#33312e" />
      <path d={bacakSol} stroke={palet.bacak} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d={bacakSag} stroke={palet.bacak} strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function YuvaSimgesi({ dolu = false }: { dolu?: boolean }) {
  return (
    <g>
      <path
        d="M18 74 Q50 92 82 74 Q78 58 50 58 Q22 58 18 74 Z"
        fill={dolu ? "#e0b877" : "#c9a267"}
        stroke="#8a6a3c"
        strokeWidth="4"
      />
      <path d="M26 68 Q50 78 74 68" fill="none" stroke="#8a6a3c" strokeWidth="3" />
      <circle cx="40" cy="60" r="7" fill="#fdf6e3" stroke="#8a6a3c" strokeWidth="3" />
      <circle cx="58" cy="60" r="7" fill="#fdf6e3" stroke="#8a6a3c" strokeWidth="3" />
    </g>
  );
}

export function BasakSimgesi() {
  return (
    <g>
      <path d="M50 86 L50 38" stroke="#a8801f" strokeWidth="5" fill="none" />
      <path
        d="M50 38 Q36 40 38 54 Q50 52 50 38 Z M50 38 Q64 40 62 54 Q50 52 50 38 Z
           M50 52 Q36 54 38 68 Q50 66 50 52 Z M50 52 Q64 54 62 68 Q50 66 50 52 Z"
        fill="#e9c46a"
        stroke="#a8801f"
        strokeWidth="3"
      />
    </g>
  );
}

/** Carpma anindaki toz bulutu. Kirmizi ve unlem yerine bunu kullaniyoruz. */
export function TozSimgesi() {
  return (
    <g fill="#b9b2a4" opacity="0.85">
      <circle cx="26" cy="60" r="9" />
      <circle cx="40" cy="50" r="6" />
      <circle cx="16" cy="48" r="5" />
    </g>
  );
}
