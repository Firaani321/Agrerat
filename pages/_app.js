// File: pages/_app.js (Versi BARU yang Lebih Bersih)

import '../styles/globals.css';
import Link from 'next/link';

function TopBar() {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg text-slate-800 hover:text-blue-600">
          Dashboard Kasir
        </Link>
      </div>
    </header>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <TopBar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
