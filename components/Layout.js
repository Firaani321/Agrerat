// components/Layout.js (Versi Final Tanpa Header)
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const router = useRouter();
  const { branch } = router.query;
  const isHomePage = router.pathname === '/';

  // Halaman utama (pemilihan cabang) tidak menggunakan layout ini
  if (isHomePage) {
    return (
      <main className="min-h-screen bg-background">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar tetap ada di sebelah kiri */}
      <Sidebar branchName={branch} />
      
      {/* Area Konten Utama sekarang mengisi sisa ruang */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}