// File: pages/[branch]/services.js (FINAL - Dengan Perbaikan ReferenceError)

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Eye, X, User, Tag, Calendar, DollarSign, ShoppingCart, Filter, Edit, Wifi, WifiOff } from 'lucide-react';
import useWebSocket, { ReadyState } from 'react-use-websocket'; // <-- Library untuk WebSocket
import { useRouter } from 'next/router';



// =======================================================
// ===           KOMPONEN & HELPER FUNCTIONS           ===
// =======================================================

const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number) || 0);
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return dateString; }
};

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

// --- Komponen Filter Popover ---
const ServiceFilterPopover = ({ isOpen, onClose, onApply, initialFilters }) => {
    const STATUS_OPTIONS = [
        { value: 'queue', label: 'Antrian' }, { value: 'in_progress', label: 'Dikerjakan' },
        { value: 'completed', label: 'Selesai' }, { value: 'paid', label: 'Dibayar' },
        { value: 'debts', label: 'Utang' }, { value: 'cancelled', label: 'Dibatalkan' },
    ];
    const [selectedStatuses, setSelectedStatuses] = useState(initialFilters.statuses || []);
    const popoverRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (popoverRef.current && !popoverRef.current.contains(event.target)) onClose(); };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);
    useEffect(() => { if (isOpen) setSelectedStatuses(initialFilters.statuses || []); }, [isOpen, initialFilters]);
    if (!isOpen) return null;
    const handleStatusToggle = (statusValue) => setSelectedStatuses(prev => prev.includes(statusValue) ? prev.filter(s => s !== statusValue) : [...prev, statusValue]);
    const handleApply = () => { onApply({ statuses: selectedStatuses }); onClose(); };
    const handleReset = () => { onApply({ statuses: [] }); onClose(); };
    return (
        <div ref={popoverRef} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-4 border-b flex justify-between items-center"><h2 className="text-lg font-bold">Filter Status</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1"><X size={20} /></button></div>
            <div className="p-4"><div className="grid grid-cols-2 gap-3">{STATUS_OPTIONS.map(opt => (<label key={opt.value} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={selectedStatuses.includes(opt.value)} onChange={() => handleStatusToggle(opt.value)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span>{opt.label}</span></label>))}</div></div>
            <div className="p-3 bg-gray-50 flex justify-end items-center space-x-2"><button onClick={handleReset} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-semibold">Reset</button><button onClick={handleApply} className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold">Terapkan</button></div>
        </div>
    );
};

// --- Komponen Modal Detail ---
const ServiceDetailModal = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;
    const totalBiaya = service.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || service.total_cost || 0;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Detail Servis: {service.id_service}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1"><X size={24} /></button></div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3"><User size={16} className="text-gray-500" /><span><strong>Pelanggan:</strong> {service.customer?.name || '-'}</span></div>
                        <div className="flex items-center gap-3"><Tag size={16} className="text-gray-500" /><span><strong>Status:</strong> <span className="font-semibold">{service.status?.toUpperCase().replace('_', ' ')}</span></span></div>
                        <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-500" /><span><strong>Tanggal:</strong> {formatDate(service.createdat)}</span></div>
                    </div>
                    <div><h3 className="font-semibold text-md mb-2 flex items-center gap-2"><ShoppingCart size={18} /> Item Servis & Jasa</h3><ul className="border rounded-md divide-y">{service.items && service.items.length > 0 ? service.items.map(item => (<li key={item.local_id} className="p-3 flex justify-between items-center"><div><p className="font-medium">{item.product_name}</p><p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p></div><p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p></li>)) : <li className="p-3 text-center text-gray-500 text-sm">Tidak ada item.</li>}</ul></div>
                    {service.notes && (<div><h3 className="font-semibold text-md mb-2 flex items-center gap-2"><Edit size={18} /> Catatan</h3><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">{service.notes}</p></div>)}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2"><div className="flex justify-between text-xl font-bold"><span>Total Tagihan</span><span>{formatCurrency(totalBiaya)}</span></div></div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end"><button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-semibold">Tutup</button></div>
            </div>
        </div>
    );
};

