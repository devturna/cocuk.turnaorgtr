import { describe, it, expect } from "vitest";
import {
  EN_FAZLA_BLOK,
  EN_AZ_KEZ,
  EN_FAZLA_KEZ,
  blokEkle,
  blokSayisi,
  blokSil,
  blokTasi,
  komutBloku,
  programAyniMi,
  programiTemizle,
  sonBlokuSil,
  tekrarEkle,
  kezDegistir,
  type Blok,
} from "./program";
import type { Komut } from "./labirent/komutlar";

const yukari: Komut = { tur: "git", yon: "yukari" };
const sag: Komut = { tur: "git", yon: "sag" };
const asagi: Komut = { tur: "git", yon: "asagi" };

const kutu = (kez: number, ...komutlar: Komut[]): Blok => ({
  tur: "tekrar",
  kez,
  govde: komutlar.map(komutBloku),
});

describe("blokEkle", () => {
  it("blogu sona ekler", () => {
    expect(blokEkle([komutBloku(yukari)], sag)).toEqual([komutBloku(yukari), komutBloku(sag)]);
  });

  it("girdiyi degistirmez", () => {
    const program = [komutBloku(yukari)];
    blokEkle(program, sag);
    expect(program).toEqual([komutBloku(yukari)]);
  });

  it("ust sinira gelince eklemez", () => {
    const dolu = Array.from({ length: EN_FAZLA_BLOK }, () => komutBloku(yukari));
    expect(blokEkle(dolu, sag)).toHaveLength(EN_FAZLA_BLOK);
  });

  it("bolum kendi sinirini dusurebilir", () => {
    expect(blokEkle([komutBloku(yukari), komutBloku(sag)], asagi, 2)).toEqual([
      komutBloku(yukari),
      komutBloku(sag),
    ]);
  });

  it("sinir govdedeki bloklari da sayar", () => {
    // Kutu (1) + govde (2) = 3 blok; sinir 3 ise yer yoktur.
    expect(blokEkle([kutu(2, sag, yukari)], asagi, 3)).toEqual([kutu(2, sag, yukari)]);
  });
});

describe("blokSil", () => {
  it("verilen yoldaki ust blogu siler", () => {
    const program = [komutBloku(yukari), komutBloku(sag), komutBloku(asagi)];
    expect(blokSil(program, { ust: 1, ic: null })).toEqual([
      komutBloku(yukari),
      komutBloku(asagi),
    ]);
  });

  it("govdedeki blogu siler, kutuyu birakir", () => {
    expect(blokSil([kutu(3, sag, yukari)], { ust: 0, ic: 0 })).toEqual([kutu(3, yukari)]);
  });

  it("kutuyu silmek govdesini de goturur", () => {
    expect(blokSil([kutu(3, sag, yukari)], { ust: 0, ic: null })).toEqual([]);
  });

  it("gecersiz yol programi degistirmez", () => {
    const program = [kutu(2, sag)];
    expect(blokSil(program, { ust: 5, ic: null })).toEqual(program);
    expect(blokSil(program, { ust: 0, ic: 9 })).toEqual(program);
    expect(blokSil([komutBloku(yukari)], { ust: 0, ic: 0 })).toEqual([komutBloku(yukari)]);
  });
});

describe("sonBlokuSil", () => {
  it("son blogu siler", () => {
    expect(sonBlokuSil([komutBloku(yukari), komutBloku(sag)])).toEqual([komutBloku(yukari)]);
  });

  it("bos programda bos kalir", () => {
    expect(sonBlokuSil([])).toEqual([]);
  });

  it("dolu kutu sondayse govdenin son blogunu siler", () => {
    expect(sonBlokuSil([kutu(3, sag, yukari)])).toEqual([kutu(3, sag)]);
  });

  it("bos kutu sondayse kutunun kendisi silinir", () => {
    expect(sonBlokuSil([komutBloku(sag), kutu(2)])).toEqual([komutBloku(sag)]);
  });
});

