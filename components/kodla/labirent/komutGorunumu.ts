// Komutun ekrandaki ikonu ve okunabilir adi.
// Hem palet hem program seridi ayni kaynagi kullanir ki ikisi ayrisamasin.

export const KOMUT_IKONLARI: Record<string, string> = {
  "git:yukari": "⬆",
  "git:asagi": "⬇",
  "git:sol": "⬅",
  "git:sag": "➡",
  ileri: "⬆",
  "don:sol": "↺",
  "don:sag": "↻",
};

export const KOMUT_ADLARI: Record<string, string> = {
  "git:yukari": "Yukarı git",
  "git:asagi": "Aşağı git",
  "git:sol": "Sola git",
  "git:sag": "Sağa git",
  ileri: "İleri git",
  "don:sol": "Sola dön",
  "don:sag": "Sağa dön",
};
