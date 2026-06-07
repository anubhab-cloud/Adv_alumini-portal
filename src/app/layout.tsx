import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

/* ── Typography matching the mockup ── */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: ["400"],
  style: ["normal", "italic"],
});

/* ── Keep legacy fonts for homepage / public pages ── */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Advanced Alumni Portal",
  description: "Connect, engage, and grow with your fellow alumni. Share memories, attend events, and build careers.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#0d1117",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alumni Portal",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="strip-extension-tags"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver((mutations) => {
                  for (let i = 0; i < mutations.length; i++) {
                    const addedNodes = mutations[i].addedNodes;
                    for (let j = 0; j < addedNodes.length; j++) {
                      const node = addedNodes[j];
                      if (node.nodeType === 1) {
                        if (node.hasAttribute('bis_skin_checked')) node.removeAttribute('bis_skin_checked');
                        const elements = node.querySelectorAll('[bis_skin_checked]');
                        for (let k = 0; k < elements.length; k++) elements[k].removeAttribute('bis_skin_checked');
                      }
                    }
                    const target = mutations[i].target;
                    if (target.nodeType === 1 && target.hasAttribute('bis_skin_checked')) target.removeAttribute('bis_skin_checked');
                  }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['bis_skin_checked'] });
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0d1117] text-[#e8edf5] font-sans" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
