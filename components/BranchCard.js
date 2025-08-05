// File: components/BranchCard.js

import { useState, useEffect } from 'react';

export default function BranchCard({ branch }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'offline'
  const [data, setData] = useState(null);

  useEffect(() => {
    // Alamat API proxy kita, BUKAN URL tunnel langsung.
    const proxyUrl = `/api/branch/${branch.subdomain}`;

    fetch(proxyUrl)
      .then(res => {
        if (!res.ok) {
          // Jika proxy gagal menghubungi tunnel, statusnya akan error (misal 503)
          throw new Error('Cabang offline atau tidak merespon.');
        }
        return res.json();
      })
      .then(fetchedData => {
        setData(fetchedData.data); // Ambil array data dari dalam objek response
        setStatus('success');
      })
      .catch(error => {
        console.error(`Gagal memuat data untuk ${branch.name}:`, error.message);
        setStatus('offline');
      });
  }, [branch]); // Efek ini berjalan setiap kali ada perubahan pada data 'branch'

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <p className="text-gray-500">Memuat data...</p>;
      case 'offline':
        return <p className="text-red-600 font-semibold">Cabang Offline</p>;
      case 'success':
        return (
          <div>
            <p>Total Servis: <span className="font-bold">{data?.length || 0}</span></p>
            {/* Anda bisa menambahkan kalkulasi lain di sini */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-300 bg-white p-4 rounded-lg shadow-sm w-full md:w-1/3">
      <h3 className="font-bold text-xl mb-2">{branch.name}</h3>
      {renderContent()}
    </div>
  );
}