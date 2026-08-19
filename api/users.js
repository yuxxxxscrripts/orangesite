// api/users.js - Supports removing users when they quit

let users = new Map(); // hardwareId -> { lastHeartbeat, username }

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const now = Date.now();
    
    // Clean old users (older than 30 seconds - faster cleanup)
    for (const [id, data] of users) {
        if (now - data.lastHeartbeat > 30000) { // 30 seconds
            users.delete(id);
        }
    }
    
    if (req.method === 'POST') {
        // User heartbeat - keep them alive
        const { hardwareId } = req.body || {};
        
        if (!hardwareId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing hardwareId' 
            });
        }
        
        if (users.has(hardwareId)) {
            users.get(hardwareId).lastHeartbeat = now;
        } else {
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
    else if (req.method === 'DELETE') {
        // User quit - remove them immediately
        const { hardwareId } = req.body || {};
        
        if (!hardwareId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing hardwareId' 
            });
        }
        
        if (users.has(hardwareId)) {
            users.delete(hardwareId);
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
