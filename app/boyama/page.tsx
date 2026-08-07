// Boyama bolumunun giris sayfasi.
import { tumResimler, tumKategoriler } from "@/lib/boyama/katalog";
import Galeri from "@/components/boyama/Galeri";

export const metadata = { title: "Boyama - Turna Çocuk" };

export default function GaleriSayfasi() {
  return <Galeri resimler={tumResimler()} kategoriler={tumKategoriler()} />;
}
