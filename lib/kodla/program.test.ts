import { describe, it, expect } from "vitest";
import {
  EN_FAZLA_BLOK,
  blokEkle,
  blokSil,
  blokTasi,
  programiTemizle,
  sonBlokuSil,
} from "./program";
import type { Komut } from "./labirent/komutlar";

const yukari: Komut = { tur: "git", yon: "yukari" };
const sag: Komut = { tur: "git", yon: "sag" };
const asagi: Komut = { tur: "git", yon: "asagi" };

describe("blokEkle", () => {
  it("blogu sona ekler", () => {
    expect(blokEkle([yukari], sag)).toEqual([yukari, sag]);
  });

  it("girdiyi degistirmez", () => {
    const program = [yukari];
    blokEkle(program, sag);
    expect(program).toEqual([yukari]);
  });

  it("ust sinira gelince eklemez", () => {
    const dolu = Array.from({ length: EN_FAZLA_BLOK }, () => yukari);
    expect(blokEkle(dolu, sag)).toHaveLength(EN_FAZLA_BLOK);
  });

  it("bolum kendi sinirini dusurebilir", () => {
    expect(blokEkle([yukari, sag], asagi, 2)).toEqual([yukari, sag]);
  });
});

describe("blokSil", () => {
  it("verilen siradaki blogu siler", () => {
    expect(blokSil([yukari, sag, asagi], 1)).toEqual([yukari, asagi]);
  });

  it("gecersiz sira programi degistirmez", () => {
    expect(blokSil([yukari], 5)).toEqual([yukari]);
    expect(blokSil([yukari], -1)).toEqual([yukari]);
  });
});

describe("sonBlokuSil", () => {
  it("son blogu siler", () => {
    expect(sonBlokuSil([yukari, sag])).toEqual([yukari]);
  });

  it("bos programda bos kalir", () => {
    expect(sonBlokuSil([])).toEqual([]);
  });
});

describe("blokTasi", () => {
  it("blogu yeni sirasina tasir", () => {
    expect(blokTasi([yukari, sag, asagi], 0, 2)).toEqual([sag, asagi, yukari]);
  });

  it("geriye dogru tasir", () => {
    expect(blokTasi([yukari, sag, asagi], 2, 0)).toEqual([asagi, yukari, sag]);
  });

  it("gecersiz sira programi degistirmez", () => {
    expect(blokTasi([yukari, sag], 0, 9)).toEqual([yukari, sag]);
  });
});

describe("programiTemizle", () => {
  it("bos program dondurur", () => {
    expect(programiTemizle()).toEqual([]);
  });
});
