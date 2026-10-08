import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/site/toaster";
import { getSiteContent } from "@/lib/content";
import { siteUrl } from "@/lib/env";
import { fileUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings, profile } = await getSiteContent();
  const title = settings.seoTitle || `${profile.name} — ${profile.title}`;
  const description = settings.seoDescription || profile.subHeadline;
  const ogImage = fileUrl(settings.ogImageFileId) ?? "/og";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${profile.name}` },
    description,
    keywords: settings.keywords,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      url: "/",
      title,
      description,
      siteName: profile.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${profile.name} — ${profile.headline}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

// Runs before first paint: applies the saved theme (or the OS preference on a
// first visit) and restores Recruiter Mode for this session. No flash.
const bootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.classList.toggle("dark",t==="dark");d.style.colorScheme=t;if(sessionStorage.getItem("recruiter-mode")==="on")d.setAttribute("data-recruiter","on")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full">
        {children}
        <Toaster />
        {/* Vercel Analytics only exists on Vercel deployments. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
