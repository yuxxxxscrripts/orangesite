let users = new Map();

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const now = Date.now();

    for (const [id, data] of users) {
        if (now - data.lastHeartbeat > 30000) {
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
