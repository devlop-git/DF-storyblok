import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

import { brand } from "@/brands";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export const metadata = {
  title: brand.name,
};

export default function RootLayout({ children }) {
  return (
    // data-brand switches the brand colour palette (see globals.css).
    <html lang="en" data-brand={brand.id}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