describe("blokTasi", () => {
  it("ust duzeyde ileri tasir", () => {
    const program = [komutBloku(yukari), komutBloku(sag), komutBloku(asagi)];
    expect(blokTasi(program, { ust: 0, ic: null }, { ust: 2, ic: null })).toEqual([
      komutBloku(sag),
      komutBloku(asagi),
      komutBloku(yukari),
    ]);
  });

  it("geriye dogru tasir", () => {
    const program = [komutBloku(yukari), komutBloku(sag), komutBloku(asagi)];
    expect(blokTasi(program, { ust: 2, ic: null }, { ust: 0, ic: null })).toEqual([
      komutBloku(asagi),
      komutBloku(yukari),
      komutBloku(sag),
    ]);
  });

  it("ust duzeydeki blogu kutunun icine tasir", () => {
    const program = [kutu(2, sag), komutBloku(yukari)];
    expect(blokTasi(program, { ust: 1, ic: null }, { ust: 0, ic: 1 })).toEqual([
      kutu(2, sag, yukari),
    ]);
  });

  it("kutudaki blogu disari tasir", () => {
    const program = [kutu(2, sag, yukari)];
    expect(blokTasi(program, { ust: 0, ic: 1 }, { ust: 1, ic: null })).toEqual([
      kutu(2, sag),
      komutBloku(yukari),
    ]);
  });

  it("kutu kutunun icine giremez", () => {
    const program = [kutu(2, sag), kutu(3, yukari)];
    expect(blokTasi(program, { ust: 1, ic: null }, { ust: 0, ic: 0 })).toEqual(program);
  });

  it("gecersiz yol programi degistirmez", () => {
    const program = [komutBloku(yukari), komutBloku(sag)];
    expect(blokTasi(program, { ust: 0, ic: null }, { ust: 9, ic: null })).toEqual(program);
    expect(blokTasi(program, { ust: 9, ic: null }, { ust: 0, ic: null })).toEqual(program);
  });

  it("ileri yonde kutunun icine tasirken hedef silme SONRASI adrestir", () => {
    // [komut, kutu] icinde komutu kutuya tasimak: silme sonrasi kutu 0'a kayar.
    const program = [komutBloku(yukari), kutu(2, sag)];
    expect(blokTasi(program, { ust: 0, ic: null }, { ust: 0, ic: 1 })).toEqual([
      kutu(2, sag, yukari),
    ]);
  });

  it("silme oncesi adresle cagrilirsa program degismez", () => {
    // Ayni tasima, silme ONCESI adresle: kutu artik 1'de degil, hedef gecersiz.
    const program = [komutBloku(yukari), kutu(2, sag)];
    expect(blokTasi(program, { ust: 0, ic: null }, { ust: 1, ic: 1 })).toEqual(program);
  });
});

describe("programiTemizle", () => {
  it("bos program dondurur", () => {
    expect(programiTemizle()).toEqual([]);
  });
});

describe("blokSayisi", () => {
  it("duz programda blok sayisi uzunluktur", () => {
    expect(blokSayisi([komutBloku(yukari), komutBloku(sag)])).toBe(2);
  });

  it("tekrar kutusu kendisi bir, govdesi ayrica sayilir", () => {
    const program: Blok[] = [
      { tur: "tekrar", kez: 3, govde: [komutBloku(sag), komutBloku(yukari)] },
    ];
    expect(blokSayisi(program)).toBe(3);
  });

  it("bos kutu bir blok sayilir", () => {
    expect(blokSayisi([{ tur: "tekrar", kez: 2, govde: [] }])).toBe(1);
  });

  it("kez sayisi blok sayisini degistirmez", () => {
    const govde = [komutBloku(sag)];
    expect(blokSayisi([{ tur: "tekrar", kez: 5, govde }])).toBe(
      blokSayisi([{ tur: "tekrar", kez: 2, govde }]),
    );
  });

  it("bos program sifirdir", () => {
    expect(blokSayisi([])).toBe(0);
  });
});

