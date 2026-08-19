import { describe, it, expect } from "vitest";
import {
  KOMUT_SETLERI,
  komutAnahtari,
  saatYonunde,
  saatTersine,
  komsuKare,
} from "./komutlar";

describe("komut setleri", () => {
  it("yonler seti dort mutlak yon icerir", () => {
    expect(KOMUT_SETLERI.yonler).toEqual([
      { tur: "git", yon: "yukari" },
      { tur: "git", yon: "asagi" },
      { tur: "git", yon: "sol" },
      { tur: "git", yon: "sag" },
    ]);
  });

  it("donusler seti ileri ve iki donusten olusur", () => {
    expect(KOMUT_SETLERI.donusler).toEqual([
      { tur: "ileri" },
      { tur: "don", yon: "sol" },
      { tur: "don", yon: "sag" },
    ]);
  });
});

describe("komutAnahtari", () => {
  it("her komut icin ayirt edici bir metin uretir", () => {
    expect(komutAnahtari({ tur: "git", yon: "sag" })).toBe("git:sag");
    expect(komutAnahtari({ tur: "ileri" })).toBe("ileri");
    expect(komutAnahtari({ tur: "don", yon: "sol" })).toBe("don:sol");
  });
});

describe("donus", () => {
  it("saat yonunde doner", () => {
    expect(saatYonunde("yukari")).toBe("sag");
    expect(saatYonunde("sag")).toBe("asagi");
    expect(saatYonunde("asagi")).toBe("sol");
    expect(saatYonunde("sol")).toBe("yukari");
  });

  it("saat tersine doner", () => {
    expect(saatTersine("yukari")).toBe("sol");
    expect(saatTersine("sol")).toBe("asagi");
    expect(saatTersine("asagi")).toBe("sag");
    expect(saatTersine("sag")).toBe("yukari");
  });
});

describe("komsuKare", () => {
  it("yukari gitmek y degerini azaltir", () => {
    expect(komsuKare({ x: 2, y: 2 }, "yukari")).toEqual({ x: 2, y: 1 });
  });

  it("asagi gitmek y degerini artirir", () => {
    expect(komsuKare({ x: 2, y: 2 }, "asagi")).toEqual({ x: 2, y: 3 });
  });

  it("sol ve sag x degerini degistirir", () => {
    expect(komsuKare({ x: 2, y: 2 }, "sol")).toEqual({ x: 1, y: 2 });
    expect(komsuKare({ x: 2, y: 2 }, "sag")).toEqual({ x: 3, y: 2 });
  });
});
