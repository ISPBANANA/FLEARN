import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { CORSErrorBoundary } from "@/components/CORSErrorHandler";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS to prevent FOUC */
          html { visibility: visible; opacity: 1; }
          body { margin: 0; padding: 0; min-height: 100vh; }
        `}} />
      </head>
      <body
        className={`${fredoka.variable} font-sans`}
      >
        <CORSErrorBoundary>
          {children}
        </CORSErrorBoundary>
      </body>
    </html>
  );
}
