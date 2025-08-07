// pages/[branch]/inventory.js (Refactor Desain DashCode)
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link'; // <--- TAMBAHKAN BARIS INI

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

// --- Helper Functions ---
const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number) || 0);

// --- Komponen Tabel Produk ---
const ProductTable = ({ products }) => {
    if (!products || products.length === 0) {
        return <div className="text-center py-12 text-gray-500">Tidak ada produk untuk ditampilkan.</div>;
    }
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nama Produk</th>
                        <th scope="col" className="px-6 py-3">SKU</th>
                        <th scope="col" className="px-6 py-3 text-right">Harga Jual</th>
                        <th scope="col" className="px-6 py-3 text-right">Stok / Min.</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => {
                        const isLowStock = product.stock <= product.minStock;
                        return (
                            <tr key={product.local_id} className={`border-b hover:bg-gray-50 ${isLowStock ? 'bg-yellow-50' : 'bg-white'}`}>
                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                <td className="px-6 py-4">{product.sku || '-'}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(product.price)}</td>
                                <td className={`px-6 py-4 text-right font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>{product.stock} / {product.minStock}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- Komponen Halaman Utama ---
export default function InventoryPage({ initialProducts, error, branchName, activeBranch }) {
    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Manajemen Inventaris</h1>
            <p className="text-lg text-gray-600 mb-6">Cabang: <span className="font-semibold text-blue-600">{branchName}</span></p>
            
            <SideNavigation activeBranch={activeBranch} currentPage="inventory" />

            {error ? (
                <div className="text-center py-12 text-red-600 font-semibold bg-red-50 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <ProductTable products={initialProducts} />
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
        return { props: { initialProducts: [], error: 'Cabang tidak ditemukan.', branchName } };
    }

    const API_CENTRAL_URL = process.env.NEXT_PUBLIC_API_CENTRAL_URL;
    const branchId = activeBranch.subdomain;
    const url = `${API_CENTRAL_URL}/api/sync/products?branch_id=${branchId}&limit=1000`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': process.env.API_KEY || '',
                // Header untuk melewati halaman peringatan zrok
                'skip_zrok_interstitial': 'true'
            }
        });        
        if (!response.ok) {
            throw new Error(`Gagal memuat data dari server pusat.`);
        }
        const result = await response.json();
        return { 
            props: { 
                initialProducts: result.data, 
                error: null, 
                branchName: activeBranch.name,
                activeBranch 
            } 
        };
    } catch (err) {
        console.error("Server-side fetch error for InventoryPage:", err);
        return { 
            props: { 
                initialProducts: [], 
                error: `Gagal menghubungi server pusat.`, 
                branchName: activeBranch.name,
                activeBranch
            } 
        };
    }
}


