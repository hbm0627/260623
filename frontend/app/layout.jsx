import "./globals.css";

export const metadata = {
  title: "TIGHT Saju",
  description: "AI 사주 해석 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
