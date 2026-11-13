const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "novafokus-clave-desarrollo-cambiar",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.get("/", (req, res) => {
    res.json({
        proyecto: "NovaFokus",
        mensaje: "Servidor backend funcionando correctamente."
    });
});

app.get("/api/health", (req, res) => {
    res.json({ estado: "activo", proyecto: "NovaFokus" });
});

// REGISTRO
app.post("/api/auth/register", async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({
                mensaje: "Completa todos los campos."
            });
        }

        const nombreLimpio = nombre.trim();
        const email = correo.trim().toLowerCase();

        if (nombreLimpio.length < 2 || nombreLimpio.length > 80) {
            return res.status(400).json({
                mensaje: "El nombre debe tener entre 2 y 80 caracteres."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                mensaje: "Escribe un correo válido."
            });
        }

        if (contrasena.length < 8) {
            return res.status(400).json({
                mensaje: "La contraseña debe tener al menos 8 caracteres."
            });
        }

        const existente = db.prepare(
            "SELECT id FROM usuarios WHERE lower(email) = ?"
        ).get(email);

        if (existente) {
            return res.status(409).json({
                mensaje: "Este correo ya tiene una cuenta registrada."
            });
        }

        const passwordHash = await bcrypt.hash(contrasena, 12);

        const resultado = db.prepare(`
            INSERT INTO usuarios (nombre, email, password_hash)
            VALUES (?, ?, ?)
        `).run(nombreLimpio, email, passwordHash);

        req.session.usuario = {
            id: Number(resultado.lastInsertRowid),
            nombre: nombreLimpio,
            email
        };

        res.status(201).json({
            mensaje: "Cuenta creada correctamente.",
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            mensaje: "No se pudo crear la cuenta."
        });
    }
});

// INICIO DE SESIÓN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                mensaje: "Escribe tu correo y contraseña."
            });
        }

        const email = correo.trim().toLowerCase();

        const usuario = db.prepare(`
            SELECT id, nombre, email, password_hash
            FROM usuarios
            WHERE lower(email) = ?
        `).get(email);

        if (!usuario || !(await bcrypt.compare(contrasena, usuario.password_hash))) {
            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        };

        res.json({
            mensaje: "Inicio de sesión correcto.",
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Error en inicio de sesión:", error);
        res.status(500).json({
            mensaje: "No se pudo iniciar sesión."
        });
    }
});

// CONSULTAR SESIÓN
app.get("/api/auth/me", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No hay una sesión activa."
        });
    }

    res.json({ usuario: req.session.usuario });
});

// CERRAR SESIÓN
app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensaje: "No se pudo cerrar la sesión."
            });
        }

        res.clearCookie("connect.sid");
        res.json({ mensaje: "Sesión cerrada correctamente." });
    });
});


function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }
    next();
}

// ======================
// METAS
// ======================

app.get("/api/metas", verificarSesion, (req, res) => {
    const metas = db.prepare(`
        SELECT id, titulo, descripcion, categoria, plazo,
               completada, completada AS completada
        FROM metas
        WHERE usuario_id = ?
        ORDER BY id DESC
    `).all(req.session.usuario.id);

    res.json(metas);
});

