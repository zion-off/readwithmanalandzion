// pages/api/fetch-metadata.js
export default async function handler(req, res) {
    const { url } = req.query;
  
    try {
      const response = await fetch(url);
      const html = await response.text();
  
      res.status(200).json({ html });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metadata' });
    }
  }