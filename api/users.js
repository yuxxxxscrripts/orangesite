// api/users.js - Ultra simple counter

let count = 0;
let lastUpdate = Date.now();

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const now = Date.now();
    
    // Reset count every 5 minutes if no updates
    if (now - lastUpdate > 300000) { // 5 minutes
        count = 0;
    }
    
    if (req.method === 'POST') {
        // Someone is using the cheat - increment count
        count++;
        lastUpdate = now;
        
        return res.status(200).json({ 
            success: true, 
            count: count
        });
    } 
    else if (req.method === 'GET') {
        // Return current count
        return res.status(200).json({ 
            success: true, 
            count: count
        });
    } 
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
