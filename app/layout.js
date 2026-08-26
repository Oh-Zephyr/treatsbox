import "./globals.css";
import { CartProvider } from "./components/CartContext";
import { ToastProvider } from "./components/Toast";

export const metadata = {
  title: "Treatsbox — Order Your Treatsbox",
  description: "Preorder Treatsbox packs and treats. Ready for collection Sunday after Church service.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7EFDD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
