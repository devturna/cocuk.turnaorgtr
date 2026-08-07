import { describe, it, expect } from "vitest";
import {
  BOS_DURUM,
  yeniGecmis,
  simdikiDurum,
  bolgeyiDoldur,
  fircaCizgisiEkle,
  sil,
  geriAl,
  bastanBasla,
  geriAlinabilirMi,
} from "./durum";

const ORNEK_CIZGI = { d: "M10,10 L20,20", renk: "#3498db", kalinlik: 12 };

describe("yeniGecmis", () => {
  it("bos bir tuval ile baslar", () => {
    expect(simdikiDurum(yeniGecmis())).toEqual(BOS_DURUM);
  });

  it("verilen baslangic durumunu kullanir", () => {
    const kayitli = { dolgular: { govde: "#ff0000" }, fircaCizgileri: [] };
    expect(simdikiDurum(yeniGecmis(kayitli))).toEqual(kayitli);
  });
});

describe("bolgeyiDoldur", () => {
  it("bolgeye rengi yazar", () => {
    const gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    expect(simdikiDurum(gecmis).dolgular).toEqual({ govde: "#ff0000" });
  });

  it("ayni bolgeyi yeniden boyayinca rengi degistirir", () => {
    let gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    gecmis = bolgeyiDoldur(gecmis, "govde", "#00ff00");
    expect(simdikiDurum(gecmis).dolgular).toEqual({ govde: "#00ff00" });
  });

  it("onceki durumu degistirmez", () => {
    const once = yeniGecmis();
    bolgeyiDoldur(once, "govde", "#ff0000");
    expect(simdikiDurum(once)).toEqual(BOS_DURUM);
  });
});

describe("fircaCizgisiEkle", () => {
  it("cizgiyi listeye ekler", () => {
    const gecmis = fircaCizgisiEkle(yeniGecmis(), ORNEK_CIZGI);
    expect(simdikiDurum(gecmis).fircaCizgileri).toEqual([ORNEK_CIZGI]);
  });

  it("cizgileri eklenme sirasinda tutar", () => {
    const ikinci = { d: "M30,30 L40,40", renk: "#e74c3c", kalinlik: 6 };
    let gecmis = fircaCizgisiEkle(yeniGecmis(), ORNEK_CIZGI);
    gecmis = fircaCizgisiEkle(gecmis, ikinci);
    expect(simdikiDurum(gecmis).fircaCizgileri).toEqual([ORNEK_CIZGI, ikinci]);
  });
});

describe("sil", () => {
  it("bolgenin dolgusunu kaldirir", () => {
    let gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    gecmis = sil(gecmis, { tur: "bolge", bolgeId: "govde" });
    expect(simdikiDurum(gecmis).dolgular).toEqual({});
  });

  it("firca cizgisini kaldirir", () => {
    let gecmis = fircaCizgisiEkle(yeniGecmis(), ORNEK_CIZGI);
    gecmis = sil(gecmis, { tur: "cizgi", indeks: 0 });
    expect(simdikiDurum(gecmis).fircaCizgileri).toEqual([]);
  });

  it("boyanmamis bolgede yeni adim uretmez", () => {
    const gecmis = yeniGecmis();
    const sonra = sil(gecmis, { tur: "bolge", bolgeId: "govde" });
    expect(sonra.adimlar.length).toBe(gecmis.adimlar.length);
  });
});

describe("geriAl", () => {
  it("son islemi iptal eder", () => {
    let gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    gecmis = geriAl(gecmis);
    expect(simdikiDurum(gecmis)).toEqual(BOS_DURUM);
  });

  it("bos tuvalde hicbir sey yapmaz", () => {
    const gecmis = geriAl(yeniGecmis());
    expect(simdikiDurum(gecmis)).toEqual(BOS_DURUM);
  });

  it("geri alindiktan sonra yeni islem ileri adimlari siler", () => {
    let gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    gecmis = geriAl(gecmis);
    gecmis = bolgeyiDoldur(gecmis, "kanat", "#0000ff");
    expect(simdikiDurum(gecmis).dolgular).toEqual({ kanat: "#0000ff" });
    expect(gecmis.adimlar.length).toBe(2);
  });
});

describe("geriAlinabilirMi", () => {
  it("bos tuvalde yanlistir", () => {
    expect(geriAlinabilirMi(yeniGecmis())).toBe(false);
  });

  it("bir islemden sonra dogrudur", () => {
    expect(geriAlinabilirMi(bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000"))).toBe(true);
  });
});

describe("bastanBasla", () => {
  it("tuvali temizler ama geri alinabilir birakir", () => {
    let gecmis = bolgeyiDoldur(yeniGecmis(), "govde", "#ff0000");
    gecmis = bastanBasla(gecmis);
    expect(simdikiDurum(gecmis)).toEqual(BOS_DURUM);
    expect(geriAlinabilirMi(gecmis)).toBe(true);
  });
});
