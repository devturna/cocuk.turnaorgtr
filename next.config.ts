// Site tamamen statik dosyalara donusturulur; sunucu gerekmez.
import type { NextConfig } from "next";

const ayarlar: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default ayarlar;
