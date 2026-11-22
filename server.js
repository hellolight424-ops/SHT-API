
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.LEDENLIJST_API_KEY;
const GUILD_ID = '1479555886002471118';

let ledenlijst = {
    guildId: GUILD_ID,
    updatedAt: null,
    members: []
};

app.use(cors({
    origin: 'https://sht-618d.onrender.com'
}));

app.use(express.json({
    limit: '5mb'
}));

// API-status controleren
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'S.H.T. API is online.',
        endpoints: [
            'GET /api/ledenlijst',
            'POST /api/ledenlijst'
        ]
    });
});

// JSON ontvangen van de Discord-bot
app.post('/api/ledenlijst', (req, res) => {
    try {
        if (!API_KEY || req.headers['x-api-key'] !== API_KEY) {
            return res.status(401).json({
                success: false,
                error: 'Ongeldige API-sleutel.'
            });
        }

        const data = req.body;

        if (
            !data ||
            data.guildId !== GUILD_ID ||
            !Array.isArray(data.members)
        ) {
            return res.status(400).json({
                success: false,
                error: 'Ongeldige ledenlijst.'
            });
        }

        ledenlijst = {
            guildId: data.guildId,
            updatedAt: data.updatedAt || new Date().toISOString(),
            members: data.members
        };

        console.log(
            `[LEDENLIJST] ${ledenlijst.members.length} leden ontvangen.`
        );

        return res.json({
            success: true,
            message: 'Ledenlijst succesvol bijgewerkt.',
            count: ledenlijst.members.length,
            updatedAt: ledenlijst.updatedAt
        });

    } catch (error) {
        console.error('[API] POST-fout:', error);

        return res.status(500).json({
            success: false,
            error: 'Interne serverfout.'
        });
    }
});

// JSON ophalen door de website
app.get('/api/ledenlijst', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    return res.json(ledenlijst);
});

// API starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHT API] Actief op poort ${PORT}`);
});