describe("tekrarEkle", () => {
  it("bos kutuyu sona ekler", () => {
    expect(tekrarEkle([komutBloku(sag)])).toEqual([
      komutBloku(sag),
      { tur: "tekrar", kez: EN_AZ_KEZ, govde: [] },
    ]);
  });

  it("kutu ikiden baslar", () => {
    expect(tekrarEkle([])).toEqual([{ tur: "tekrar", kez: 2, govde: [] }]);
  });

  it("serit doluysa eklemez", () => {
    const dolu = Array.from({ length: EN_FAZLA_BLOK }, () => komutBloku(yukari));
    expect(tekrarEkle(dolu)).toHaveLength(EN_FAZLA_BLOK);
  });
});

describe("kezDegistir", () => {
  it("her dokunusta bir artar", () => {
    expect(kezDegistir([kutu(2, sag)], 0)).toEqual([kutu(3, sag)]);
  });

  it("en fazladan sonra basa doner", () => {
    expect(kezDegistir([kutu(EN_FAZLA_KEZ, sag)], 0)).toEqual([kutu(EN_AZ_KEZ, sag)]);
  });

  it("komut blogunda hicbir sey yapmaz", () => {
    expect(kezDegistir([komutBloku(sag)], 0)).toEqual([komutBloku(sag)]);
  });

  it("gecersiz sira programi degistirmez", () => {
    expect(kezDegistir([kutu(2, sag)], 9)).toEqual([kutu(2, sag)]);
  });
});

describe("blokEkle, acik kutuya", () => {
  it("hedef kutu verilince blok kutunun icine duser", () => {
    expect(blokEkle([kutu(3, sag)], yukari, EN_FAZLA_BLOK, 0)).toEqual([kutu(3, sag, yukari)]);
  });

  it("hedef komut bloguysa hicbir sey olmaz", () => {
    const program = [komutBloku(sag)];
    expect(blokEkle(program, yukari, EN_FAZLA_BLOK, 0)).toEqual(program);
  });

  it("serit doluysa kutuya da eklemez", () => {
    // Kutu (1) + govde (1) = 2 blok; sinir 2.
    expect(blokEkle([kutu(3, sag)], yukari, 2, 0)).toEqual([kutu(3, sag)]);
  });

  it("aralik disi hedef kutu programi degistirmez", () => {
    const program = [kutu(3, sag)];
    expect(blokEkle(program, yukari, EN_FAZLA_BLOK, 9)).toEqual(program);
    expect(blokEkle(program, yukari, EN_FAZLA_BLOK, -1)).toEqual(program);
  });
});

describe("programAyniMi", () => {
  const sag: Komut = { tur: "git", yon: "sag" };
  const yukari: Komut = { tur: "git", yon: "yukari" };

  it("ayni programlar icin dogru", () => {
    expect(programAyniMi([komutBloku(sag)], [komutBloku(sag)])).toBe(true);
    expect(programAyniMi([], [])).toBe(true);
  });

  it("farkli komut, farkli uzunluk ve farkli tekrar sayisi ayirt edilir", () => {
    expect(programAyniMi([komutBloku(sag)], [komutBloku(yukari)])).toBe(false);
    expect(programAyniMi([komutBloku(sag)], [])).toBe(false);
    expect(
      programAyniMi(
        [{ tur: "tekrar", kez: 2, govde: [komutBloku(sag)] }],
        [{ tur: "tekrar", kez: 3, govde: [komutBloku(sag)] }],
      ),
    ).toBe(false);
  });

  it("kutu govdesindeki fark da yakalanir", () => {
    expect(
      programAyniMi(
        [{ tur: "tekrar", kez: 2, govde: [komutBloku(sag)] }],
        [{ tur: "tekrar", kez: 2, govde: [komutBloku(yukari)] }],
      ),
    ).toBe(false);
  });

  it("komut blogu ile kutu ayni sayilmaz", () => {
    expect(programAyniMi([komutBloku(sag)], [{ tur: "tekrar", kez: 2, govde: [] }])).toBe(false);
  });
});
