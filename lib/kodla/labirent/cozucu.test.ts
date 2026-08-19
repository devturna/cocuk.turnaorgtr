import { describe, it, expect } from "vitest";
import { haritayiCoz } from "./harita";
import { calistir } from "./calistir";
import { enKisaCozum, enKisaCozumYolu } from "./cozucu";

describe("enKisaCozum, yonler seti", () => {
  it("duz yolda adim sayisini bulur", () => {
    expect(enKisaCozum(haritayiCoz([".T.H"], "sag"), "yonler")).toBe(2);
  });

  it("engelin etrafindan dolasir", () => {
    // (1,1) ve (2,1) kapali: asagi inen dogrudan yol yok.
    const harita = haritayiCoz([".T..", ".##.", "...H"], "sag");
    expect(enKisaCozum(harita, "yonler")).toBe(4);
  });

  it("cozumu olmayan haritada null doner", () => {
    expect(enKisaCozum(haritayiCoz([".T#H"], "sag"), "yonler")).toBeNull();
  });

  it("yoldaki basagi hesaba katar", () => {
    expect(enKisaCozum(haritayiCoz([".ToH"], "sag"), "yonler")).toBe(2);
  });

  it("yolda olmayan basak icin sapmayi hesaba katar", () => {
    expect(enKisaCozum(haritayiCoz(["oTH"], "sag"), "yonler")).toBe(3);
  });

  it("butun basaklar toplanmadan hedef sayilmaz", () => {
    // (1,1) -> (0,1) -> (0,0) basak -> (1,0) -> (2,0) basak -> (2,1) -> (2,2)
    const harita = haritayiCoz(["o.o", ".T.", "..H"], "sag");
    expect(enKisaCozum(harita, "yonler")).toBe(6);
  });
});

describe("enKisaCozumYolu", () => {
  it("bulunan yol gercekten bolumu bitirir", () => {
    const harita = haritayiCoz(["..o..", ".T#..", "....H"], "sag");
    const yol = enKisaCozumYolu(harita, "yonler")!;
    expect(yol).not.toBeNull();
    expect(calistir(yol, harita).basarili).toBe(true);
  });

  it("adim sayisi enKisaCozum ile ayni", () => {
    const harita = haritayiCoz([".T.H"], "sag");
    expect(enKisaCozumYolu(harita, "yonler")!.length).toBe(enKisaCozum(harita, "yonler"));
  });

  it("cozumu olmayan haritada null doner", () => {
    expect(enKisaCozumYolu(haritayiCoz([".T#H"], "sag"), "yonler")).toBeNull();
  });
});

describe("enKisaCozum, donusler seti", () => {
  it("donus adimlarini da sayar", () => {
    // T saga bakiyor: ileri, ileri, saga don, ileri
    const harita = haritayiCoz([".T..", "...H"], "sag");
    expect(enKisaCozum(harita, "donusler")).toBe(4);
  });

  it("baslangic bakisi sonucu degistirir", () => {
    // T (1,0)'da asagi bakiyor, hedef (3,1):
    // ileri -> (1,1), sola don (asagi -> sag), ileri -> (2,1), ileri -> (3,1)
    const asagiBakan = haritayiCoz([".T..", "...H"], "asagi");
    expect(enKisaCozum(asagiBakan, "donusler")).toBe(4);
  });
});
