import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

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
  themeColor: "#0f1117",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alumni Portal",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="strip-extension-tags" strategy="beforeInteractive" suppressHydrationWarning>
          {`
            (function() {
              const observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                  const addedNodes = mutations[i].addedNodes;
                  for (let j = 0; j < addedNodes.length; j++) {
                    const node = addedNodes[j];
                    if (node.nodeType === 1) {
                      if (node.hasAttribute('bis_skin_checked')) {
                        node.removeAttribute('bis_skin_checked');
                      }
                      const elements = node.querySelectorAll('[bis_skin_checked]');
                      for (let k = 0; k < elements.length; k++) {
                        elements[k].removeAttribute('bis_skin_checked');
                      }
                    }
                  }
                  
                  const target = mutations[i].target;
                  if (target.nodeType === 1 && target.hasAttribute('bis_skin_checked')) {
                    target.removeAttribute('bis_skin_checked');
                  }
                }
              });
              observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['bis_skin_checked']
              });
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
