const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per leggere i dati inviati in formato JSON o form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve i file statici (HTML, CSS, JS) dalla cartella public se esiste
app.use(express.static(path.join(__dirname, 'public')));

// Percorso del file database locale
const DB_FILE = path.join(__dirname, 'database.json');

// Funzione di utilità per leggere il database
function readDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        return { inventory: [], transazioni: [] }; // Struttura di base predefinita
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Errore nella lettura del database:", err);
        return { inventory: [], transazioni: [] };
    }
}

// Funzione di utilità per scrivere sul database (corretto l'errore di battitura)
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API per leggere l'inventario / dati
app.get('/api/inventory', (req, res) => {
    const db = readDatabase();
    res.json(db.inventory || db);
});

// API per salvare/aggiungere dati all'inventario
app.post('/api/inventory', (req, res) => {
    const db = readDatabase();
    const newItem = req.body;
    
    if (!db.inventory) {
        db.inventory = [];
    }
    
    db.inventory.push(newItem);
    writeDatabase(db);
    
    res.json({ success: true, item: newItem });
});

// Rotta generica di backup per i dati
app.get('/api/dati', (req, res) => {
    const db = readDatabase();
    res.json(db);
});

// Rotta di fallback se non trova pagine specifiche (mostra la home o un messaggio)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('Server attivo e configurato correttamente! Manca solo la cartella public con index.html.');
    }
});

// Avvio del server in ascolto su tutte le interfacce
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server JSON avviato con successo sulla porta ${PORT}`);
});
