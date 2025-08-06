// pages/[branch]/customers.js (Refactor Desain DashCode)
import React from 'react';

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
export default function CustomersPage({ initialCustomers, error }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-card-foreground">Manajemen Pelanggan</h1>
            {error ? (
                <div className="text-center py-12 text-destructive font-semibold bg-destructive/10 p-4 rounded-lg">Error: {error}</div>
            ) : (
                <CustomerTable customers={initialCustomers} />
            )}
        </div>
    );
}

// --- Data Fetching (tetap sama) ---
export async function getServerSideProps(context) {
    const { branch: branchName } = context.params;
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    const activeBranch = branches.find(b => b.name.toLowerCase() === branchName.toLowerCase());
    const emptyProps = { initialCustomers: [], error: null, branchName: branchName || "Unknown" };

    if (!activeBranch) {
        return { props: { ...emptyProps, error: 'Tidak ada cabang yang dikonfigurasi.' } };
    }

    const isLocal = process.env.NODE_ENV === 'development';
    const protocol = isLocal ? 'http' : 'https';
    const host = isLocal ? 'localhost:3000' : context.req.headers.host;
    const proxyUrl = `${protocol}://${host}/api/branch/${activeBranch.subdomain}/customers?limit=1000`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Gagal memuat data dari cabang ${activeBranch.name}.`);
        }
        const result = await response.json();
        return { 
            props: { 
                initialCustomers: result.data, 
                error: null, 
                branchName: activeBranch.name 
            } 
        };
    } catch (err) {
        return { props: { ...emptyProps, error: `Gagal menghubungi cabang ${activeBranch.name}.` } };
    }
}