// --- Komponen Baris & Tabel ---
const ServiceTableRow = React.memo(({ service, onViewDetails }) => {
    const STATUS_STYLES = { queue: { text: 'text-gray-600', bg: 'bg-gray-100' }, in_progress: { text: 'text-yellow-800', bg: 'bg-yellow-100' }, completed: { text: 'text-green-800', bg: 'bg-green-100' }, paid: { text: 'text-blue-800', bg: 'bg-blue-100' }, cancelled: { text: 'text-red-800', bg: 'bg-red-100' }, debts: { text: 'text-orange-800', bg: 'bg-orange-100' }, };
    const totalHarga = service.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || service.total_cost || 0;
    const style = STATUS_STYLES[service.status] || STATUS_STYLES.queue;
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(service.createdat)}</td><td className="px-4 py-3 font-medium text-gray-900">{service.customer?.name || 'N/A'}</td>
            <td className="px-4 py-3 font-mono text-sm">{service.id_service}</td><td className="px-4 py-3 text-right font-mono font-semibold">{formatCurrency(totalHarga)}</td>
            <td className="px-4 py-3"><span className={`px-3 py-1 text-xs font-bold rounded-full ${style.bg} ${style.text}`}>{service.status.replace('_', ' ').toUpperCase()}</span></td>
            <td className="px-4 py-3 text-center"><button onClick={() => onViewDetails(service)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Lihat Detail Pekerjaan"><Eye size={18} /></button></td>
        </tr>
    );
});
ServiceTableRow.displayName = 'ServiceTableRow';
const ServiceTable = ({ services, onViewDetails }) => {
    if (!services || services.length === 0) return <div className="text-center py-16 text-gray-500"><p className="font-semibold">Tidak Ada Data</p><p className="text-sm">Tidak ada servis yang cocok dengan filter Anda.</p></div>;
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="min-w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Tanggal</th><th scope="col" className="px-4 py-3">Nama Pelanggan</th><th scope="col" className="px-4 py-3">ID Servis</th><th scope="col" className="px-4 py-3 text-right">Total Biaya</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3 text-center">Aksi</th></tr></thead>
                <tbody>{services.map(service => <ServiceTableRow key={service.id_service} service={service} onViewDetails={onViewDetails} />)}</tbody>
            </table>
        </div>
    );
};

