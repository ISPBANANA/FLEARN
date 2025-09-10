import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka ({
  variable: '--font-fredoka',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLearn | Fun to Learn",
  description: "Our platform turns school subjects into fun, game-like lessons with streaks, rewards, and challenges that keep you motivated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
