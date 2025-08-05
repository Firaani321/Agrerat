// File: pages/api/branch/[subdomain].js (Versi 3.0)

export default async function handler(req, res) {
  // Ambil subdomain DAN path data yang diminta (misal: 'products' atau 'reports/sales-summary')
  const { subdomain, dataType } = req.query;
  const apiKey = process.env.API_KEY;

  if (!subdomain || !dataType) {
    return res.status(400).json({ error: 'Subdomain cabang dan tipe data diperlukan' });
  }

  // Gabungkan sisa path menjadi satu
  const apiPath = Array.isArray(dataType) ? dataType.join('/') : dataType;

  const queryParams = new URLSearchParams(req.query);
  queryParams.delete('subdomain'); // Hapus query yang tidak perlu diteruskan
  queryParams.delete('dataType');

  const tunnelUrl = `https://${subdomain}.loca.lt/api/${apiPath}?${queryParams.toString()}`;

  const headers = {
    'Bypass-Tunnel-Reminder': 'true',
    // 'x-api-key': apiKey,
  };

  try {
    const apiResponse = await fetch(tunnelUrl, { headers });
    if (!apiResponse.ok) {
      throw new Error(`Gagal mengambil data dari cabang, status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error di proxy untuk ${subdomain}/${apiPath}:`, error.message);
    res.status(503).json({ error: 'Gagal menghubungi server cabang atau cabang sedang offline.' });
  }
}