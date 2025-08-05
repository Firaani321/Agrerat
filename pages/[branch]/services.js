// pages/[branch]/services.js (Refactor Desain DashCode)
import React, { useState, useMemo } from 'react';
import { Search, Eye, X } from 'lucide-react';

// --- Helper Functions ---
const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number) || 0);
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return dateString; }
};

const STATUS_STYLES = {
    queue: 'bg-gray-500/10 text-gray-300',
    in_progress: 'bg-yellow-500/10 text-yellow-400',
    completed: 'bg-green-500/10 text-green-400',
    paid: 'bg-blue-500/10 text-blue-400',
    cancelled: 'bg-red-500/10 text-red-400',
    debts: 'bg-orange-500/10 text-orange-400',
};

// --- Komponen Tabel Servis ---
const ServiceTable = ({ services, onViewDetails }) => {
    if (!services || services.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-card rounded-lg border border-dashed">
                <p className="font-medium">Tidak Ada Data Servis</p>
                <p className="text-sm">Data untuk tab ini tidak ditemukan.</p>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto bg-card rounded-lg border">
            <table className="min-w-full text-sm">
                <thead className="border-b border-border">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID & Pelanggan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Biaya</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {services.map(service => (
                        <tr key={service.id} className="hover:bg-secondary transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDate(service.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-foreground">{service.id_service}</div>
                                <div className="text-muted-foreground">{service.customer?.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-foreground">{formatCurrency(service.total_cost || 0)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[service.status] || ''}`}>
                                    {service.status.replace('_',' ').toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => onViewDetails(service)} className="p-2 text-muted-foreground hover:bg-primary/20 hover:text-primary rounded-full transition-colors" title="Lihat Detail"><Eye size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Komponen Modal Detail ---
const ServiceDetailModal = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-card-foreground">Detail Servis: <span className="text-primary">{service.id_service}</span></h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary"><X size={20} className="text-muted-foreground" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-muted-foreground">Pelanggan</p><p className="font-semibold text-foreground">{service.customer?.name || '-'}</p></div>
                        <div><p className="text-muted-foreground">Status</p><p className="font-semibold text-foreground">{service.status?.toUpperCase()}</p></div>
                        <div><p className="text-muted-foreground">Tanggal Masuk</p><p className="font-semibold text-foreground">{formatDate(service.createdAt)}</p></div>
                        <div><p className="text-muted-foreground">Total Biaya</p><p className="font-semibold text-foreground">{formatCurrency(service.total_cost || 0)}</p></div>
                    </div>
                    {/* Di sini Anda bisa menambahkan detail item servis jika ada */}
                </div>
                <div className="p-4 bg-sidebar flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-semibold">Tutup</button>
                </div>
            </div>
        </div>
    );
};


// --- Komponen Halaman Utama ---
const TABS = { ACTIVE: 'active', HISTORY: 'history' };
const TAB_CONFIG = {
  [TABS.ACTIVE]: { label: 'Pekerjaan Aktif', statuses: ['queue', 'in_progress', 'completed'] },
  [TABS.HISTORY]: { label: 'Riwayat Servis', statuses: ['paid', 'debts', 'cancelled'] }
};

export default function ServicePage({ initialServices, error, branchName }) {
    const [activeTab, setActiveTab] = useState(TABS.ACTIVE);
    const [searchQuery, setSearchQuery] = useState('');
    const [detailModalState, setDetailModalState] = useState({ isOpen: false, service: null });

    const filteredServices = useMemo(() => {
        if (!initialServices) return [];
        const statusesForTab = TAB_CONFIG[activeTab].statuses;
        let servicesForTab = initialServices.filter(s => statusesForTab.includes(s.status));
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            servicesForTab = servicesForTab.filter(s =>
                s.customer?.name?.toLowerCase().includes(lowercasedQuery) ||
                s.id_service?.toLowerCase().includes(lowercasedQuery)
            );
        }
        return servicesForTab.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [initialServices, activeTab, searchQuery]);

    const handleOpenDetailModal = (service) => setDetailModalState({ isOpen: true, service });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-card-foreground">Manajemen Servis</h1>

            {/* Kartu untuk Kontrol: Tabs dan Search */}
            <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-secondary p-1 rounded-md">
                    {Object.values(TABS).map(tabKey => (
                        <button key={tabKey} onClick={() => setActiveTab(tabKey)}
                        className={`py-1.5 px-4 rounded-md text-sm font-semibold transition-colors ${activeTab === tabKey ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-background/50'}`}>
                        {TAB_CONFIG[tabKey].label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="w-full max-w-xs relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Cari ID atau pelanggan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-input pl-10 pr-4 py-2 rounded-md text-sm focus:ring-1 focus:ring-primary focus:outline-none"/>
                </div>
            </div>
            
            {/* Konten Utama: Tabel atau Pesan Error */}
            {error ? (
                <div className="text-center py-12 text-destructive font-semibold bg-destructive/10 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <ServiceTable services={filteredServices} onViewDetails={handleOpenDetailModal} />
            )}
            
            <ServiceDetailModal isOpen={detailModalState.isOpen} onClose={() => setDetailModalState({ isOpen: false, service: null })} service={detailModalState.service} />
        </div>
    );
}

// --- Data Fetching (tetap sama) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    const emptyProps = { initialServices: [], error: null, branchName: branchName || "Unknown" };

    if (!activeBranch) {
        return { props: { ...emptyProps, error: 'Tidak ada cabang yang dikonfigurasi.' } };
    }

    const proxyBaseUrl = `http://localhost:3000/api/branch/${activeBranch.subdomain}`;

    try {
        const [servicesRes, customersRes] = await Promise.all([
            fetch(`${proxyBaseUrl}/services?limit=1000`),
            fetch(`${proxyBaseUrl}/customers`),
        ]);

        if (!servicesRes.ok || !customersRes.ok) {
            throw new Error('Gagal memuat data dari cabang');
        }

        const [servicesResult, customersResult] = await Promise.all([servicesRes.json(), customersRes.json()]);

        const servicesWithCustomer = servicesResult.data.map(service => ({
            ...service,
            customer: customersResult.data.find(c => c.id === service.customer_id)
        }))

        return {
            props: {
                initialServices: servicesWithCustomer,
                branchName: activeBranch.name,
                error: null,
            },
        };
    } catch (err) {
        return { props: { ...emptyProps, branchName: activeBranch.name, error: `Gagal menghubungi cabang ${activeBranch.name}.` } };
    }
}