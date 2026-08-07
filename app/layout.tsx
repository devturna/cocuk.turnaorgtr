// Tum sayfalarin ortak cercevesi: ust bar ve alt bilgi.
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turna Çocuk",
  description: "Çocuklar için ücretsiz boyama ve oyun portalı",
};

export default function AnaCerceve({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="ustBar">
          <Link href="/" className="logo">Turna Çocuk</Link>
        </header>
        <main>{children}</main>
        <footer className="altBilgi">
          <p>Ücretsiz ve reklamsız. Hiçbir bilgi toplamıyoruz.</p>
          <a href="https://github.com/devturna/cocuk.turnaorgtr">Kaynak kodu</a>
        </footer>
      </body>
    </html>
  );
}
