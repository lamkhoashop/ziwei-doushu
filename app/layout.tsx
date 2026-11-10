import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import BugReportWidget from '@/components/BugReportWidget';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE_URL } from '@/lib/site';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-HFT50B6P0H';

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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tử Vi Đẩu Số · Trường Phái Thiên Kỷ Nghê Hải Hà',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tử Vi Đẩu Số · Trường Phái Thiên Kỷ Nghê Hải Hà',
    description: 'Hệ thống an sao Tử Vi Đẩu Số chuẩn chính thống kết hợp AI Agent luận giải chuyên sâu theo trường phái Nghê Hải Hà',
    images: ['/og-image.png'],
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Tử Vi Đẩu Số · Trường Phái Thiên Kỷ Nghê Hải Hà',
      description: 'Hệ thống an sao Tử Vi Đẩu Số chuẩn chính thống kết hợp AI Agent luận giải chuyên sâu theo trường phái Nghê Hải Hà',
      inLanguage: 'vi-VN',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/library/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'Tử Vi Đẩu Số AI',
      url: SITE_URL,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      softwareVersion: '1.1.0',
      inLanguage: 'vi-VN',
      image: `${SITE_URL}/og-image.png`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      },
      featureList: [
        'An sao Tử Vi Đẩu Số 12 cung chính thống',
        'Hiệu chỉnh giờ mặt trời thực tự động theo kinh độ địa lý',
        'Luận giải chuyên sâu cùng AI Agent Thiên Kỷ',
        'Tra cứu kho tàng cổ thư Tử Vi Đẩu Số Toàn Thư, Toàn Tập',
        'Xuất thiệp lá số tử vi độ phân giải cao',
      ],
      author: {
        '@type': 'Person',
        name: 'Nghê Hải Hà',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Tử Vi Đẩu Số',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Google Schema JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        {/* Google Fonts: Bộ Font Đạo Gia Huyền Bí (Philosopher + Playfair Display + Lora + Be Vietnam Pro + Thư Pháp Charm & Dancing Script) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Dancing+Script:wght@600;700&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m = window.location.search.match(/[?&]theme=(light|dark)/); if(m){document.documentElement.setAttribute('data-theme',m[1]);}else{var t=localStorage.getItem('ziwei-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <BugReportWidget />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
