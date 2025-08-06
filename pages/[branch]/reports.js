// pages/[branch]/reports.js (Refactor Desain DashCode)
import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Wallet, ShoppingBag, Wrench, Clock, Hash, AlertCircle } from 'lucide-react';

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
export default function ReportsPage({ reportData, error }) {
    const { salesHistory, serviceHistory } = useMemo(() => {
        if (!reportData?.transactions) return { salesHistory: [], serviceHistory: [] };
        const sales = reportData.transactions.filter(t => t.id.startsWith('SLS-'));
        const services = reportData.transactions.filter(t => t.id.startsWith('SVC-'));
        return { salesHistory: sales, serviceHistory: services };
    }, [reportData?.transactions]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-card-foreground">Laporan Penjualan</h1>
            
            {error ? (
                <div className="flex items-center justify-center gap-3 text-center py-12 text-destructive font-semibold bg-destructive/10 p-4 rounded-lg">
                    <AlertCircle size={20} />
                    <span>Error: {error}</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Bagian Ringkasan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ReportCard title="Total Pendapatan" value={formatCurrency(reportData.summary.totalRevenue)} icon={<DollarSign size={24} />} colorClass="bg-green-500/10 text-green-400" />
                        <ReportCard title="Total Laba" value={formatCurrency(reportData.summary.totalProfit)} icon={<TrendingUp size={24} />} colorClass="bg-blue-500/10 text-blue-400" />
                        <ReportCard title="Total Transaksi" value={reportData.summary.totalTransactions?.toLocaleString('id-ID') || '0'} icon={<Wallet size={24} />} colorClass="bg-indigo-500/10 text-indigo-400" />
                    </div>

                    {/* Bagian Riwayat */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <TransactionHistoryCard title="Riwayat Penjualan Tunai" icon={<ShoppingBag size={20}/>} transactions={salesHistory} />
                        <TransactionHistoryCard title="Riwayat Servis Tunai" icon={<Wrench size={20}/>} transactions={serviceHistory} />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Data Fetching (tetap sama) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    const emptyProps = { reportData: { summary: {}, transactions: [] }, error: null, branchName: branchName || "Unknown" };

    if (!activeBranch) {
        return { props: { ...emptyProps, error: 'Tidak ada cabang yang dikonfigurasi.' } };
    }

    const isLocal = process.env.NODE_ENV === 'development';
    const protocol = isLocal ? 'http' : 'https';
    const host = isLocal ? 'localhost:3000' : context.req.headers.host;
    const proxyBaseUrl = `${protocol}://${host}/api/branch/${activeBranch.subdomain}`;

    try {
        const [summaryRes, transactionsRes] = await Promise.all([
            fetch(`${proxyBaseUrl}/reports/sales-summary?${dateParams}`),
            fetch(`${proxyBaseUrl}/transactions?${dateParams}&limit=1000`),
        ]);

        if (!summaryRes.ok || !transactionsRes.ok) {
            throw new Error(`Gagal memuat data laporan dari cabang ${activeBranch.name}.`);
        }

        const [summaryResult, transactionsResult] = await Promise.all([summaryRes.json(), transactionsRes.json()]);
        
        return {
            props: {
                reportData: {
                    summary: summaryResult.data || {},
                    transactions: transactionsResult.data || [],
                },
                error: null,
                branchName: activeBranch.name,
            },
        };
    } catch (err) {
        return { props: { ...emptyProps, error: `Gagal menghubungi cabang ${activeBranch.name}. Pastikan server dan tunnel berjalan.` } };
    }
}
