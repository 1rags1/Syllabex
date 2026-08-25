import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show } from "@clerk/nextjs";
import { AIAssistantDrawer } from "@/components/ai/AIAssistantDrawer";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AcademicProvider } from "@/context/AcademicContext";
import { AIAssistantProvider } from "@/context/AIAssistantContext";
import { isClerkConfigured } from "@/lib/clerk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UTD Academic Dashboard · Fall 2026",
  description:
    "Personal modern academic dashboard for Fall 2026 at The University of Texas at Dallas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkReady = isClerkConfigured();

  const app = (
    <AcademicProvider>
      <AIAssistantProvider>
        {clerkReady ? <AuthHeader /> : null}
        {children}
        {clerkReady ? (
          <Show when="signed-in">
            <AIAssistantDrawer />
          </Show>
        ) : (
          <AIAssistantDrawer />
        )}
      </AIAssistantProvider>
    </AcademicProvider>
  );

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {clerkReady ? (
          <ClerkProvider
            appearance={{
              cssLayerName: "clerk",
            }}
          >
            {app}
          </ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
