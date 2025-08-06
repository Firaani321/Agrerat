// pages/[branch]/inventory.js (Refactor Desain DashCode)
import React from 'react';
import { AlertTriangle } from 'lucide-react';

// --- Helper Functions ---
const formatCurrency = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number) || 0);

// --- Komponen Tabel Produk ---
const ProductTable = ({ products }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-card rounded-lg border border-dashed">
                <p className="font-medium">Tidak Ada Data Produk</p>
                <p className="text-sm">Inventaris untuk cabang ini masih kosong.</p>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto bg-card rounded-lg border">
            <table className="min-w-full text-sm">
                <thead className="border-b border-border">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama Produk</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga Jual</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stok</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {products.map(product => {
                        const isLowStock = product.stock <= product.minStock;
                        return (
                            <tr key={product.id} className="hover:bg-secondary transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                                <td className="px-6 py-4 text-muted-foreground">{product.sku || '-'}</td>
                                <td className="px-6 py-4 text-right font-mono text-foreground">{formatCurrency(product.price)}</td>
                                <td className={`px-6 py-4 text-right font-semibold ${isLowStock ? 'text-orange-400' : 'text-foreground'}`}>
                                    <div className="flex items-center justify-end gap-2">
                                        {isLowStock && <AlertTriangle size={14} />}
                                        <span>{product.stock} / {product.minStock}</span>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

// --- Komponen Halaman Utama ---
export default function InventoryPage({ initialProducts, error }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-card-foreground">Manajemen Inventaris</h1>
            {error ? (
                <div className="text-center py-12 text-destructive font-semibold bg-destructive/10 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <ProductTable products={initialProducts} />
            )}
        </div>
    );
}

// --- Data Fetching (tetap sama) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    const emptyProps = { initialProducts: [], error: null, branchName: branchName || "Unknown" };

    if (!activeBranch) {
        return { props: { ...emptyProps, error: 'Tidak ada cabang yang dikonfigurasi.' } };
    }

    const isLocal = process.env.NODE_ENV === 'development';
    const protocol = isLocal ? 'http' : 'https';
    const host = isLocal ? 'localhost:3000' : context.req.headers.host;
    const proxyUrl = `${protocol}://${host}/api/branch/${activeBranch.subdomain}/products?limit=1000`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Gagal memuat data dari cabang ${activeBranch.name}.`);
        }
        const result = await response.json();
        return { 
            props: { 
                initialProducts: result.data, 
                error: null, 
                branchName: activeBranch.name 
            } 
        };
    } catch (err) {
        return { props: { ...emptyProps, error: `Gagal menghubungi cabang ${activeBranch.name}.` } };
    }
}
