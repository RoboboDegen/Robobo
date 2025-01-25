import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],    
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const tiny5 = localFont({
  src: "./fonts/Tiny5-Regular.ttf",
  variable: "--font-tiny5",
});
