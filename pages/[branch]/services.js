// File: pages/[branch]/services.js (Versi FINAL dengan Perbaikan)

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Eye, AlertCircle } from 'lucide-react';

// --- Komponen & Helpers ---
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

const ServiceTable = ({ services, onViewDetails }) => {
    const STATUS_STYLES = {
        queue: 'border-l-gray-400', in_progress: 'border-l-yellow-400',
        completed: 'border-l-green-400', paid: 'border-l-blue-400',
        cancelled: 'border-l-red-400', debts: 'border-l-orange-400',
    };
    if (!services || services.length === 0) {
        return <div className="text-center py-12 text-gray-500">Tidak ada data servis untuk ditampilkan.</div>;
    }
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3">Tanggal</th>
                        <th scope="col" className="px-4 py-3">ID Servis</th>
                        <th scope="col" className="px-4 py-3">Nama Pelanggan</th>
                        <th scope="col" className="px-4 py-3 text-right">Total Biaya</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map(service => {
                        const totalHarga = service.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || service.total_cost || 0;
                        const rowStyle = STATUS_STYLES[service.status] || 'border-l-gray-300';
                        return (
                            <tr key={service.id_service} className={`bg-white border-b hover:bg-gray-50 border-l-8 ${rowStyle}`}>
                                <td className="px-4 py-3">{formatDate(service.createdAt)}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{service.id_service}</td>
                                <td className="px-4 py-3 font-medium">{service.customer?.name || 'N/A'}</td>
                                <td className="px-4 py-3 text-right font-mono">{formatCurrency(totalHarga)}</td>
                                <td className="px-4 py-3 font-semibold">{service.status.replace('_',' ').toUpperCase()}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => onViewDetails(service)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Lihat Detail"><Eye size={18} /></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- Komponen Halaman Utama ---
export default function ServicePage({ initialServices, initialCustomers, initialServiceItems, error, branchName, activeBranch }) {
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    
    const enrichedAndFilteredServices = useMemo(() => {
        if (error || !initialServices) return [];
        
        const customerMap = new Map((initialCustomers || []).map(c => [c.local_id, c]));
        const itemsMap = new Map();
        (initialServiceItems || []).forEach(item => {
            if (!itemsMap.has(item.service_id)) itemsMap.set(item.service_id, []);
            itemsMap.get(item.service_id).push(item);
        });

        const enriched = initialServices.map(service => ({
            ...service,
            customer: customerMap.get(service.customer_id),
            items: itemsMap.get(service.local_id) || [],
        }));
        
        const statusesForTab = activeTab === 'active' 
            ? ['queue', 'in_progress', 'completed'] 
            : ['paid', 'debts', 'cancelled'];
        
        let servicesForTab = enriched.filter(s => statusesForTab.includes(s.status));
        
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            servicesForTab = servicesForTab.filter(s =>
                s.customer?.name?.toLowerCase().includes(lowercasedQuery) ||
                s.id_service?.toLowerCase().includes(lowercasedQuery)
            );
        }
        return servicesForTab.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [error, initialServices, initialCustomers, initialServiceItems, activeTab, searchQuery]);

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Manajemen Servis</h1>
            <p className="text-lg text-gray-600 mb-6">Cabang: <span className="font-semibold text-blue-600">{branchName}</span></p>

            <SideNavigation activeBranch={activeBranch} currentPage="services" />
            
            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('active')}
                        className={`py-3 px-4 border-b-2 text-sm font-semibold ${activeTab === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Pekerjaan Aktif
                    </button>
                    <button onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 border-b-2 text-sm font-semibold ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        Riwayat Servis
                    </button>
                </nav>
            </div>
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Cari berdasarkan nama pelanggan atau ID servis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg"/>
            </div>
            
            {error ? (
                <div className="text-center py-12 text-red-600 font-semibold bg-red-50 p-4 rounded-lg flex items-center justify-center gap-2">
                    <AlertCircle size={20} /> {error}
                </div>
            ) : (
                <ServiceTable services={enrichedAndFilteredServices} onViewDetails={(service) => alert(JSON.stringify(service, null, 2))} />
            )}
        </main>
    );
}

// --- Pengambilan Data Sisi Server (Diperbaiki) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    
    const emptyProps = { initialServices: [], initialCustomers: [], initialServiceItems: [] };

    if (!activeBranch) {
        return { props: { ...emptyProps, error: 'Cabang tidak ditemukan.', branchName, activeBranch: {} } };
    }

    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const branchId = activeBranch.subdomain;

    try {
        const fetchData = async (path, params = {}) => {
            const query = new URLSearchParams({ branch_id: branchId, ...params }).toString();
            const url = `${API_CENTRAL_URL}/api/${path}?${query}`;
            
            const response = await fetch(url, {
                headers: {
                    'x-api-key': process.env.API_KEY || '',
                    'skip_zrok_interstitial': 'true'
                }
            });

            // Perbaikan krusial: Menggunakan 'response' bukan 'res'
            if (!response.ok) {
                // Memberikan pesan error yang lebih detail
                throw new Error(`Gagal fetch dari path '${path}' dengan status: ${response.status}`);
            }
            return response.json();
        };

        const [servicesResult, customersResult, itemsResult] = await Promise.all([
            fetchData('sync/services', { limit: 1000 }),
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
        // Log ini akan muncul di terminal Vercel dan sangat membantu
        console.error(`[Fetch Error] Gagal mengambil data untuk ServicesPage cabang ${branchName}:`, err.message);
        return { 
            props: { 
                ...emptyProps, 
                error: `Gagal menghubungi server pusat. Pastikan server dan tunnel berjalan. (${err.message})`, 
                branchName: activeBranch.name, 
                activeBranch 
            } 
        };
    }
}
