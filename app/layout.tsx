import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Link } from "@nextui-org/link";
import { Toaster } from "react-hot-toast";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/providers/authProvider";


export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/graduation-cap.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="pl">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>

          <div className="relative flex flex-col h-screen">
            <AuthProvider>
              <Navbar />
              <main className="container mx-auto max-w-7xl pt-4 sm:px-6 px-2 flex-grow">
                {children}

                <Toaster
                  position="bottom-right"
                  reverseOrder={false}
                />
              </main>
              <footer className="z-50 container mx-auto flex flex-wrap gap-4 items-center sm:justify-between justify-center p-5 border-t-2 border-default-300 mt-10">
                <span className="text-default-600">Copyright &copy; 2025 Michał Polak</span>
                <Link
                  isExternal
                  className="flex items-center gap-1 text-current"
                  href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
                  title="nextui.org homepage"
                >
                  <span className="text-default-600">Powered by</span>
                  <p className="text-primary">NextUI</p>
                </Link>
              </footer>
            </AuthProvider>
          </div>

        </Providers>
      </body>
    </html>
  );
}
