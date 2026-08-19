// api/users.js - Tracks unique users by hardware ID

let users = new Map(); // hardwareId -> { lastHeartbeat, username }
const HEARTBEAT_TIMEOUT = 60000; // 1 minute

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
    
    // Clean old users (older than 1 minute)
    for (const [id, data] of users) {
        if (now - data.lastHeartbeat > HEARTBEAT_TIMEOUT) {
            users.delete(id);
        }
    }
    
    if (req.method === 'POST') {
        const { hardwareId } = req.body || {};
        
        if (!hardwareId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing hardwareId' 
            });
        }
        
        // Update or add user
        if (users.has(hardwareId)) {
            // Existing user - just update heartbeat
            users.get(hardwareId).lastHeartbeat = now;
        } else {
            // New user - add to map
            users.set(hardwareId, {
                lastHeartbeat: now,
                joinedAt: now
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            count: users.size
        });
    } 
    else if (req.method === 'GET') {
        return res.status(200).json({ 
            success: true, 
            count: users.size
        });
    } 
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
