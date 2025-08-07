// pages/[branch]/customers.js (Refactor Desain DashCode)
import React from 'react';
import Link from 'next/link'; // <--- TAMBAHKAN BARIS INI

// Komponen Navigasi Samping (bisa dibuat file terpisah nanti)
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

// --- Komponen Tabel Pelanggan ---
const CustomerTable = ({ customers }) => {
    if (!customers || customers.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-card rounded-lg border border-dashed">
                <p className="font-medium">Tidak Ada Data Pelanggan</p>
                <p className="text-sm">Belum ada pelanggan yang terdaftar di cabang ini.</p>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto bg-card rounded-lg border">
            <table className="min-w-full text-sm">
                <thead className="border-b border-border">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Pelanggan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telepon</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alamat</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {customers.map(customer => (
                        <tr key={customer.id} className="hover:bg-secondary transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{customer.name}</td>
                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{customer.phone || '-'}</td>
                            <td className="px-6 py-4 text-muted-foreground">{customer.address || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Komponen Halaman Utama ---
export default function CustomersPage({ initialCustomers, error, branchName, activeBranch }) {
    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Manajemen Pelanggan</h1>
            <p className="text-lg text-gray-600 mb-6">Cabang: <span className="font-semibold text-blue-600">{branchName}</span></p>

            <SideNavigation activeBranch={activeBranch} currentPage="customers" />

            {error ? (
                <div className="text-center py-12 text-red-600 font-semibold bg-red-50 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <CustomerTable customers={initialCustomers} />
            )}
        </main>
    );
}

// --- Data Fetching (tetap sama) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());

    if (!activeBranch) {
        return { props: { initialCustomers: [], error: 'Cabang tidak ditemukan.', branchName } };
    }

    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const branchId = activeBranch.subdomain; // ID Cabang
    const url = `${API_CENTRAL_URL}/api/sync/customers?branch_id=${branchId}&limit=1000`;

    try {
        const response = await fetch(url, { headers: { 'x-api-key': process.env.API_KEY || '' } });
        if (!response.ok) {
            throw new Error(`Gagal memuat data dari server pusat.`);
        }
        const result = await response.json();
        return { 
            props: { 
                initialCustomers: result.data, 
                error: null, 
                branchName: activeBranch.name,
                activeBranch
            } 
        };
    } catch (err) {
        console.error("Server-side fetch error for CustomersPage:", err);
        return { 
            props: { 
                initialCustomers: [], 
                error: `Gagal menghubungi server pusat.`, 
                branchName: activeBranch.name,
                activeBranch
            } 
        };
    }
}

