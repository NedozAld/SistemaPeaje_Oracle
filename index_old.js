const express = require('express');
const path = require('path');
const { Sequelize, QueryTypes } = require('sequelize');
const oracledb = require('oracledb');
const app = express();
const port = process.env.PORT || 3000;

// Credenciales por defecto (usuario sys donde están las tablas)
const DEFAULT_USER = 'sys';
const DEFAULT_PASSWORD = 'ALD17jpr1948';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Estilos globales
const bootstrapLink = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">`;

const estilosGlobales = `<style>
  body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .glass-card { background: rgba(255,255,255,0.93); border-radius: 16px; box-shadow: 0 12px 35px rgba(0,0,0,0.18); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.35); }
  .section-title { color: #0f172a; font-weight: 700; letter-spacing: 0.5px; }
  .table thead th { background: #111827; color: #f9fafb; border: none; }
  .table tbody tr:hover { background: rgba(17,24,39,0.04); }
  .btn-primary { background: #4f46e5; border: none; }
  .btn-primary:hover { background: #4338ca; }
  .badge-soft { background: rgba(79,70,229,0.2); color: #4f46e5; }
  .nav-tabs .nav-link { color: #4f46e5; }
  .nav-tabs .nav-link.active { color: #fff; background: #4f46e5; }
</style>`;

// Función auxiliar para conectar a Oracle
const conectarOracle = () => {
  return new Sequelize('XE', DEFAULT_USER, DEFAULT_PASSWORD, {
    host: 'localhost',
    dialect: 'oracle',
    port: 1521,
    dialectOptions: {
      connectString: 'localhost/XE'
    },
    logging: false
  });
};

// ====================== RUTAS PRINCIPALES ======================

// Página de inicio - Dashboard
app.get('/', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    // Obtener estadísticas
    const totalPasajes = await sequelize.query(
      `SELECT COUNT(*) AS total FROM pasajes`,
      { type: QueryTypes.SELECT }
    );

    const totalRutas = await sequelize.query(
      `SELECT COUNT(*) AS total FROM rutas WHERE estado = 'A'`,
      { type: QueryTypes.SELECT }
    );

    const totalUnidades = await sequelize.query(
      `SELECT COUNT(*) AS total FROM unidades WHERE estado = 'A'`,
      { type: QueryTypes.SELECT }
    );

    const montoTotal = await sequelize.query(
      `SELECT SUM(valor) AS total FROM pasajes`,
      { type: QueryTypes.SELECT }
    );

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🚌 Sistema Gestión Pasajes - Cooperativa</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa - Pasajes</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link active" href="/">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="/pasajes">Consultar Pasajes</a></li>
          <li class="nav-item"><a class="nav-link" href="/crear-pasaje">Nuevo Pasaje</a></li>
          <li class="nav-item"><a class="nav-link" href="/exportar">Exportar CSV</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container py-5">
    <div class="text-center text-white mb-5">
      <h1 class="fw-bold">📊 Dashboard de Pasajes</h1>
      <p class="mb-0 opacity-75">Estadísticas del sistema de transporte</p>
    </div>

    <div class="row g-4 mb-5">
      <div class="col-md-3">
        <div class="card glass-card border-0 h-100">
          <div class="card-body text-center">
            <h6 class="section-title mb-3">📋 Total Pasajes</h6>
            <h2 class="text-primary">${totalPasajes[0]?.total || 0}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card glass-card border-0 h-100">
          <div class="card-body text-center">
            <h6 class="section-title mb-3">🛣️ Rutas Activas</h6>
            <h2 class="text-success">${totalRutas[0]?.total || 0}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card glass-card border-0 h-100">
          <div class="card-body text-center">
            <h6 class="section-title mb-3">🚐 Unidades</h6>
            <h2 class="text-info">${totalUnidades[0]?.total || 0}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card glass-card border-0 h-100">
          <div class="card-body text-center">
            <h6 class="section-title mb-3">💰 Monto Total</h6>
            <h2 class="text-warning">$${(montoTotal[0]?.total || 0).toFixed(2)}</h2>
          </div>
        </div>
      </div>
    </div>

    <div class="card glass-card border-0 mb-4">
      <div class="card-body">
        <h5 class="section-title mb-4">Acciones Rápidas</h5>
        <div class="d-grid gap-2 d-sm-flex">
          <a href="/pasajes" class="btn btn-primary btn-lg">📍 Ver todos los pasajes</a>
          <a href="/crear-pasaje" class="btn btn-success btn-lg">➕ Crear nuevo pasaje</a>
          <a href="/exportar" class="btn btn-warning btn-lg">📥 Exportar a CSV</a>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`
      <div class="container mt-5">
        <div class="alert alert-danger">
          <h4>Error de conexión</h4>
          <p>${error.message}</p>
        </div>
      </div>
    `);
  } finally {
    await sequelize.close();
  }
});

