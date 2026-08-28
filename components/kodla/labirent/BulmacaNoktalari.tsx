// Durak icindeki bulmaca sirasini gosteren nokta dizisi. Iki yerde cizilir:
// ust barda kucuk (oyun surerken durum), bulmacalar arasi gecis perdesinde
// buyuk (BolumEkrani.tsx). Ikisi AYNI FIKRIN iki olcegidir; markup burada
// tek yerde tutuluyor ki iki cizim birbirinden kayarak sapmasin.
export default function BulmacaNoktalari({
  toplam,
  doluSira,
  yeniDolanSira = null,
  buyuk = false,
  etiket,
}: {
  /** Durak icindeki toplam bulmaca sayisi. */
  toplam: number;
  /** Bu SIRAYA KADAR (dahil) olan noktalar dolu gorunur. */
  doluSira: number;
  /**
   * Doluysa ve bu sirayla eslesirse, o nokta "yeni dolan" animasyonuyla
   * belirir. Gecis perdesindeki cagiran, henuz artmamis bulmacaSirasi + 1
   * verir - bkz. BolumEkrani.tsx'teki gecis efekti.
   */
  yeniDolanSira?: number | null;
  /** Gecis perdesindeki buyuk cizim mi (varsayilan: ust bardaki kucuk cizim). */
  buyuk?: boolean;
  etiket: string;
}) {
  return (
    <div className={`bulmacaNoktalari${buyuk ? " buyuk" : ""}`} role="img" aria-label={etiket}>
      {Array.from({ length: toplam }, (_, sira) => (
        <span
          key={sira}
          className={
            sira <= doluSira
              ? `bulmacaNoktasi dolu${sira === yeniDolanSira ? " yeniDolan" : ""}`
              : "bulmacaNoktasi"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
