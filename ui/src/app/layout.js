import "@/styles/global.css";
import "@/styles/fonts.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Versoview",
  description: "Versoview - Your Digital Reading Experience",
  icons: {
    icon: "/assets/fav.png",
    apple: "/assets/fav.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
