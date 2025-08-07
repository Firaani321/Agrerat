// File: pages/index.js (Versi BARU)

import React from 'react';
import Link from 'next/link';
import { Building } from 'lucide-react';

function BranchCard({ branch }) {
    // URL sekarang akan menjadi /nama-cabang/reports untuk langsung ke halaman laporan
    return (
        <Link 
            href={`/${branch.name.toLowerCase()}/reports`}
            className="block border border-slate-200 bg-white p-8 rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 hover:border-blue-500 group"
        >
            <div className="text-center">
                <Building size={40} className="mx-auto text-slate-400 group-hover:text-blue-500 transition-colors"/>
                <h3 className="font-bold text-2xl text-slate-800 mt-4">{branch.name}</h3>
                <p className="text-sm text-slate-500 mt-2">Lihat Laporan & Detail</p>
            </div>
        </Link>
    );
}

export default function HomePage({ branches }) {
    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard Laporan Terpusat</h1>
                <p className="text-lg text-slate-600">Silakan pilih cabang untuk melihat detail laporan dan data operasional.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12 max-w-7xl mx-auto">
                {branches.length > 0 ? (
                    branches.map(branch => <BranchCard key={branch.name} branch={branch} />)
                ) : (
                    <p className="text-slate-500 col-span-full text-center">
                        Belum ada cabang yang dikonfigurasi di file .env.local
                    </p>
                )}
            </div>
        </main>
    );
}

// getServerSideProps sekarang hanya membaca environment variable, tidak perlu fetch
export async function getServerSideProps() {
    const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
    return {
        props: {
            branches,
        },
    };
}