// =======================================================
// ===           HALAMAN UTAMA SERVICE PAGE            ===
// =======================================================
export default function ServicePage({ initialServices, initialCustomers, initialServiceItems, error, branchName, activeBranch }) {
    // --- State Management ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ statuses: [] });
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [detailModalState, setDetailModalState] = useState({ isOpen: false, service: null });
    
    // --- PENAMBAHAN: State untuk data yang ditampilkan ---
    // Diinisialisasi dengan data dari server, tapi akan diupdate oleh WebSocket
    const [services, setServices] = useState(initialServices);
    const [customers, setCustomers] = useState(initialCustomers);
    const [serviceItems, setServiceItems] = useState(initialServiceItems);
    
    const router = useRouter();

    // Efek ini memastikan jika pengguna me-refresh data (misal navigasi), state akan diperbarui
    useEffect(() => {
        setServices(initialServices);
        setCustomers(initialCustomers);
        setServiceItems(initialServiceItems);
    }, [initialServices, initialCustomers, initialServiceItems]);


    // --- PENAMBAHAN: Logika Koneksi WebSocket ---
    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const wsUrl = API_CENTRAL_URL ? API_CENTRAL_URL.replace(/^http/, 'ws') : null; 
    
    const { readyState } = useWebSocket(wsUrl, {
        onOpen: () => console.log('[WS] Koneksi WebSocket dibuka!'),
        onClose: () => console.log('[WS] Koneksi WebSocket ditutup.'),
        onMessage: (event) => {
            const message = JSON.parse(event.data);
            console.log('[WS] Menerima pembaruan:', message);
            
            // Jika ada data yang diupdate dari cabang yang sedang dilihat,
            // kita refresh data halaman dengan memicu getServerSideProps lagi.
            if (message.event === 'data_updated' && message.branch_id === activeBranch.subdomain) {
                // router.replace digunakan untuk refresh data tanpa reload halaman penuh
                // dan menjaga posisi scroll.
                router.replace(router.asPath, undefined, { scroll: false });
            }
        },
        shouldReconnect: (closeEvent) => true, // Selalu coba konek ulang jika terputus
        reconnectInterval: 3000,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: { text: 'Menyambung...', color: 'text-yellow-500', icon: <Wifi size={14}/> },
        [ReadyState.OPEN]: { text: 'Real-time', color: 'text-green-500', icon: <Wifi size={14}/> },
        [ReadyState.CLOSING]: { text: 'Menutup...', color: 'text-orange-500', icon: <WifiOff size={14}/> },
        [ReadyState.CLOSED]: { text: 'Terputus', color: 'text-red-500', icon: <WifiOff size={14}/> },
        [ReadyState.UNINSTANTIATED]: { text: 'Menunggu', color: 'text-gray-500', icon: <WifiOff size={14}/> },
    }[readyState];
    
    
    // --- Data Processing ---
    // Logika useMemo sekarang menggunakan state (services, customers, dll)
    // bukan props (initialServices, initialCustomers, dll)
    const enrichedAndFilteredServices = useMemo(() => {
        if (error || !services) return [];
        const customerMap = new Map((customers || []).map(c => [c.local_id, c]));
        const itemsMap = new Map();
        (serviceItems || []).forEach(item => {
            if (!itemsMap.has(item.service_id)) itemsMap.set(item.service_id, []);
            itemsMap.get(item.service_id).push(item);
        });
        let enriched = services.map(service => ({
            ...service,
            customer: customerMap.get(service.customer_id),
            items: itemsMap.get(service.local_id) || [],
        }));
        if (filters.statuses.length > 0) enriched = enriched.filter(s => filters.statuses.includes(s.status));
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            enriched = enriched.filter(s =>
                s.customer?.name?.toLowerCase().includes(lowercasedQuery) ||
                s.id_service?.toLowerCase().includes(lowercasedQuery)
            );
        }
        return enriched.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
    }, [error, services, customers, serviceItems, searchQuery, filters]);

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-start mb-2">
                 <div>
                    <h1 className="text-3xl font-bold">Manajemen Servis</h1>
                    <p className="text-lg text-gray-600">Cabang: <span className="font-semibold text-blue-600">{branchName}</span></p>
                </div>
                <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${connectionStatus.color.replace('text', 'bg').replace('500', '100')}`}>
                    {connectionStatus.icon}
                    <span>{connectionStatus.text}</span>
                </div>
            </div>
            
            <SideNavigation activeBranch={activeBranch} currentPage="services" />
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Cari berdasarkan nama pelanggan atau ID servis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg"/></div>
                <div className="relative">
                    <button onClick={() => setFilterOpen(prev => !prev)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100"><Filter size={18} /> Filter Status</button>
                    <ServiceFilterPopover isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} onApply={setFilters} initialFilters={filters} />
                </div>
            </div>
            
            {error ? (<div className="text-center py-12 text-red-600 font-semibold bg-red-50 p-4 rounded-lg">{error}</div>) : (<ServiceTable services={enrichedAndFilteredServices} onViewDetails={(service) => setDetailModalState({ isOpen: true, service })} />)}
            
            <ServiceDetailModal isOpen={detailModalState.isOpen} onClose={() => setDetailModalState({ isOpen: false, service: null })} service={detailModalState.service} />
        </main>
    );
}
// =======================================================
// ===           PENGAMBILAN DATA SISI SERVER          ===
// =======================================================
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    const emptyProps = { initialServices: [], initialCustomers: [], initialServiceItems: [] };
    if (!activeBranch) return { props: { ...emptyProps, error: 'Cabang tidak ditemukan.', branchName, activeBranch: {} } };
    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const branchId = activeBranch.subdomain;
    try {
        const fetchData = async (path, params = {}) => {
            const query = new URLSearchParams({ branch_id: branchId, ...params }).toString();
            const url = `${API_CENTRAL_URL}/api/${path}?${query}`;
            const response = await fetch(url, { headers: { 'x-api-key': process.env.API_KEY || '', 'skip_zrok_interstitial': 'true' } });
            if (!response.ok) throw new Error(`Gagal fetch dari path '${path}' dengan status: ${response.status}`);
            return response.json();
        };
        const [servicesResult, customersResult, itemsResult] = await Promise.all([
            fetchData('sync/services', { limit: 2000 }),
            fetchData('sync/customers', { limit: 5000 }),
            fetchData('sync/service_items', { limit: 10000 })
        ]);
        return {
            props: {
                initialServices: servicesResult.data || [],
                initialCustomers: customersResult.data || [],
                initialServiceItems: itemsResult.data || [],
                branchName: activeBranch.name,
                activeBranch,
                error: null,
            },
        };
    } catch (err) {
        console.error(`[Fetch Error] Gagal mengambil data untuk ServicesPage cabang ${branchName}:`, err.message);
        return { props: { ...emptyProps, error: `Gagal menghubungi server pusat.`, branchName: activeBranch.name, activeBranch } };
    }
}

