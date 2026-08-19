// Bolumun kareli haritasi. Tek bir SVG'dir ve viewBox ile olceklenir;
// boyama tuvalindeki kalibin aynisi.
import { kareAnahtari, type Harita } from "@/lib/kodla/labirent/harita";
import type { Yon } from "@/lib/kodla/labirent/komutlar";
import type { Tema } from "@/lib/kodla/labirent/temalar";
import { BasakSimgesi, TurnaSimgesi, YuvaSimgesi } from "./Simgeler";

const KARE = 100;

// Turna saga bakacak sekilde cizildi; her yon icin dondurulecek aci.
const ACILAR: Record<Yon, number> = { sag: 0, asagi: 90, sol: 180, yukari: 270 };

export default function Sahne({
  harita,
  tema,
  turna,
  toplananlar,
  sarsinti,
  bolumAdi,
}: {
  harita: Harita;
  tema: Tema;
  turna: { x: number; y: number; bakis: Yon };
  toplananlar: string[];
  sarsinti: boolean;
  bolumAdi: string;
}) {
  const genislik = harita.genislik * KARE;
  const yukseklik = harita.yukseklik * KARE;
  const kareler = [];

  for (let y = 0; y < harita.yukseklik; y++) {
    for (let x = 0; x < harita.genislik; x++) {
      kareler.push(
        <rect
          key={`${x},${y}`}
          x={x * KARE}
          y={y * KARE}
          width={KARE}
          height={KARE}
          fill={tema.zeminRengi}
          stroke={tema.cizgiRengi}
          strokeWidth="2"
        />,
      );
    }
  }

  // Carpinca Turna yerinde hafifce saga kayar; kirmizi ve unlem yok.
  const kayma = sarsinti ? 10 : 0;

  return (
    <svg
      className="kodlaSahne"
      viewBox={`0 0 ${genislik} ${yukseklik}`}
      role="img"
      aria-label={`${bolumAdi} haritasi`}
    >
      {kareler}

      {harita.engeller.map((engel) => (
        <path
          key={kareAnahtari(engel)}
          transform={`translate(${engel.x * KARE} ${engel.y * KARE})`}
          d={tema.engel.d}
          fill={tema.engel.dolgu}
          stroke={tema.engel.cizgi}
          strokeWidth={tema.engel.kalinlik}
          strokeLinecap="round"
        />
      ))}

      <g transform={`translate(${harita.hedef.x * KARE} ${harita.hedef.y * KARE})`}>
        <YuvaSimgesi />
      </g>

      {harita.basaklar
        .filter((basak) => !toplananlar.includes(kareAnahtari(basak)))
        .map((basak) => (
          <g key={kareAnahtari(basak)} transform={`translate(${basak.x * KARE} ${basak.y * KARE})`}>
            <BasakSimgesi />
          </g>
        ))}

      <g
        className="kodlaTurna"
        transform={`translate(${turna.x * KARE + kayma} ${turna.y * KARE}) rotate(${ACILAR[turna.bakis]} 50 50)`}
      >
        <TurnaSimgesi />
      </g>
    </svg>
  );
}
