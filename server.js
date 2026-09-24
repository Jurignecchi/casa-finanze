const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gestione percorso database: usa il Volume di Railway (/app/data) se disponibile, altrimenti la cartella locale
const dataFolder = fs.existsSync('/app/data') ? '/app/data' : __dirname;
const DB_FILE = path.join(dataFolder, 'database.json');

// Inizializza il file JSON se non esiste
function readDb() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            inventory: [],
            shopping: [],
            maintenance: [],
            tasks: [],
            transactions: [],
            fixed_expenses: [],
            investments: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Helper CRUD generico per le tabelle JSON
function setupCrud(entity) {
    app.get(`/api/${entity}`, (req, res) => {
        const db = readDb();
        res.json(db[entity] || []);
    });

    app.post(`/api/${entity}`, (req, res) => {
        const db = readDb();
        const newItem = { id: Date.now(), ...req.body };
        if (!db[entity]) db[entity] = [];
        db[entity].push(newItem);
        writeDb(db);
        res.json(newItem);
    });

    app.delete(`/api/${entity}/:id`, (req, res) => {
        const db = readDb();
        const id = Number(req.params.id);
        const initialLength = db[entity].length;
        db[entity] = db[entity].filter(item => item.id !== id);
        writeDb(db);
        res.json({ deleted: initialLength - db[entity].length });
    });
}

// Configurazione delle entità
setupCrud('inventory');
setupCrud('shopping');
setupCrud('maintenance');
setupCrud('tasks');
setupCrud('transactions');
setupCrud('fixed_expenses');
setupCrud('investments');

// Endpoint di aggiornamento (PUT)
app.put('/api/:entity/:id', (req, res) => {
    const { entity, id } = req.params;
    const itemId = Number(id);
    const db = readDb();
    
    if (!db[entity]) return res.status(404).json({ error: 'Entity not found' });
    
    const index = db[entity].findIndex(item => item.id === itemId);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    db[entity][index] = { ...db[entity][index], ...req.body, id: itemId };
    writeDb(db);
    res.json({ updated: 1 });
});

app.listen(PORT, () => {
    console.log(`Server avviato con successo su http://localhost:${PORT}`);
    console.log(`Percorso database attivo: ${DB_FILE}`);
});
