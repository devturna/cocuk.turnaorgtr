// Bolumun kareli haritasi. Tek bir SVG'dir ve viewBox ile olceklenir.
//
// Turna'nin konumu ve donusu CSS ozel degiskenleriyle verilir; gecisi CSS
// yapar. SVG'nin transform NITELIGI canlandirilamaz, CSS transform'u
// canlandirilabilir - bu yuzden konum niteliğe degil stile yaziliyor.
import { kareAnahtari, type Harita } from "@/lib/kodla/labirent/harita";
import type { Yon } from "@/lib/kodla/labirent/komutlar";
import type { Tema } from "@/lib/kodla/labirent/temalar";
import {
  BasakSimgesi,
  TozSimgesi,
  TurnaSimgesi,
  YuvaSimgesi,
  type TurnaPozu,
} from "./Simgeler";

const KARE = 100;

export default function Sahne({
  harita,
  tema,
  turna,
  poz,
  toplananlar,
  vardi,
  bolumAdi,
}: {
  harita: Harita;
  tema: Tema;
  turna: { x: number; y: number; bakis: Yon };
  poz: TurnaPozu;
  toplananlar: string[];
  vardi: boolean;
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

      {/* Yuva nefes alir: cocuk nereye gitmesi gerektigini kimse soylemeden bilir. */}
      <g
        className={`kodlaYuva${vardi ? " dolu" : ""}`}
        transform={`translate(${harita.hedef.x * KARE} ${harita.hedef.y * KARE})`}
      >
        <YuvaSimgesi dolu={vardi} />
      </g>

      {harita.basaklar.map((basak) => {
        const toplandi = toplananlar.includes(kareAnahtari(basak));
        return (
          <g
            key={kareAnahtari(basak)}
            className={`kodlaBasak${toplandi ? " toplandi" : ""}`}
            transform={`translate(${basak.x * KARE} ${basak.y * KARE})`}
          >
            <BasakSimgesi />
          </g>
        );
      })}

      {poz === "carpma" && (
        <g
          className="kodlaToz"
          transform={`translate(${turna.x * KARE} ${turna.y * KARE})`}
        >
          <TozSimgesi />
        </g>
      )}

      {/* Konum ve donus stile yaziliyor; gecisi CSS yapiyor. */}
      <g
        className={`kodlaTurna poz-${poz}`}
        style={
          {
            "--kare-x": turna.x,
            "--kare-y": turna.y,
          } as React.CSSProperties
        }
      >
        <TurnaSimgesi yon={turna.bakis} poz={poz} />
      </g>
    </svg>
  );
}
