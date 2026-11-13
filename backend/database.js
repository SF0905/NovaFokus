
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(
    path.join(dataDir, "novafokus.db")
);

db.exec("PRAGMA foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email_verificado INTEGER DEFAULT 0,
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS metas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        completada INTEGER DEFAULT 0,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habitos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        frecuencia TEXT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rutinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sesiones_enfoque (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        minutos INTEGER NOT NULL,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
`);

function agregarColumna(tabla, columna, tipo) {
    const tablasPermitidas = ["metas", "habitos", "rutinas", "sesiones_enfoque"];

    if (!tablasPermitidas.includes(tabla)) {
        throw new Error("Tabla no permitida: " + tabla);
    }

    const columnas = db.prepare(
        `PRAGMA table_info(${tabla})`
    ).all();

    if (!columnas.some(c => c.name === columna)) {
        db.exec(
            `ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`
        );
    }
}

agregarColumna("metas", "categoria", "TEXT");
agregarColumna("metas", "plazo", "TEXT");

agregarColumna("habitos", "categoria", "TEXT");
agregarColumna("habitos", "ultimo_registro", "TEXT");
agregarColumna("rutinas", "hora", "TEXT");
agregarColumna("rutinas", "categoria", "TEXT");
agregarColumna("rutinas", "dias", "TEXT");
agregarColumna("sesiones_enfoque", "objetivo", "TEXT");

console.log("Base de datos NovaFokus preparada.");

module.exports = db;
