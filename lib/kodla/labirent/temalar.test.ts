import { describe, it, expect } from "vitest";
import { TEMALAR, temaBul } from "./temalar";
import { kursBolumleri } from "../bolumler";

describe("temalar", () => {
  it("her temanin zemini ve engel cizimi vardir", () => {
    for (const [ad, tema] of Object.entries(TEMALAR)) {
      expect(tema.zeminRengi, ad).toMatch(/^#[0-9a-f]{6}$/i);
      expect(tema.engel.d.length, ad).toBeGreaterThan(10);
    }
  });

  it("icerikteki her tema tanimlidir", () => {
    for (const bolum of kursBolumleri("turna-yolu")) {
      expect(Object.keys(TEMALAR), bolum.id).toContain(bolum.tema);
    }
  });

  it("bilinmeyen tema oyunu kirmaz", () => {
    expect(temaBul("yok-boyle")).toBe(TEMALAR.sazlik);
  });
});
