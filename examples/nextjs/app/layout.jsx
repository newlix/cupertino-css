import "./globals.css";

export const metadata = {
  title: "Cider UI — Next.js",
};

// Runs before React hydration so .dark is set on first paint
// (avoids a flash of wrong theme). Keep it tiny and inlined.
const themeInit = `if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="cider cider-fixed">{children}</body>
    </html>
  );
}
