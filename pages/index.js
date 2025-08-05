// pages/index.js (Versi Modern & Berwarna)
import React from 'react';
import Link from 'next/link';
import { Building, ArrowRight } from 'lucide-react';

function BranchCard({ branch }) {
  return (
    <Link
      href={`/${branch.name.toLowerCase()}/services`}
      className="group bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary"
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-lg text-foreground">{branch.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">Lihat data operasional</p>
      </div>
    </Link>
  );
}

export default function HomePage({ branches }) {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-8"
      style={{ background: 'radial-gradient(circle, hsl(220 20% 92%), hsl(220 20% 97%))' }}
    >
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          Dashboard Perusahaan BY Ai Labs
        </h1>
        <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
          Selamat datang. Pilih salah satu cabang untuk memulai mengelola data.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {branches.length > 0 ? (
          branches.map(branch => <BranchCard key={branch.name} branch={branch} />)
        ) : (
          <div className="col-span-full bg-card p-8 rounded-lg text-center text-muted-foreground shadow-sm border">
            Belum ada cabang yang dikonfigurasi pada file `.env.local` Anda.
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const branches = JSON.parse(process.env.NEXT_PUBLIC_BRANCHES || '[]');
  return {
    props: { branches },
  };
}