// ====================== CONSULTAR PASAJES CON FILTROS ======================

app.get('/pasajes', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const { id_ruta, fecha_inicio, fecha_fin } = req.query;

    // Construir query dinámica
    let query = `
      SELECT 
        p.id_pasaje,
        p.id_ruta,
        p.valor,
        p.fecha_viaje,
        r.nombre_ruta,
        r.origen,
        r.destino,
        u.placa,
        u.modelo,
        t.descripcion,
        t.descuento
      FROM pasajes p
      JOIN rutas r ON p.id_ruta = r.id_ruta
      JOIN unidades u ON p.id_unidad = u.id_unidad
      JOIN tipos_pasaje t ON p.id_tipo = t.id_tipo
      WHERE 1=1
    `;

    const replacements = {};

    if (id_ruta) {
      query += ` AND p.id_ruta = :id_ruta`;
      replacements.id_ruta = parseInt(id_ruta);
    }

    if (fecha_inicio) {
      query += ` AND TRUNC(p.fecha_viaje) >= TO_DATE(:fecha_inicio, 'YYYY-MM-DD')`;
      replacements.fecha_inicio = fecha_inicio;
    }

    if (fecha_fin) {
      query += ` AND TRUNC(p.fecha_viaje) <= TO_DATE(:fecha_fin, 'YYYY-MM-DD')`;
      replacements.fecha_fin = fecha_fin;
    }

    query += ` ORDER BY p.fecha_viaje DESC`;

    const pasajes = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });

    // Obtener listado de rutas para el filtro
    const rutas = await sequelize.query(
      `SELECT id_ruta, nombre_ruta FROM rutas WHERE estado = 'A' ORDER BY nombre_ruta`,
      { type: QueryTypes.SELECT }
    );

    let tableHtml = '';
    if (pasajes.length > 0) {
      tableHtml = `
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ruta</th>
                <th>Origen → Destino</th>
                <th>Unidad</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>`;

      pasajes.forEach(p => {
        const fecha = new Date(p.FECHA_VIAJE).toLocaleString('es-MX');
        tableHtml += `
          <tr>
            <td><span class="badge badge-soft">${p.ID_PASAJE}</span></td>
            <td><strong>${p.NOMBRE_RUTA}</strong></td>
            <td>${p.ORIGEN} → ${p.DESTINO}</td>
            <td>${p.PLACA} (${p.MODELO})</td>
            <td>${p.DESCRIPCION} (${p.DESCUENTO}% desc.)</td>
            <td><strong>$${parseFloat(p.VALOR).toFixed(2)}</strong></td>
            <td>${fecha}</td>
            <td>
              <a href="/editar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-warning">✏️</a>
              <a href="/eliminar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-danger" onclick="return confirm('¿Eliminar pasaje?')">🗑️</a>
            </td>
          </tr>`;
      });

      tableHtml += `</tbody></table></div>`;
    } else {
      tableHtml = '<div class="alert alert-info">No se encontraron pasajes</div>';
    }

    const rutasOpciones = rutas.map(r => 
      `<option value="${r.ID_RUTA}" ${id_ruta == r.ID_RUTA ? 'selected' : ''}>${r.NOMBRE_RUTA}</option>`
    ).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Consultar Pasajes</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa - Pasajes</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="/">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link active" href="/pasajes">Consultar Pasajes</a></li>
          <li class="nav-item"><a class="nav-link" href="/crear-pasaje">Nuevo Pasaje</a></li>
          <li class="nav-item"><a class="nav-link" href="/exportar">Exportar CSV</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container py-5">
    <h2 class="text-white mb-4">🔍 Consultar Pasajes</h2>

    <div class="card glass-card border-0 mb-4">
      <div class="card-body">
        <form method="get" class="row g-3">
          <div class="col-md-4">
            <label class="form-label section-title">Filtrar por Ruta</label>
            <select name="id_ruta" class="form-select">
              <option value="">-- Todas las rutas --</option>
              ${rutasOpciones}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label section-title">Fecha Inicio</label>
            <input type="date" name="fecha_inicio" class="form-control" value="${fecha_inicio || ''}">
          </div>
          <div class="col-md-3">
            <label class="form-label section-title">Fecha Fin</label>
            <input type="date" name="fecha_fin" class="form-control" value="${fecha_fin || ''}">
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button type="submit" class="btn btn-primary w-100">🔍 Filtrar</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card glass-card border-0">
      <div class="card-header bg-white">
        <h5 class="section-title mb-0">📊 Resultados (${pasajes.length})</h5>
      </div>
      <div class="card-body">
        ${tableHtml}
      </div>
    </div>

    <div class="mt-4">
      <a href="/" class="btn btn-light">🔙 Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`<div class="alert alert-danger m-5">${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

// ====================== CREAR PASAJE ======================

app.get('/crear-pasaje', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    // Obtener datos para los select
    const rutas = await sequelize.query(
      `SELECT id_ruta, nombre_ruta FROM rutas WHERE estado = 'A' ORDER BY nombre_ruta`,
      { type: QueryTypes.SELECT }
    );

    const unidades = await sequelize.query(
      `SELECT id_unidad, placa, modelo FROM unidades WHERE estado = 'A' ORDER BY placa`,
      { type: QueryTypes.SELECT }
    );

    const tipos = await sequelize.query(
      `SELECT id_tipo, descripcion, descuento FROM tipos_pasaje ORDER BY descripcion`,
      { type: QueryTypes.SELECT }
    );

    const rutasOpciones = rutas.map(r => `<option value="${r.ID_RUTA}">${r.NOMBRE_RUTA}</option>`).join('');
    const unidadesOpciones = unidades.map(u => `<option value="${u.ID_UNIDAD}">${u.PLACA} - ${u.MODELO}</option>`).join('');
    const tiposOpciones = tipos.map(t => `<option value="${t.ID_TIPO}">${t.DESCRIPCION} (${t.DESCUENTO}% desc.)</option>`).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crear Pasaje</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa - Pasajes</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="/">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="/pasajes">Consultar Pasajes</a></li>
          <li class="nav-item"><a class="nav-link active" href="/crear-pasaje">Nuevo Pasaje</a></li>
          <li class="nav-item"><a class="nav-link" href="/exportar">Exportar CSV</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container py-5">
    <h2 class="text-white mb-4">➕ Crear Nuevo Pasaje</h2>

    <div class="card glass-card border-0" style="max-width: 600px; margin: 0 auto;">
      <div class="card-body">
        <form method="POST" action="/guardar-pasaje">
          <div class="mb-3">
            <label class="form-label section-title">Ruta *</label>
            <select name="id_ruta" class="form-select" required>
              <option value="">-- Selecciona una ruta --</option>
              ${rutasOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Unidad *</label>
            <select name="id_unidad" class="form-select" required>
              <option value="">-- Selecciona una unidad --</option>
              ${unidadesOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Tipo de Pasaje *</label>
            <select name="id_tipo" class="form-select" required>
              <option value="">-- Selecciona un tipo --</option>
              ${tiposOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Valor del Pasaje *</label>
            <input type="number" name="valor" class="form-control" step="0.01" min="0.01" required placeholder="ej: 25.50">
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Fecha y Hora del Viaje *</label>
            <input type="datetime-local" name="fecha_viaje" class="form-control" required>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-success btn-lg">💾 Guardar Pasaje</button>
            <a href="/pasajes" class="btn btn-light">🔙 Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    res.status(500).send(`<div class="alert alert-danger m-5">${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

app.post('/guardar-pasaje', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const { id_ruta, id_unidad, id_tipo, valor, fecha_viaje } = req.body;

    // Convertir datetime-local a formato Oracle
    const fecha = new Date(fecha_viaje);

    await sequelize.query(
      `INSERT INTO pasajes (id_ruta, id_unidad, id_tipo, valor, fecha_viaje) 
       VALUES (:id_ruta, :id_unidad, :id_tipo, :valor, :fecha_viaje)`,
      {
        replacements: {
          id_ruta: parseInt(id_ruta),
          id_unidad: parseInt(id_unidad),
          id_tipo: parseInt(id_tipo),
          valor: parseFloat(valor),
          fecha_viaje: fecha
        }
      }
    );

    res.redirect('/pasajes?msg=Pasaje%20creado%20exitosamente');
  } catch (error) {
    console.error(error);
    res.status(500).send(`<div class="alert alert-danger m-5">Error: ${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

// ====================== EDITAR PASAJE ======================

app.get('/editar-pasaje/:id', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const { id } = req.params;

    // Obtener pasaje actual
    const pasajeActual = await sequelize.query(
      `SELECT * FROM pasajes WHERE id_pasaje = :id`,
      { type: QueryTypes.SELECT, replacements: { id: parseInt(id) } }
    );

    if (pasajeActual.length === 0) {
      return res.status(404).send('<div class="alert alert-danger m-5">Pasaje no encontrado</div>');
    }

    const p = pasajeActual[0];

    // Obtener datos para los select
    const rutas = await sequelize.query(
      `SELECT id_ruta, nombre_ruta FROM rutas WHERE estado = 'A' ORDER BY nombre_ruta`,
      { type: QueryTypes.SELECT }
    );

    const unidades = await sequelize.query(
      `SELECT id_unidad, placa, modelo FROM unidades WHERE estado = 'A' ORDER BY placa`,
      { type: QueryTypes.SELECT }
    );

    const tipos = await sequelize.query(
      `SELECT id_tipo, descripcion FROM tipos_pasaje ORDER BY descripcion`,
      { type: QueryTypes.SELECT }
    );

    const rutasOpciones = rutas.map(r => 
      `<option value="${r.ID_RUTA}" ${r.ID_RUTA === p.ID_RUTA ? 'selected' : ''}>${r.NOMBRE_RUTA}</option>`
    ).join('');

    const unidadesOpciones = unidades.map(u => 
      `<option value="${u.ID_UNIDAD}" ${u.ID_UNIDAD === p.ID_UNIDAD ? 'selected' : ''}>${u.PLACA}</option>`
    ).join('');

    const tiposOpciones = tipos.map(t => 
      `<option value="${t.ID_TIPO}" ${t.ID_TIPO === p.ID_TIPO ? 'selected' : ''}>${t.DESCRIPCION}</option>`
    ).join('');

    const fechaStr = new Date(p.FECHA_VIAJE).toISOString().slice(0, 16);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Pasaje</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa - Pasajes</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="/">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="/pasajes">Consultar Pasajes</a></li>
          <li class="nav-item"><a class="nav-link" href="/crear-pasaje">Nuevo Pasaje</a></li>
          <li class="nav-item"><a class="nav-link" href="/exportar">Exportar CSV</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container py-5">
    <h2 class="text-white mb-4">✏️ Editar Pasaje #${p.ID_PASAJE}</h2>

    <div class="card glass-card border-0" style="max-width: 600px; margin: 0 auto;">
      <div class="card-body">
        <form method="POST" action="/actualizar-pasaje/${p.ID_PASAJE}">
          <div class="mb-3">
            <label class="form-label section-title">Ruta *</label>
            <select name="id_ruta" class="form-select" required>
              ${rutasOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Unidad *</label>
            <select name="id_unidad" class="form-select" required>
              ${unidadesOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Tipo de Pasaje *</label>
            <select name="id_tipo" class="form-select" required>
              ${tiposOpciones}
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Valor del Pasaje *</label>
            <input type="number" name="valor" class="form-control" step="0.01" min="0.01" required value="${p.VALOR}">
          </div>

          <div class="mb-3">
            <label class="form-label section-title">Fecha y Hora del Viaje *</label>
            <input type="datetime-local" name="fecha_viaje" class="form-control" required value="${fechaStr}">
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-warning btn-lg">✏️ Actualizar</button>
            <a href="/pasajes" class="btn btn-light">🔙 Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    res.status(500).send(`<div class="alert alert-danger m-5">Error: ${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

app.post('/actualizar-pasaje/:id', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const { id } = req.params;
    const { id_ruta, id_unidad, id_tipo, valor, fecha_viaje } = req.body;
    const fecha = new Date(fecha_viaje);

    await sequelize.query(
      `UPDATE pasajes SET id_ruta = :id_ruta, id_unidad = :id_unidad, id_tipo = :id_tipo, valor = :valor, fecha_viaje = :fecha_viaje WHERE id_pasaje = :id`,
      {
        replacements: {
          id: parseInt(id),
          id_ruta: parseInt(id_ruta),
          id_unidad: parseInt(id_unidad),
          id_tipo: parseInt(id_tipo),
          valor: parseFloat(valor),
          fecha_viaje: fecha
        }
      }
    );

    res.redirect('/pasajes?msg=Pasaje%20actualizado');
  } catch (error) {
    console.error(error);
    res.status(500).send(`<div class="alert alert-danger m-5">Error: ${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

// ====================== ELIMINAR PASAJE ======================

app.get('/eliminar-pasaje/:id', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const { id } = req.params;

    await sequelize.query(
      `DELETE FROM pasajes WHERE id_pasaje = :id`,
      { replacements: { id: parseInt(id) } }
    );

    res.redirect('/pasajes?msg=Pasaje%20eliminado');
  } catch (error) {
    console.error(error);
    res.status(500).send(`<div class="alert alert-danger m-5">Error: ${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

// ====================== EXPORTAR CSV ======================

app.get('/exportar', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exportar CSV</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa - Pasajes</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="/">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" href="/pasajes">Consultar Pasajes</a></li>
          <li class="nav-item"><a class="nav-link" href="/crear-pasaje">Nuevo Pasaje</a></li>
          <li class="nav-item"><a class="nav-link active" href="/exportar">Exportar CSV</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container py-5">
    <div class="text-center text-white mb-5">
      <h1 class="fw-bold">📥 Exportar Datos</h1>
      <p class="mb-0 opacity-75">Descarga los pasajes en formato CSV</p>
    </div>

    <div class="card glass-card border-0" style="max-width: 600px; margin: 0 auto;">
      <div class="card-body text-center">
        <h5 class="section-title mb-4">Opciones de Exportación</h5>
        
        <div class="d-grid gap-3">
          <a href="/descargar-csv" class="btn btn-primary btn-lg">
            📥 Descargar CSV (Método Node.js)
          </a>
          <a href="/ejecutar-cursor-oracle" class="btn btn-info btn-lg">
            ⚙️ Ejecutar Cursor Oracle PL/SQL
          </a>
        </div>

        <hr class="my-4">

        <p class="muted">
          La primera opción exporta los pasajes desde la aplicación.<br>
          La segunda opción ejecuta el cursor PL/SQL en Oracle (genera archivo en servidor Oracle).
        </p>
      </div>
    </div>

    <div class="mt-4 text-center">
      <a href="/" class="btn btn-light">🔙 Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    res.status(500).send(`<div class="alert alert-danger m-5">Error: ${error.message}</div>`);
  } finally {
    await sequelize.close();
  }
});

// Descargar CSV desde Sequelize
app.get('/descargar-csv', async (req, res) => {
  const sequelize = conectarOracle();
  try {
    await sequelize.authenticate();

    const pasajes = await sequelize.query(
      `SELECT
        r.nombre_ruta,
        t.descripcion AS tipo_pasaje,
        p.valor,
        TO_CHAR(p.fecha_viaje, 'YYYY-MM-DD') AS fecha,
        TO_CHAR(p.fecha_viaje, 'HH24:MI') AS hora
      FROM pasajes p
      JOIN rutas r ON p.id_ruta = r.id_ruta
      JOIN tipos_pasaje t ON p.id_tipo = t.id_tipo
      ORDER BY p.fecha_viaje`,
      { type: QueryTypes.SELECT }
    );

    // Generar CSV
    let csv = 'Ruta,Tipo_Pasaje,Valor,Fecha,Hora\n';
    pasajes.forEach(p => {
      csv += `"${p.NOMBRE_RUTA}","${p.TIPO_PASAJE}",${p.VALOR},"${p.FECHA}","${p.HORA}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=pasajes.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  } finally {
    await sequelize.close();
  }
});

// Ejecutar cursor Oracle PL/SQL
app.get('/ejecutar-cursor-oracle', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: DEFAULT_USER,
      password: DEFAULT_PASSWORD,
      connectionString: 'localhost:1521/XE'
    });

    // Ejecutar el cursor PL/SQL
    const result = await connection.execute(
      `BEGIN
        SP_EXPORTAR_PASAJES_CSV();
      END;`,
      {},
      { autoCommit: true }
    );

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5 mt-5">
    <div class="card glass-card border-0 mx-auto" style="max-width: 600px;">
      <div class="card-body text-center">
        <h2 class="text-success mb-3">✅ Cursor Ejecutado</h2>
        <p class="lead">El procedimiento PL/SQL ejecutó exitosamente el cursor de exportación.</p>
        <p class="muted">El archivo <code>pasajes.csv</code> se ha generado en el servidor Oracle.</p>
        <p class="muted small">Revisa la carpeta configurada en el DIRECTORY de Oracle.</p>
        <div class="d-grid gap-2 mt-4">
          <a href="/exportar" class="btn btn-primary">🔙 Volver a Exportar</a>
          <a href="/" class="btn btn-light">🏠 Ir al Dashboard</a>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Error</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5 mt-5">
    <div class="card glass-card border-0 mx-auto" style="max-width: 600px;">
      <div class="card-body">
        <h2 class="text-danger mb-3">❌ Error al Ejecutar Cursor</h2>
        <p class="lead">Posibles soluciones:</p>
        <ul>
          <li>Verifica que el procedimiento <code>SP_EXPORTAR_PASAJES_CSV</code> exista en Oracle</li>
          <li>Verifica que el DIRECTORY esté configurado correctamente</li>
          <li>Revisa los permisos de lectura/escritura en la carpeta</li>
        </ul>
        <p class="muted mt-3">Error técnico: <code>${error.message}</code></p>
        <div class="d-grid gap-2 mt-4">
          <a href="/descargar-csv" class="btn btn-warning">📥 Descargar CSV (Alternativa)</a>
          <a href="/exportar" class="btn btn-light">🔙 Volver</a>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// ====================== SERVIDOR ======================

app.listen(port, () => {
  console.log(`🚌 Servidor corriendo en http://localhost:${port}`);
  console.log('📊 Dashboard: http://localhost:3000/');
  console.log('Presiona Ctrl+C para salir...');
});
