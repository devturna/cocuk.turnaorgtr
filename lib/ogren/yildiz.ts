// Cocugun kazandigi yildizlar.
// Boyama cizimleri gibi yalnizca tarayicida saklanir; hicbir yere gonderilmez.

const ANAHTAR = "ogren:yildizlar";

export type OyunAdi = "yaz" | "say" | "eslestir" | "bul";

/** Bir harf veya sayiyi tek bir metin anahtariyla temsil eder. */
export function ogeAnahtari(tur: "harf" | "sayi", deger: string): string {
  return `${tur}:${deger}`;
}

export function tumYildizlar(): Record<string, string[]> {
  let ham: string | null;
  try {
    ham = localStorage.getItem(ANAHTAR);
  } catch {
    return {};
  }
  if (ham === null) return {};

  try {
    const cozulmus = JSON.parse(ham);
    // Bozuk veya eski bir kayit oyunu kirmasin diye seklini dogruluyoruz.
    if (cozulmus && typeof cozulmus === "object" && !Array.isArray(cozulmus)) {
      return cozulmus as Record<string, string[]>;
    }
    return {};
  } catch {
    return {};
  }
}

function kaydet(yildizlar: Record<string, string[]>): void {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(yildizlar));
  } catch {
    // Depolama dolu veya kapali olabilir. Yildiz kaydedilmez ama oyun surer.
  }
}

export function yildizEkle(oge: string, oyun: OyunAdi): void {
  const yildizlar = tumYildizlar();
  const oncekiler = yildizlar[oge] ?? [];
  if (oncekiler.includes(oyun)) return;
  kaydet({ ...yildizlar, [oge]: [...oncekiler, oyun] });
}

export function yildizVarMi(oge: string, oyun: OyunAdi): boolean {
  return (tumYildizlar()[oge] ?? []).includes(oyun);
}

/** O oyunda kac ogenin tamamlandigi. Oyun kartlarinda gosterilir. */
export function oyunYildizSayisi(oyun: OyunAdi): number {
  return Object.values(tumYildizlar()).filter(
    (oyunlar) => Array.isArray(oyunlar) && oyunlar.includes(oyun),
  ).length;
}

export function yildizlariSil(): void {
  try {
    localStorage.removeItem(ANAHTAR);
  } catch {
    // Yok sayilir.
  }
}
