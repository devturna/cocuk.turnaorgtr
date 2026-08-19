// Kutlama parcaciklari. Kutuphane yok, SVG dikdortgenleri.
//
// Konumlar Math.random ile degil deterministik bir formulle uretiliyor:
// sunucuda uretilen HTML ile istemcideki ilk render ayni olsun diye.
const RENKLER = ["#f5a623", "#6fbf5b", "#e05c4b", "#4a90d9", "#f2d13c"];

function parcacik(sira: number, adet: number) {
  // Altin orana yakin bir carpanla dagitmak, duzenli araliklarin
  // yarattigi "tarak" gorunumunu kirar.
  const yatay = ((sira * 37) % 100) + (sira % 3);
  const gecikme = (sira % 7) * 60;
  const sure = 1400 + ((sira * 53) % 700);
  const donus = ((sira * 71) % 360) - 180;
  const genislik = 6 + (sira % 3) * 2;
  return {
    sol: `${Math.min(yatay, 98)}%`,
    gecikme: `${gecikme}ms`,
    sure: `${sure}ms`,
    donus: `${donus}deg`,
    genislik,
    renk: RENKLER[sira % RENKLER.length],
    anahtar: `${sira}-${adet}`,
  };
}

export default function Konfeti({ yogun }: { yogun: boolean }) {
  const adet = yogun ? 42 : 22;
  const parcaciklar = Array.from({ length: adet }, (_, sira) => parcacik(sira, adet));

  return (
    <div className="kodlaKonfeti" aria-hidden="true">
      {parcaciklar.map((p) => (
        <span
          key={p.anahtar}
          className="kodlaKonfetiParcasi"
          style={
            {
              left: p.sol,
              width: `${p.genislik}px`,
              height: `${p.genislik * 2}px`,
              background: p.renk,
              animationDelay: p.gecikme,
              animationDuration: p.sure,
              "--donus": p.donus,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
