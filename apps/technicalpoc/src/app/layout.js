import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

import { brand } from "@brand/config";
import Footer from "@df/ui/layout/Footer";
import Header from "@df/ui/layout/Header";

export const metadata = {
  title: brand.name,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
