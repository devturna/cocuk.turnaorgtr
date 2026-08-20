// Kurslardaki karakterler: cocuk hangi kusla ucacagini secer.
//
// Karakter tamamen kozmetiktir; motor, yildiz ve kilit kurallari ondan
// etkilenmez. Cizim karakteri yalnizca PALET uzerinden tanir, boylece
// illustrasyon geldiginde cagiran kod degismeden yerine takilir.
import karakterVerisi from "@/content/kodla/karakterler.json";

export type Karakter = {
  id: string;
  ad: string;
  /** Ebeveyne yazilmis tek cumle; secim ekraninda gorunur. */
  bilgi: string;
  palet: {
    govde: string;
    gaga: string;
    bacak: string;
  };
};

const katalog = karakterVerisi as Record<string, Karakter[]>;

export function kursKarakterleri(kursId: string): Karakter[] {
  return katalog[kursId] ?? [];
}

export function karakterBul(kursId: string, karakterId: string): Karakter | undefined {
  return kursKarakterleri(kursId).find((karakter) => karakter.id === karakterId);
}

/** Hic secim yapilmamissa listedeki ilk karakter gecerlidir. */
export function varsayilanKarakter(kursId: string): Karakter | undefined {
  return kursKarakterleri(kursId)[0];
}
