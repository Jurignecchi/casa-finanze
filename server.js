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
        return { transazioni: [] }; // Struttura di base predefinita
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Errore nella lettura del database:", err);
        return { transazioni: [] };
    }
}

// Funzione di utilità per scrivere sul database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, সিনেমা = JSON.stringify(data, null, 2), 'utf8');
}

// Rotta di esempio per leggere i dati
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
        res.send('Server attivo e configurato correttamente su Render! Manca solo la cartella public con index.html.');
    }
});

// Avvio del server in ascolto su tutte le interfacce per Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server JSON avviato con successo sulla porta ${PORT}`);
});
