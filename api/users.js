// api/users.js - Complete secure backend
// The secret seed is stored in Vercel environment variables, NOT in code!

const crypto = require('crypto');

// ============================================
// READ SECRET FROM ENVIRONMENT VARIABLES
// ============================================
const CONFIG = {
    // This comes from Vercel environment variables - NEVER in source code!
    SEED: process.env.API_SECRET || 'CHANGE_ME_IN_VERCEL_DASHBOARD',
    
    HEARTBEAT_TIMEOUT: 60000, // 1 minute
    MAX_USERS: 10000,
    RATE_LIMIT: {
        WINDOW: 60000,
        MAX_REQUESTS: 10
    }
};

// ============================================
// IN-MEMORY STORAGE
// ============================================
let users = [];
let rateLimit = new Map();

// ============================================
// TOKEN VERIFICATION
// ============================================
function generateToken(username, hardwareId, timestamp) {
    const data = username + hardwareId + timestamp;
    return crypto.createHmac('sha256', CONFIG.SEED)
        .update(data)
        .digest('hex');
}

function verifyToken(username, hardwareId, timestamp, token) {
    const expected = generateToken(username, hardwareId, timestamp);
    if (expected !== token) return false;
    
    const requestTime = parseInt(timestamp);
    const now = Date.now();
    return Math.abs(now - requestTime) < 300000; // 5 minutes
}

// ============================================
// RATE LIMITING
// ============================================
function checkRateLimit(ip) {
    const now = Date.now();
    const window = CONFIG.RATE_LIMIT.WINDOW;
    const max = CONFIG.RATE_LIMIT.MAX_REQUESTS;
    
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, firstRequest: now });
        return true;
    }
    
    const data = rateLimit.get(ip);
    if (now - data.firstRequest > window) {
        rateLimit.set(ip, { count: 1, firstRequest: now });
        return true;
    }
    
    if (data.count >= max) {
        return false;
    }
    
    data.count++;
    return true;
}

// ============================================
// MAIN HANDLER
// ============================================
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIP)) {
        return res.status(429).json({ 
            success: false, 
            error: 'Rate limit exceeded' 
        });
    }

    const now = Date.now();
    users = users.filter(u => (now - u.lastHeartbeat) < CONFIG.HEARTBEAT_TIMEOUT);
    
    if (req.method === 'POST') {
        // ============================================
        // VERIFY REQUEST
        // ============================================
        const { username, hardwareId, timestamp, token, robloxUser, device } = req.body || {};
        
        if (!username || !hardwareId || !timestamp || !token) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }
        
        if (!verifyToken(username, hardwareId, timestamp, token)) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }
        
        // ============================================
        // UPDATE USER
        // ============================================
        const existing = users.find(u => u.hardwareId === hardwareId);
        if (existing) {
            existing.lastHeartbeat = now;
            existing.username = username;
            existing.robloxUser = robloxUser || existing.robloxUser;
            existing.device = device || existing.device;
        } else {
            if (users.length >= CONFIG.MAX_USERS) {
                users.sort((a, b) => a.lastHeartbeat - b.lastHeartbeat);
                users.shift();
            }
            
            users.push({
                username,
                hardwareId,
                robloxUser: robloxUser || 'Unknown',
                device: device || 'Unknown',
                lastHeartbeat: now,
                joinedAt: now
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            count: users.length,
            users: users.map(u => ({ 
                username: u.username,
                robloxUser: u.robloxUser,
                joinedAt: u.joinedAt 
            }))
        });
    } 
    else if (req.method === 'GET') {
        return res.status(200).json({ 
            success: true, 
            count: users.length,
            users: users.map(u => ({ 
                username: u.username,
                robloxUser: u.robloxUser,
                joinedAt: u.joinedAt 
            }))
        });
    } 
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
