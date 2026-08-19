// Kodlama bolumundeki kurslar (yas gruplari).
// Katalog JSON'u derleme aninda pakete gomulur; calisma aninda dosya okunmaz.
import kursVerisi from "@/content/kodla/kurslar.json";

export type Kurs = {
  id: string;
  ad: string;
  yas: string;
  ikon: string;
  durum: "yayinda" | "yakinda";
};

const kurslar = kursVerisi as Kurs[];

export function tumKurslar(): Kurs[] {
  return kurslar;
}

export function kursBul(id: string): Kurs | undefined {
  return kurslar.find((kurs) => kurs.id === id);
}

export function yayindakiKurslar(): Kurs[] {
  return kurslar.filter((kurs) => kurs.durum === "yayinda");
}
