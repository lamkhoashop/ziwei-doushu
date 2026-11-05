import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tử Vi Đẩu Số · Trường Phái Thiên Kỷ Nghê Hải Hà',
  description: 'Hệ thống an sao Tử Vi Đẩu Số chuẩn chính thống kết hợp AI Agent luận giải chuyên sâu theo trường phái Nghê Hải Hà',
  keywords: 'Tử Vi, Tử Vi Đẩu Số, Nghê Hải Hà, Thiên Kỷ, Lá số tử vi, 14 chính tinh, 12 cung, Tứ hóa',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tử Vi Đẩu Số · Trường Phái Thiên Kỷ Nghê Hải Hà',
    description: 'Hệ thống an sao Tử Vi Đẩu Số chuẩn chính thống kết hợp AI Agent luận giải chuyên sâu theo trường phái Nghê Hải Hà',
    url: SITE_URL,
    siteName: 'Tử Vi Đẩu Số',
    locale: 'vi_VN',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '808FFC6023A2C359B375DD860FEDA856',
      'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
      '360-site-verification': process.env.NEXT_PUBLIC_360_VERIFICATION || '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* Google Fonts: Lora (Cổ Thư, Tử Vi Á Đông) & Be Vietnam Pro (Chuẩn ngữ điệu & dấu Tiếng Việt) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
