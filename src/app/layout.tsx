import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: {
    default: "Toolbox Hub - Free Online Tools",
    template: "%s - Toolbox Hub",
  },
  description: "Free online tools for developers, designers, and everyone. JSON formatter, Base64 encoder, QR code generator, password generator, and more. No sign-up required.",
  keywords: ["online tools", "free tools", "developer tools", "json formatter", "base64", "qr code", "password generator", "image compressor"],
  metadataBase: new URL("https://toolbox-hub.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Toolbox Hub - Free Online Tools",
    description: "Free online tools for developers, designers, and everyone. No sign-up required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <p>&copy; {new Date().getFullYear()} Toolbox Hub. Free online tools. No sign-up needed.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}