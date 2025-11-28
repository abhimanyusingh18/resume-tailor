import './globals.css';

export const metadata = {
  title: 'AI Resume Tailor - Customize Your Resume with AI | Job Application Tool',
  description: 'Free AI-powered resume tailor that customizes your resume for any job description. Upload your PDF resume and get a perfectly tailored LaTeX resume in seconds using Google Gemini AI.',
  keywords: 'AI resume tailor, resume customization, job application, ATS optimization, LaTeX resume, resume generator, AI resume builder, job description matching',
  authors: [{ name: 'AI Resume Tailor' }],
  creator: 'AI Resume Tailor',
  publisher: 'AI Resume Tailor',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tailor.abhimanyu.live',
    title: 'AI Resume Tailor - Customize Your Resume with AI',
    description: 'Free AI-powered resume tailor that customizes your resume for any job description. Get a perfectly tailored LaTeX resume in seconds.',
    siteName: 'AI Resume Tailor',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Resume Tailor - Customize Your Resume with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Tailor - Customize Your Resume with AI',
    description: 'Free AI-powered resume tailor. Upload your resume and job description, get a tailored LaTeX resume instantly.',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#d4af37',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'AI Resume Tailor',
              description: 'AI-powered resume customization tool that tailors your resume to match any job description.',
              url: 'https://tailor.abhimanyu.live',
              applicationCategory: 'BusinessApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'AI-powered resume tailoring',
                'PDF upload support',
                'LaTeX resume generation',
                'Job description matching',
                'ATS optimization',
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
