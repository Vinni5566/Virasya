import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { TranslationDOMGuard } from '@/components/TranslationDOMGuard';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Virasya',
  description: 'Where Heritage Craft Meets AI. Supporting artisans and preserving cultural authenticity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased selection:bg-primary/20" suppressHydrationWarning>
        <TranslationDOMGuard />
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>

        {/* Google Translate Hidden Element */}
        <div id="google_translate_element" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100 }}></div>

        {/* Google Translate Initialization Script */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,ta,bn,mr,gu,te,kn,ml,pa',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