app.post("/api/metas", verificarSesion, (req, res) => {
    const { titulo, descripcion, categoria, plazo } = req.body;

    if (!titulo || !titulo.trim()) {
        return res.status(400).json({ mensaje: "Escribe el título de la meta." });
    }

    const resultado = db.prepare(`
        INSERT INTO metas (usuario_id, titulo, descripcion, categoria, plazo)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        req.session.usuario.id,
        titulo.trim(),
        descripcion || "",
        categoria || "",
        plazo || ""
    );

    res.status(201).json({
        mensaje: "Meta guardada.",
        id: Number(resultado.lastInsertRowid)
    });
});

app.patch("/api/metas/:id", verificarSesion, (req, res) => {
    const resultado = db.prepare(`
        UPDATE metas
        SET completada = ?
        WHERE id = ? AND usuario_id = ?
    `).run(
        req.body.completada ? 1 : 0,
        req.params.id,
        req.session.usuario.id
    );

    if (!resultado.changes) {
        return res.status(404).json({ mensaje: "Meta no encontrada." });
    }

    res.json({ mensaje: "Meta actualizada." });
});

app.delete("/api/metas/:id", verificarSesion, (req, res) => {
    const resultado = db.prepare(`
        DELETE FROM metas
        WHERE id = ? AND usuario_id = ?
    `).run(req.params.id, req.session.usuario.id);

    if (!resultado.changes) {
        return res.status(404).json({ mensaje: "Meta no encontrada." });
    }

    res.json({ mensaje: "Meta eliminada." });
});

// ======================
// SESIONES DE ENFOQUE
// ======================

app.get("/api/sesiones", verificarSesion, (req, res) => {
    const sesiones = db.prepare(`
        SELECT id, minutos, objetivo, fecha
        FROM sesiones_enfoque
        WHERE usuario_id = ?
        ORDER BY id DESC
    `).all(req.session.usuario.id);

    res.json(sesiones);
});

app.post("/api/sesiones", verificarSesion, (req, res) => {
    const minutos = Number(req.body.minutos);
    const objetivo = String(req.body.objetivo || "").trim();

    if (!Number.isInteger(minutos) || minutos <= 0) {
        return res.status(400).json({
            mensaje: "La duración de la sesión no es válida."
        });
    }

    const resultado = db.prepare(`
        INSERT INTO sesiones_enfoque
            (usuario_id, minutos, objetivo)
        VALUES (?, ?, ?)
    `).run(
        req.session.usuario.id,
        minutos,
        objetivo || "Sesión de concentración"
    );

    res.status(201).json({
        mensaje: "Sesión guardada.",
        id: Number(resultado.lastInsertRowid)
    });
});


// ======================
// HÁBITOS
// ======================

app.get("/api/habitos", verificarSesion, (req, res) => {
    const habitos = db.prepare(`
        SELECT id, nombre, categoria, frecuencia,
               ultimo_registro AS ultimoRegistro
        FROM habitos
        WHERE usuario_id = ?
        ORDER BY id DESC
    `).all(req.session.usuario.id);

    res.json(habitos);
});

app.post("/api/habitos", verificarSesion, (req, res) => {
    const { nombre, categoria, frecuencia } = req.body;

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({ mensaje: "Escribe el nombre del hábito." });
    }

    const resultado = db.prepare(`
        INSERT INTO habitos (usuario_id, nombre, categoria, frecuencia)
        VALUES (?, ?, ?, ?)
    `).run(
        req.session.usuario.id,
        nombre.trim(),
        categoria || "",
        frecuencia || ""
    );

    res.status(201).json({
        mensaje: "Hábito guardado.",
        id: Number(resultado.lastInsertRowid)
    });
});

// Registrar o actualizar el cumplimiento diario
app.patch("/api/habitos/:id", verificarSesion, (req, res) => {
    const fecha = req.body.ultimoRegistro || null;

    const resultado = db.prepare(`
        UPDATE habitos
        SET ultimo_registro = ?
        WHERE id = ? AND usuario_id = ?
    `).run(fecha, req.params.id, req.session.usuario.id);

    if (!resultado.changes) {
        return res.status(404).json({ mensaje: "Hábito no encontrado." });
    }

    res.json({ mensaje: "Registro del hábito actualizado." });
});

app.delete("/api/habitos/:id", verificarSesion, (req, res) => {
    const resultado = db.prepare(`
        DELETE FROM habitos
        WHERE id = ? AND usuario_id = ?
    `).run(req.params.id, req.session.usuario.id);

    if (!resultado.changes) {
        return res.status(404).json({ mensaje: "Hábito no encontrado." });
    }

    res.json({ mensaje: "Hábito eliminado." });
});
// ======================
// RUTINAS
// ======================

app.get("/api/rutinas", verificarSesion, (req, res) => {
    const rutinas = db.prepare(`
        SELECT id, nombre, hora, categoria, descripcion, dias
        FROM rutinas
        WHERE usuario_id = ?
        ORDER BY hora ASC
    `).all(req.session.usuario.id);

    res.json(rutinas.map(rutina => ({
        ...rutina,
        dias: rutina.dias ? JSON.parse(rutina.dias) : []
    })));
});

app.post("/api/rutinas", verificarSesion, (req, res) => {
    const { nombre, hora, categoria, descripcion, dias } = req.body;

    if (!nombre || !nombre.trim() || !hora || !categoria) {
        return res.status(400).json({
            mensaje: "Completa los campos obligatorios."
        });
    }

    if (!Array.isArray(dias) || dias.length === 0) {
        return res.status(400).json({
            mensaje: "Selecciona al menos un día."
        });
    }

    const resultado = db.prepare(`
        INSERT INTO rutinas (
            usuario_id, nombre, hora, categoria, descripcion, dias
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        req.session.usuario.id,
        nombre.trim(),
        hora,
        categoria,
        descripcion || "",
        JSON.stringify(dias)
    );

    res.status(201).json({
        mensaje: "Rutina guardada.",
        id: Number(resultado.lastInsertRowid)
    });
});

app.delete("/api/rutinas/:id", verificarSesion, (req, res) => {
    const resultado = db.prepare(`
        DELETE FROM rutinas
        WHERE id = ? AND usuario_id = ?
    `).run(req.params.id, req.session.usuario.id);

    if (!resultado.changes) {
        return res.status(404).json({
            mensaje: "Rutina no encontrada."
        });
    }

    res.json({ mensaje: "Rutina eliminada." });
});
app.listen(PORT, () => {
    console.log(`NovaFokus backend disponible en http://localhost:${PORT}`);
});
