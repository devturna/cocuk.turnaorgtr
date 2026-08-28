// Bolum ekrani sayfasi.
import { notFound } from "next/navigation";
import { yayindakiKurslar } from "@/lib/kodla/kurslar";
import { bolumBul, bolumSiralamasi, kursBolumleri } from "@/lib/kodla/bolumler";
import BolumEkrani from "@/components/kodla/labirent/BolumEkrani";

export function generateStaticParams() {
  return yayindakiKurslar().flatMap((kurs) =>
    kursBolumleri(kurs.id).map((bolum) => ({ kursId: kurs.id, bolumId: bolum.id })),
  );
}

// Katalogda olmayan bir adres icin sayfa uretilmez.
export const dynamicParams = false;

export default async function BolumSayfasi({
  params,
}: {
  params: Promise<{ kursId: string; bolumId: string }>;
}) {
  const { kursId, bolumId } = await params;
  const bolum = bolumBul(kursId, bolumId);
  if (!bolum) notFound();

  const sirali = bolumSiralamasi(kursId);
  const sonraki = sirali[sirali.indexOf(bolumId) + 1] ?? null;

  // key: durak degisince BolumEkrani YENIDEN MONTE OLUR.
  //
  // BolumEkrani'nin durum makinesi bunu zaten varsayiyor: `bolum` prop'u
  // degisirse haritayi kendiliginden duzelten bir senkron etkisi YOK, ve
  // "kaldigi yerden devam" etkisi (BolumEkrani.tsx icinde) bagimliliginda
  // butun `bolum` nesnesini tasiyor. App Router dinamik segment degisince
  // alt agaci zaten yeniden montelemek zorunda kaldigi icin bu bugun
  // dogru calisiyor - ama o, cerceve ici bir davranistir, bize verilmis bir
  // sozlesme degil. Varsayimi burada YERELDE zorunlu kiliyoruz.
  //
  // Kirilirsa en kotu dal sessizdir ve altin yildiz uydurur: devam etkisi
  // oyunun ORTASINDA yeniden kosarsa, cozulen >= toplamBulmaca olan bir
  // durakta durakIlerlemesiniSil'i cagirir; bulmacaSirasi'na dokunulmadigi
  // icin cocuk son bulmacayi TERTEMIZ bir kayda karsi bitirir, hepsiIdeal
  // yeniden true okunur ve ozensiz oynanmis bir durak altin alir.
  return (
    <BolumEkrani
      key={`${kursId}/${bolumId}`}
      kursId={kursId}
      bolum={bolum}
      sonrakiBolumId={sonraki}
    />
  );
}
