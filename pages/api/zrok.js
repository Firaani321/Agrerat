// File: /pages/api/test-zrok.js
export default async function handler(req, res) {
    const url = `${process.env.NEXT_PUBLIC_API_CENTRAL_URL}/api/sync/customers?branch_id=Multi-Print`;

    try {
        const response = await fetch(url, {
            headers: { 'skip_zrok_interstitial': 'true' }
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Kirim kembali status dan error asli dari zrok
            return res.status(response.status).json({ 
                message: "Gagal fetch dari zrok.", 
                upstream_error: errorText 
            });
        }

        const data = await response.json();
        res.status(200).json({ message: "Sukses!", data });

    } catch (error) {
        console.error("API Test Error:", error);
        res.status(500).json({ message: "Error internal di Vercel.", error: error.message });
    }
}
