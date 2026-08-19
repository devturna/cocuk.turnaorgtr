// Bolumun kareli haritasi. Tek bir SVG'dir ve viewBox ile olceklenir.
//
// Turna'nin konumu ve donusu CSS ozel degiskenleriyle verilir; gecisi CSS
// yapar. SVG'nin transform NITELIGI canlandirilamaz, CSS transform'u
// canlandirilabilir - bu yuzden konum niteliğe degil stile yaziliyor.
import { kareAnahtari, type Harita } from "@/lib/kodla/labirent/harita";
import type { Yon } from "@/lib/kodla/labirent/komutlar";
import type { YolParcasi } from "@/lib/kodla/labirent/onizleme";
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
  bekliyor,
  toplananlar,
  vardi,
  bolumAdi,
  yol,
  calisan,
}: {
  harita: Harita;
  tema: Tema;
  turna: { x: number; y: number; bakis: Yon };
  poz: TurnaPozu;
  bekliyor: boolean;
  toplananlar: string[];
  vardi: boolean;
  bolumAdi: string;
  yol: YolParcasi[];
  calisan: number | null;
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
      {/* Ok ucu marker'i, kendini referans alan cizginin rengini/opakligini
          MIRAS ALMAZ (SVG spesifikasyonu: marker icerigi, kendi tanim
          yerindeki (defs) atalari uzerinden hesaplanir, kullanan elemandan
          degil). Bu yuzden iki ayri marker: biri soluk, biri dolu; renk ve
          opaklik burada, .kodlaYol/.kodlaYolParcasi CSS'indeki degerlerle
          (renk #6b6459, opaklik 0.38/0.85) ayni tutulmus. */}
      <defs>
        <marker
          id="kodlaOkUcu"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="#6b6459" opacity="0.38" />
        </marker>
        <marker
          id="kodlaOkUcuDolu"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="#6b6459" opacity="0.85" />
        </marker>
      </defs>

      {kareler}

      {/* Program, haritaya cizilen yolun kendisidir. Cocuk calistirmadan
          once nereye gidecegini gorur; duvara giden ok kisa kesilir. */}
      <g className="kodlaYol">
        {yol.map((parca, sira) => {
          const dolu = calisan !== null && parca.blokSirasi <= calisan;
          const sinif = `kodlaYolParcasi${dolu ? " dolu" : ""}`;

          if (parca.tur === "carpma") {
            const orta = { x: parca.kare.x * KARE + 50, y: parca.kare.y * KARE + 50 };
            const uc = KARE * 0.32;
            const bitis = {
              x: orta.x + (parca.yon === "sag" ? uc : parca.yon === "sol" ? -uc : 0),
              y: orta.y + (parca.yon === "asagi" ? uc : parca.yon === "yukari" ? -uc : 0),
            };
            return (
              <line
                key={`carpma-${sira}`}
                className={`${sinif} carpma`}
                x1={orta.x}
                y1={orta.y}
                x2={bitis.x}
                y2={bitis.y}
              />
            );
          }

          return (
            <line
              key={`adim-${sira}`}
              className={sinif}
              x1={parca.baslangic.x * KARE + 50}
              y1={parca.baslangic.y * KARE + 50}
              x2={parca.bitis.x * KARE + 50}
              y2={parca.bitis.y * KARE + 50}
              markerEnd={dolu ? "url(#kodlaOkUcuDolu)" : "url(#kodlaOkUcu)"}
            />
          );
        })}
      </g>

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
        className={`kodlaTurna poz-${poz}${bekliyor ? " bekliyor" : ""}`}
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
