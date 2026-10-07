import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://seeingstarsagency.com"),
  title: "Seeing Stars Agency | Brand and business support for emerging artists",
  description:
    "Seeing Stars Agency helps emerging artists build a brand people remember and handles the business behind the music: registrations, releases, branding and campaigns.",
  openGraph: {
    title: "Seeing Stars Agency",
    description:
      "Brand and business support for emerging artists, so every play pays.",
    url: "https://seeingstarsagency.com",
    siteName: "Seeing Stars Agency",
    type: "website",
  },
  icons: { icon: "/star.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,500;1,9..144,800;1,9..144,900&family=Caveat:wght@600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
