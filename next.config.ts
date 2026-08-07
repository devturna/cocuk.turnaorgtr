// Site tamamen statik dosyalara donusturulur; sunucu gerekmez.
//
// TEMEL YOL: Site kendi alan adinin kokunde yayinlanirsa bos kalir. GitHub
// Pages proje sayfasinda ise site alt yolda durur (ornek: /cocuk.turnaorgtr)
// ve butun baglantilarin bu on eki tasimasi gerekir. Deger
// NEXT_PUBLIC_TEMEL_YOL ortam degiskeninden gelir; nerede ayarlandigi
// .github/workflows/yayinla.yml icinde yazili.
import type { NextConfig } from "next";

const temelYol = process.env.NEXT_PUBLIC_TEMEL_YOL ?? "";

const ayarlar: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(temelYol ? { basePath: temelYol } : {}),
};

export default ayarlar;
