// components/Sidebar.js (File Baru)
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Wrench, ShoppingBag, Users, FileText, Settings, ChevronLeft
} from 'lucide-react';
import Image from 'next/image'; // <-- Tambahkan import ini

const NAV_LINKS = [
  { href: '/services', label: 'Servis', icon: <Wrench size={18} /> },
  { href: '/inventory', label: 'Inventaris', icon: <ShoppingBag size={18} /> },
  { href: '/customers', label: 'Pelanggan', icon: <Users size={18} /> },
  { href: '/reports', label: 'Laporan', icon: <FileText size={18} /> },
];

export default function Sidebar({ branchName }) {
  const router = useRouter();
  const branchSlug = branchName ? branchName.toLowerCase() : '';

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-foreground flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          {/* --- GANTI BAGIAN INI --- */}
          <Image
            src="/Logo.png" // Sesuaikan dengan nama file Anda
            alt="Logo Perusahaan"
            width={32} // Atur lebar logo
            height={32} // Atur tinggi logo
          />
          {/* --- SAMPAI SINI --- */}
          <span className="font-bold text-lg text-card-foreground">AILabs</span>
        </Link>
      </div>

      {/* Navigasi */}
      <div className="flex-grow p-4 overflow-y-auto">
        <nav className="flex flex-col gap-4">
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</h3>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(link => {
                const isActive = router.pathname.startsWith(`/${branchSlug}${link.href}`);
                return (
                  <Link
                    key={link.href}
                    href={branchSlug ? `/${branchSlug}${link.href}` : '#'}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Anda bisa menambahkan section lain seperti "APPS" di sini */}
        </nav>
      </div>
      
      {/* Kembali ke Pemilihan Cabang */}
       <div className="p-4 border-t border-border">
         <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronLeft size={16} />
            <span>Pilih Cabang</span>
        </Link>
       </div>
    </aside>
  );
}