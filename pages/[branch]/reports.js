// pages/[branch]/reports.js (Refactor Desain DashCode)
import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Wallet, ShoppingBag, Wrench, Clock, Hash, AlertCircle } from 'lucide-react';
import Link from 'next/link'; // <--- TAMBAHKAN BARIS INI

// --- Helper Functions ---
const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number) || 0);

// --- Komponen Kartu Ringkasan ---
const ReportCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-card p-5 rounded-lg shadow-sm border border-border flex items-center gap-5">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        </div>
    </div>
);

// --- Komponen Kartu Riwayat ---
const TransactionHistoryCard = ({ title, icon, transactions }) => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-3 text-card-foreground">{icon} {title}</h3>
            <div className="overflow-auto flex-grow pr-2 -mr-4">
                <ul className="space-y-4">
                    {(transactions && transactions.length > 0) ? transactions.map(t => (
                        <li key={t.id} className="p-4 rounded-md border border-border bg-background">
                            <div className="flex justify-between items-start text-sm mb-2 pb-2 border-b border-border">
                                <div className="font-semibold">
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Hash size={14}/> {t.id}</p>
                                    <p className="mt-1 text-foreground">{t.customerName || 'Pelanggan'}</p>
                                </div>
                                <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Clock size={14}/> {new Date(t.date).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="text-sm text-right mt-2 font-medium">
                                <span>Total: <strong className="text-foreground">{formatCurrency(t.totalAmount)}</strong></span>
                                <span className="ml-4">Laba: <strong className="text-green-400">{formatCurrency(t.totalProfit)}</strong></span>
                            </div>
                        </li>
                    )) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p className="font-medium">Tidak Ada Riwayat</p>
                            <p className="text-sm">Belum ada transaksi pada periode ini.</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
};

// --- Komponen Halaman Utama ---
export default function ReportsPage({ reportData, error, branchName, activeBranch }) {
    const { salesHistory, serviceHistory } = useMemo(() => {
        if (!reportData?.transactions) return { salesHistory: [], serviceHistory: [] };
        const sales = reportData.transactions.filter(t => t.id.startsWith('SLS-'));
        const services = reportData.transactions.filter(t => t.id.startsWith('SVC-'));
        return { salesHistory: sales, serviceHistory: services };
    }, [reportData?.transactions]);
    
    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Laporan Penjualan</h1>
            <p className="text-lg text-gray-600 mb-6">Cabang: <span className="font-semibold text-blue-600">{branchName}</span></p>
            
            <SideNavigation activeBranch={activeBranch} currentPage="reports" />
            
            {/* ... (sisa JSX dari komponen utama bisa disalin dari file lama, tidak ada perubahan) ... */}
        </main>
    );
}

const SideNavigation = ({ activeBranch, currentPage }) => {
    const navItems = [
        { href: 'reports', label: 'Laporan' },
        { href: 'services', label: 'Servis' },
        { href: 'inventory', label: 'Inventaris' },
        { href: 'customers', label: 'Pelanggan' },
    ];

    return (
        <div className="mb-8 flex items-center border-b border-gray-200">
            {navItems.map(item => (
                <Link key={item.href}
                    href={`/${activeBranch.name.toLowerCase()}/${item.href}`}
                    className={`py-3 px-5 text-sm font-semibold border-b-2 ${currentPage === item.href ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {item.label}
                </Link>
            ))}
        </div>
    );
};


// === PENGAMBILAN DATA SISI SERVER (DIUBAH TOTAL) ===
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;

    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());

    const emptyReportData = { summary: null, transactions: [], items: [] };

    if (!activeBranch) {
        return { props: { error: 'Cabang tidak ditemukan.', reportData: emptyReportData, branchName } };
    }

    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const branchId = activeBranch.subdomain; // 'subdomain' sekarang adalah ID Cabang

    const startDate = new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    try {
        // Fungsi helper untuk fetch data dari API Pusat
        const fetchData = async (path, params = {}) => {
            const query = new URLSearchParams({ branch_id: branchId, ...params }).toString();
            const url = `${API_CENTRAL_URL}/api/${path}?${query}`;
            
            console.log(`Fetching from: ${url}`); // Untuk debugging di server Vercel
            
        const response = await fetch(url, {
            headers: {
                'x-api-key': process.env.API_KEY || '',
                // Header untuk melewati halaman peringatan zrok
                'skip_zrok_interstitial': 'true'
            }
        });
            if (!res.ok) throw new Error(`Failed to fetch ${path}`);
            return res.json();
        };

        // Mengambil semua data secara paralel
        const [summaryResult, transactionsResult, itemsResult] = await Promise.all([
            fetchData('reports/sales-summary', { startDate, endDate }),
            fetchData('sync/transactions', { limit: 1000 }), // Mengambil dari endpoint sync untuk data mentah
            fetchData('sync/transaction_items', { limit: 5000 })
        ]);

        return {
            props: {
                reportData: {
                    summary: summaryResult.data,
                    transactions: transactionsResult.data,
                    items: itemsResult.data,
                },
                error: null,
                branchName: activeBranch.name,
                activeBranch, // Kirim data cabang aktif ke props
            },
        };

    } catch (err) {
        console.error(`[Fetch Error] Gagal mengambil data untuk cabang ${branchName}:`, err.message);
        return {
            props: {
                error: `Gagal menghubungi server pusat untuk data cabang ${branchName}. Pastikan server dan tunnel berjalan.`,
                reportData: emptyReportData,
                branchName: activeBranch.name,
                activeBranch,
            }
        };
    }
}


