const express = require('express');
const path = require('path');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de base de datos con variables de entorno
const db = {
    user: process.env.DB_USER || 'hr',
    password: process.env.DB_PASSWORD || 'hr',
    connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE'
};

console.log('🔌 Conectando a Oracle:', db.connectString);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const bootstrapLink = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">`;

const estilosGlobales = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    min-height: 100vh; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding-bottom: 2rem;
  }
  
  .glass-card { 
    background: rgba(255,255,255,0.95); 
    border-radius: 20px; 
    box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5); 
    backdrop-filter: blur(10px); 
    border: 1px solid rgba(255,255,255,0.4);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 70px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.6);
  }
  
  .section-title { 
    color: #1e293b; 
    font-weight: 700; 
    letter-spacing: -0.5px;
    margin-bottom: 1.5rem;
  }
  
  .navbar-dark {
    background: rgba(17,24,39,0.9) !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  
  .navbar-brand {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  
  .nav-link {
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 0 4px;
  }
  
  .nav-link:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-1px);
  }
  
  .table { 
    border-radius: 12px; 
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  }
  
  .table thead th { 
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
    color: #f9fafb; 
    border: none;
    padding: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }
  
  .table tbody tr { 
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  
  .table tbody tr:hover { 
    background: rgba(102,126,234,0.08);
    transform: scale(1.01);
  }
  
  .table tbody td {
    padding: 1rem;
    vertical-align: middle;
  }
  
  .btn { 
    border-radius: 10px; 
    font-weight: 600;
    padding: 0.6rem 1.5rem;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  
  .btn-primary { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  }
  
  .btn-primary:hover { 
    background: linear-gradient(135deg, #5568d3 0%, #6a4291 100%);
  }
  
  .btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  
  .btn-success:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
  
  .btn-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .btn-sm {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
  
  .form-control, .form-select {
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    padding: 0.7rem 1rem;
    transition: all 0.3s ease;
    font-size: 0.95rem;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
  }
  
  .form-label {
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .alert {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  }
  
  .alert-info {
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
    color: #0c4a6e;
  }
  
  h1 {
    font-weight: 800;
    letter-spacing: -1px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }
  
  h2 {
    font-weight: 700;
    font-size: 2.5rem;
  }
  
  h3, h5 {
    font-weight: 600;
    color: #1e293b;
  }
  
  .badge-soft { 
    background: rgba(102,126,234,0.15); 
    color: #667eea;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
  }
  
  .card-stat {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .card-stat:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    .btn { padding: 0.5rem 1rem; font-size: 0.9rem; }
    h1 { font-size: 1.8rem; }
    .table { font-size: 0.85rem; }
  }
</style>`;

// Función para obtener conexión
async function getConnection() {
    try {
        return await oracledb.getConnection(db);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        throw error;
    }
}

// ====================== DASHBOARD ======================
app.get('/', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const queryTotal = 'SELECT NVL(SUM(cantidad), 0) as cnt FROM PASAJES';
        const queryRutas = 'SELECT COUNT(*) as cnt FROM RUTAS WHERE ESTADO = \'A\'';
        const queryUnidades = 'SELECT COUNT(*) as cnt FROM UNIDADES WHERE ESTADO = \'A\'';
        const queryMonto = 'SELECT NVL(SUM(total_pagar), 0) as total FROM PASAJES';

        const [resTotal, resRutas, resUnidades, resMonto] = await Promise.all([
            connection.execute(queryTotal, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            connection.execute(queryRutas, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            connection.execute(queryUnidades, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            connection.execute(queryMonto, [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
        ]);

        const totalPasajes = resTotal.rows[0]?.CNT || 0;
        const totalRutas = resRutas.rows[0]?.CNT || 0;
        const totalUnidades = resUnidades.rows[0]?.CNT || 0;
        const montoTotal = resMonto.rows[0]?.TOTAL || 0;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🚌 Sistema Gestión Pasajes</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa Pasajes</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Dashboard</a>
        <a class="nav-link" href="/pasajes">Consultar</a>
        <a class="nav-link" href="/crear-pasaje">Nuevo</a>
        <a class="nav-link" href="/exportar">Exportar</a>
      </div>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-white mb-4">📊 Dashboard</h1>
    
    <div class="row">
      <div class="col-md-3">
        <div class="glass-card p-4 text-center">
          <h5 class="section-title">Pasajes Totales</h5>
          <h2 class="text-primary">${totalPasajes}</h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="glass-card p-4 text-center">
          <h5 class="section-title">Rutas Activas</h5>
          <h2 class="text-success">${totalRutas}</h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="glass-card p-4 text-center">
          <h5 class="section-title">Unidades</h5>
          <h2 class="text-warning">${totalUnidades}</h2>
        </div>
      </div>
      <div class="col-md-3">
        <div class="glass-card p-4 text-center">
          <h5 class="section-title">Monto Total</h5>
          <h2 class="text-info">$${parseFloat(montoTotal).toFixed(2)}</h2>
        </div>
      </div>
    </div>

    <div class="glass-card p-4 mt-5">
      <h3>Acciones Rápidas</h3>
      <div class="btn-group mt-3" role="group">
        <a href="/rutas" class="btn btn-warning">🚌 Rutas</a>
        <a href="/unidades" class="btn btn-info">🚗 Unidades</a>
        <a href="/tipos-pasaje" class="btn btn-secondary">🎫 Tipos Pasaje</a>
        <a href="/pasajes" class="btn btn-primary">Ver Pasajes</a>
        <a href="/crear-pasaje" class="btn btn-success">Crear Pasaje</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// ====================== GESTIÓN DE RUTAS ======================

// Listar Rutas
app.get('/rutas', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const filtroEstado = req.query.estado || '';
        
        let query = 'SELECT * FROM RUTAS';
        if (filtroEstado) {
            query += ` WHERE ESTADO = '${filtroEstado}'`;
        }
        query += ' ORDER BY id_ruta DESC';
        
        const result = await connection.execute(query);
        const rutas = result.rows.map(row => ({
            ID_RUTA: row[0],
            NOMBRE_RUTA: row[1],
            ORIGEN: row[2],
            DESTINO: row[3],
            PRECIO_BASE: row[4],
            DURACION_HORAS: row[5] || 0.5,
            ESTADO: row[6]
        }));

        let tablaRutas = '<thead class="table-dark"><tr><th class="text-center">ID</th><th>🚌 Nombre Ruta</th><th>📍 Origen</th><th>🎯 Destino</th><th class="text-end">💵 Precio Base</th><th class="text-center">⏱️ Duración</th><th class="text-center">📊 Estado</th><th class="text-center">⚙️ Acciones</th></tr></thead><tbody>';
        rutas.forEach((r, index) => {
            const rowClass = index % 2 === 0 ? 'table-light' : 'table-white';
            const estadoBadge = r.ESTADO === 'A' ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
            const duracionTexto = r.DURACION_HORAS >= 24 ? `${r.DURACION_HORAS/24} día(s)` : `${r.DURACION_HORAS} hora(s)`;
            tablaRutas += `<tr class="${rowClass} align-middle">
                <td class="fw-bold text-center text-primary">${r.ID_RUTA}</td>
                <td><strong>${r.NOMBRE_RUTA}</strong></td>
                <td>${r.ORIGEN}</td>
                <td>${r.DESTINO}</td>
                <td class="text-end">$<strong>${parseFloat(r.PRECIO_BASE).toFixed(2)}</strong></td>
                <td class="text-center"><span class="badge bg-info">${duracionTexto}</span></td>
                <td class="text-center">${estadoBadge}</td>
                <td class="text-center">
                    <a href="/editar-ruta/${r.ID_RUTA}" class="btn btn-sm btn-warning me-2" title="Editar">✏️</a>
                    <a href="/eliminar-ruta/${r.ID_RUTA}" class="btn btn-sm btn-danger" title="Eliminar" onclick="return confirm('¿Confirmar eliminación?')">🗑️</a>
                </td>
            </tr>`;
        });
        tablaRutas += '</tbody>';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestión de Rutas</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">🚌 Gestión de Rutas</h1>
      <p class="mb-0 opacity-75">Administra las rutas del sistema</p>
    </div>

    <div class="glass-card p-3 mb-4">
      <form method="GET" action="/rutas" class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Filtrar por Estado</label>
          <select name="estado" class="form-select">
            <option value="">Todos</option>
            <option value="A" ${filtroEstado === 'A' ? 'selected' : ''}>Activos</option>
            <option value="I" ${filtroEstado === 'I' ? 'selected' : ''}>Inactivos</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">🔍 Buscar</button>
        </div>
      </form>
    </div>
    
    <div class="glass-card p-4 shadow-lg">
      <h5 class="mb-4"><strong>📊 Listado de Rutas</strong></h5>
      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle border-bottom">
          ${tablaRutas}
        </table>
      </div>
      <div class="text-muted small mt-2">
        <p>📍 Total de rutas: <strong>${rutas.length}</strong></p>
      </div>
    </div>

    <div class="mt-3">
      <a href="/crear-ruta" class="btn btn-success">+ Nueva Ruta</a>
      <a href="/" class="btn btn-secondary">Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Crear Ruta
app.get('/crear-ruta', async (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crear Ruta</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">➕ Nueva Ruta</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 700px; margin: 0 auto;">
      <form method="POST" action="/crear-ruta">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">🚌 Nombre de la Ruta</label>
            <input type="text" name="nombre_ruta" class="form-control" placeholder="Ej: Lima - Arequipa" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📍 Origen</label>
            <input type="text" name="origen" class="form-control" placeholder="Ciudad de origen" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">🎯 Destino</label>
            <input type="text" name="destino" class="form-control" placeholder="Ciudad de destino" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">💵 Precio Base</label>
            <input type="number" name="precio_base" class="form-control" step="0.01" min="0.01" placeholder="0.00" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">⏱️ Duración (horas)</label>
            <input type="number" name="duracion_horas" class="form-control" step="0.5" min="0.5" value="0.5" placeholder="0.5" required />
            <small class="form-text text-muted">0.5 = 30 min | 1 = 1 hora | 24 = 1 día</small>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📊 Estado</label>
            <select name="estado" class="form-select" required>
              <option value="A" selected>Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-success btn-lg w-100">✅ Guardar Ruta</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/rutas" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
});

// Guardar Ruta
app.post('/crear-ruta', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { nombre_ruta, origen, destino, precio_base, duracion_horas, estado } = req.body;
        
        await connection.execute(
            `INSERT INTO RUTAS (nombre_ruta, origen, destino, precio_base, duracion_horas, estado)
             VALUES (:nombre_ruta, :origen, :destino, :precio_base, :duracion_horas, :estado)`,
            { nombre_ruta, origen, destino, precio_base, duracion_horas, estado },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/rutas" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Ruta creada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Editar Ruta
app.get('/editar-ruta/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        const result = await connection.execute(
            'SELECT * FROM RUTAS WHERE id_ruta = :id',
            { id }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).send('<h1>Ruta no encontrada</h1>');
        }
        
        const ruta = {
            ID_RUTA: result.rows[0][0],
            NOMBRE_RUTA: result.rows[0][1],
            ORIGEN: result.rows[0][2],
            DESTINO: result.rows[0][3],
            PRECIO_BASE: result.rows[0][4],
            DURACION_HORAS: result.rows[0][5] || 0.5,
            ESTADO: result.rows[0][6]
        };

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Ruta</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">✏️ Editar Ruta</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 700px; margin: 0 auto;">
      <form method="POST" action="/editar-ruta/${ruta.ID_RUTA}">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">🚌 Nombre de la Ruta</label>
            <input type="text" name="nombre_ruta" class="form-control" value="${ruta.NOMBRE_RUTA}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📍 Origen</label>
            <input type="text" name="origen" class="form-control" value="${ruta.ORIGEN}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">🎯 Destino</label>
            <input type="text" name="destino" class="form-control" value="${ruta.DESTINO}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">💵 Precio Base</label>
            <input type="number" name="precio_base" class="form-control" step="0.01" min="0.01" value="${ruta.PRECIO_BASE}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">⏱️ Duración (horas)</label>
            <input type="number" name="duracion_horas" class="form-control" step="0.5" min="0.5" value="${ruta.DURACION_HORAS}" required />
            <small class="form-text text-muted">0.5 = 30 min | 1 = 1 hora | 24 = 1 día</small>
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📊 Estado</label>
            <select name="estado" class="form-select" required>
              <option value="A" ${ruta.ESTADO === 'A' ? 'selected' : ''}>Activo</option>
              <option value="I" ${ruta.ESTADO === 'I' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-warning btn-lg w-100">💾 Actualizar Ruta</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/rutas" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Actualizar Ruta
app.post('/editar-ruta/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { nombre_ruta, origen, destino, precio_base, duracion_horas, estado } = req.body;
        
        await connection.execute(
            `UPDATE RUTAS 
             SET nombre_ruta = :nombre_ruta,
                 origen = :origen,
                 destino = :destino,
                 precio_base = :precio_base,
                 duracion_horas = :duracion_horas,
                 estado = :estado
             WHERE id_ruta = :id`,
            { nombre_ruta, origen, destino, precio_base, duracion_horas, estado, id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/rutas" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Ruta actualizada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Eliminar Ruta
app.get('/eliminar-ruta/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        await connection.execute(
            'DELETE FROM RUTAS WHERE id_ruta = :id',
            { id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/rutas" />
  <title>Eliminado</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-danger px-4 py-2 fs-5">🗑️ Eliminado</span></div>
      <h2 class="fw-bold mb-3">¡Ruta eliminada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// ====================== GESTIÓN DE UNIDADES ======================

// Listar Unidades
app.get('/unidades', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const filtroEstado = req.query.estado || '';
        
        let query = 'SELECT * FROM UNIDADES';
        if (filtroEstado) {
            query += ` WHERE ESTADO = '${filtroEstado}'`;
        }
        query += ' ORDER BY id_unidad DESC';
        
        const result = await connection.execute(query);
        const unidades = result.rows.map(row => ({
            ID_UNIDAD: row[0],
            PLACA: row[1],
            MODELO: row[2],
            CAPACIDAD: row[3],
            ESTADO: row[4]
        }));

        let tablaUnidades = '<thead class="table-dark"><tr><th class="text-center">ID</th><th>🚗 Placa</th><th>🚙 Modelo</th><th class="text-center">👥 Capacidad</th><th class="text-center">📊 Estado</th><th class="text-center">⚙️ Acciones</th></tr></thead><tbody>';
        unidades.forEach((u, index) => {
            const rowClass = index % 2 === 0 ? 'table-light' : 'table-white';
            const estadoBadge = u.ESTADO === 'A' ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
            tablaUnidades += `<tr class="${rowClass} align-middle">
                <td class="fw-bold text-center text-primary">${u.ID_UNIDAD}</td>
                <td><span class="badge bg-info text-dark fs-6">${u.PLACA}</span></td>
                <td><strong>${u.MODELO}</strong></td>
                <td class="text-center"><span class="badge bg-primary">${u.CAPACIDAD} pax</span></td>
                <td class="text-center">${estadoBadge}</td>
                <td class="text-center">
                    <a href="/editar-unidad/${u.ID_UNIDAD}" class="btn btn-sm btn-warning me-2" title="Editar">✏️</a>
                    <a href="/eliminar-unidad/${u.ID_UNIDAD}" class="btn btn-sm btn-danger" title="Eliminar" onclick="return confirm('¿Confirmar eliminación?')">🗑️</a>
                </td>
            </tr>`;
        });
        tablaUnidades += '</tbody>';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestión de Unidades</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">🚗 Gestión de Unidades</h1>
      <p class="mb-0 opacity-75">Administra las unidades de transporte</p>
    </div>

    <div class="glass-card p-3 mb-4">
      <form method="GET" action="/unidades" class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Filtrar por Estado</label>
          <select name="estado" class="form-select">
            <option value="">Todos</option>
            <option value="A" ${filtroEstado === 'A' ? 'selected' : ''}>Activos</option>
            <option value="I" ${filtroEstado === 'I' ? 'selected' : ''}>Inactivos</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">🔍 Buscar</button>
        </div>
      </form>
    </div>
    
    <div class="glass-card p-4 shadow-lg">
      <h5 class="mb-4"><strong>📊 Listado de Unidades</strong></h5>
      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle border-bottom">
          ${tablaUnidades}
        </table>
      </div>
      <div class="text-muted small mt-2">
        <p>📍 Total de unidades: <strong>${unidades.length}</strong></p>
      </div>
    </div>

    <div class="mt-3">
      <a href="/crear-unidad" class="btn btn-success">+ Nueva Unidad</a>
      <a href="/" class="btn btn-secondary">Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Crear Unidad
app.get('/crear-unidad', async (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crear Unidad</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">➕ Nueva Unidad</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 700px; margin: 0 auto;">
      <form method="POST" action="/crear-unidad">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">🚗 Placa</label>
            <input type="text" name="placa" class="form-control" placeholder="Ej: ABC-123" maxlength="10" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">🚙 Modelo</label>
            <input type="text" name="modelo" class="form-control" placeholder="Ej: Mercedes Benz Sprinter" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">👥 Capacidad (pasajeros)</label>
            <input type="number" name="capacidad" class="form-control" min="1" placeholder="0" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📊 Estado</label>
            <select name="estado" class="form-select" required>
              <option value="A" selected>Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-success btn-lg w-100">✅ Guardar Unidad</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/unidades" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
});

// Guardar Unidad
app.post('/crear-unidad', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { placa, modelo, capacidad, estado } = req.body;
        
        await connection.execute(
            `INSERT INTO UNIDADES (placa, modelo, capacidad, estado)
             VALUES (:placa, :modelo, :capacidad, :estado)`,
            { placa, modelo, capacidad, estado },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/unidades" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Unidad creada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Editar Unidad
app.get('/editar-unidad/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        const result = await connection.execute(
            'SELECT * FROM UNIDADES WHERE id_unidad = :id',
            { id }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).send('<h1>Unidad no encontrada</h1>');
        }
        
        const unidad = {
            ID_UNIDAD: result.rows[0][0],
            PLACA: result.rows[0][1],
            MODELO: result.rows[0][2],
            CAPACIDAD: result.rows[0][3],
            ESTADO: result.rows[0][4]
        };

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Unidad</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">✏️ Editar Unidad</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 700px; margin: 0 auto;">
      <form method="POST" action="/editar-unidad/${unidad.ID_UNIDAD}">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">🚗 Placa</label>
            <input type="text" name="placa" class="form-control" value="${unidad.PLACA}" maxlength="10" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">🚙 Modelo</label>
            <input type="text" name="modelo" class="form-control" value="${unidad.MODELO}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">👥 Capacidad (pasajeros)</label>
            <input type="number" name="capacidad" class="form-control" min="1" value="${unidad.CAPACIDAD}" required />
          </div>
          
          <div class="col-md-6">
            <label class="form-label">📊 Estado</label>
            <select name="estado" class="form-select" required>
              <option value="A" ${unidad.ESTADO === 'A' ? 'selected' : ''}>Activo</option>
              <option value="I" ${unidad.ESTADO === 'I' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-warning btn-lg w-100">💾 Actualizar Unidad</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/unidades" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Actualizar Unidad
app.post('/editar-unidad/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { placa, modelo, capacidad, estado } = req.body;
        
        await connection.execute(
            `UPDATE UNIDADES 
             SET placa = :placa,
                 modelo = :modelo,
                 capacidad = :capacidad,
                 estado = :estado
             WHERE id_unidad = :id`,
            { placa, modelo, capacidad, estado, id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/unidades" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Unidad actualizada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Eliminar Unidad
app.get('/eliminar-unidad/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        await connection.execute(
            'DELETE FROM UNIDADES WHERE id_unidad = :id',
            { id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/unidades" />
  <title>Eliminado</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-danger px-4 py-2 fs-5">🗑️ Eliminado</span></div>
      <h2 class="fw-bold mb-3">¡Unidad eliminada!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// ====================== GESTIÓN DE TIPOS DE PASAJE ======================

// Listar Tipos de Pasaje
app.get('/tipos-pasaje', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const result = await connection.execute('SELECT * FROM TIPOS_PASAJE ORDER BY id_tipo DESC');
        const tipos = result.rows.map(row => ({
            ID_TIPO: row[0],
            DESCRIPCION: row[1],
            DESCUENTO: row[2]
        }));

        let tablaTipos = '<thead class="table-dark"><tr><th class="text-center">ID</th><th>📝 Descripción</th><th class="text-center">🏷️ Descuento (%)</th><th class="text-center">⚙️ Acciones</th></tr></thead><tbody>';
        tipos.forEach((t, index) => {
            const rowClass = index % 2 === 0 ? 'table-light' : 'table-white';
            const descuentoColor = t.DESCUENTO > 0 ? 'warning' : 'secondary';
            tablaTipos += `<tr class="${rowClass} align-middle">
                <td class="fw-bold text-center text-primary">${t.ID_TIPO}</td>
                <td><strong>${t.DESCRIPCION}</strong></td>
                <td class="text-center"><span class="badge bg-${descuentoColor} text-dark fs-6">${parseFloat(t.DESCUENTO).toFixed(2)}%</span></td>
                <td class="text-center">
                    <a href="/editar-tipo/${t.ID_TIPO}" class="btn btn-sm btn-warning me-2" title="Editar">✏️</a>
                    <a href="/eliminar-tipo/${t.ID_TIPO}" class="btn btn-sm btn-danger" title="Eliminar" onclick="return confirm('¿Confirmar eliminación?')">🗑️</a>
                </td>
            </tr>`;
        });
        tablaTipos += '</tbody>';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tipos de Pasaje</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">🎫 Tipos de Pasaje</h1>
      <p class="mb-0 opacity-75">Gestiona los tipos de pasajes y descuentos</p>
    </div>
    
    <div class="glass-card p-4 shadow-lg">
      <h5 class="mb-4"><strong>📊 Listado de Tipos</strong></h5>
      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle border-bottom">
          ${tablaTipos}
        </table>
      </div>
      <div class="text-muted small mt-2">
        <p>📍 Total de tipos: <strong>${tipos.length}</strong></p>
      </div>
    </div>

    <div class="mt-3">
      <a href="/crear-tipo" class="btn btn-success">+ Nuevo Tipo</a>
      <a href="/" class="btn btn-secondary">Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Crear Tipo
app.get('/crear-tipo', async (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crear Tipo de Pasaje</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">➕ Nuevo Tipo de Pasaje</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 600px; margin: 0 auto;">
      <form method="POST" action="/crear-tipo">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">📝 Descripción</label>
            <input type="text" name="descripcion" class="form-control" placeholder="Ej: Adulto, Niño, Estudiante" maxlength="50" required />
          </div>
          
          <div class="col-md-12">
            <label class="form-label">🏷️ Descuento (%)</label>
            <input type="number" name="descuento" class="form-control" step="0.01" min="0" max="100" value="0" placeholder="0.00" required />
            <small class="text-muted">Ingrese el porcentaje de descuento (0-100)</small>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-success btn-lg w-100">✅ Guardar Tipo</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/tipos-pasaje" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
});

// Guardar Tipo
app.post('/crear-tipo', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { descripcion, descuento } = req.body;
        
        await connection.execute(
            `INSERT INTO TIPOS_PASAJE (descripcion, descuento)
             VALUES (:descripcion, :descuento)`,
            { descripcion, descuento },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/tipos-pasaje" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Tipo de pasaje creado!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Formulario Editar Tipo
app.get('/editar-tipo/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        const result = await connection.execute(
            'SELECT * FROM TIPOS_PASAJE WHERE id_tipo = :id',
            { id }
        );
        
        if (result.rows.length === 0) {
            return res.status(404).send('<h1>Tipo no encontrado</h1>');
        }
        
        const tipo = {
            ID_TIPO: result.rows[0][0],
            DESCRIPCION: result.rows[0][1],
            DESCUENTO: result.rows[0][2]
        };

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editar Tipo de Pasaje</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-4">
    <div class="text-center text-white mb-4">
      <h1 class="fw-bold hero-text">✏️ Editar Tipo de Pasaje</h1>
    </div>

    <div class="glass-card p-4" style="max-width: 600px; margin: 0 auto;">
      <form method="POST" action="/editar-tipo/${tipo.ID_TIPO}">
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">📝 Descripción</label>
            <input type="text" name="descripcion" class="form-control" value="${tipo.DESCRIPCION}" maxlength="50" required />
          </div>
          
          <div class="col-md-12">
            <label class="form-label">🏷️ Descuento (%)</label>
            <input type="number" name="descuento" class="form-control" step="0.01" min="0" max="100" value="${tipo.DESCUENTO}" required />
            <small class="text-muted">Ingrese el porcentaje de descuento (0-100)</small>
          </div>
          
          <div class="col-12 mt-4">
            <button type="submit" class="btn btn-warning btn-lg w-100">💾 Actualizar Tipo</button>
          </div>
        </div>
      </form>
      
      <div class="mt-3 text-center">
        <a href="/tipos-pasaje" class="btn btn-secondary">🔙 Volver</a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Actualizar Tipo
app.post('/editar-tipo/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        const { descripcion, descuento } = req.body;
        
        await connection.execute(
            `UPDATE TIPOS_PASAJE 
             SET descripcion = :descripcion,
                 descuento = :descuento
             WHERE id_tipo = :id`,
            { descripcion, descuento, id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/tipos-pasaje" />
  <title>Éxito</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-success px-4 py-2 fs-5">✅ Éxito</span></div>
      <h2 class="fw-bold mb-3">¡Tipo actualizado!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// Eliminar Tipo
app.get('/eliminar-tipo/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;
        
        await connection.execute(
            'DELETE FROM TIPOS_PASAJE WHERE id_tipo = :id',
            { id },
            { autoCommit: true }
        );

        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="2;url=/tipos-pasaje" />
  <title>Eliminado</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 500px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-danger px-4 py-2 fs-5">🗑️ Eliminado</span></div>
      <h2 class="fw-bold mb-3">¡Tipo eliminado!</h2>
      <p class="lead">Redirigiendo...</p>
    </div>
  </div>
</body>
</html>`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error al cerrar:', error.message);
            }
        }
    }
});

// ====================== LISTAR PASAJES ======================
app.get('/pasajes', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Obtener filtros de la URL
        const filtroRuta = req.query.ruta || '';
        
        // Query con filtro opcional por ruta
        let query = `
            SELECT p.id_pasaje, p.fecha_viaje, p.cantidad, p.total_pagar, p.nombre_pasajero, r.id_ruta, r.nombre_ruta, r.precio_base, u.placa, u.capacidad, tp.descripcion, tp.descuento, p.valor_final
            FROM PASAJES p
            JOIN RUTAS r ON p.id_ruta = r.id_ruta
            JOIN UNIDADES u ON p.id_unidad = u.id_unidad
            JOIN TIPOS_PASAJE tp ON p.id_tipo = tp.id_tipo
        `;

        const params = [];
        if (filtroRuta) {
            query += ` WHERE r.id_ruta = :ruta`;
            params.push(filtroRuta);
        }
        
        query += ` ORDER BY p.fecha_viaje DESC`;

        const result = await connection.execute(
            query, 
            filtroRuta ? { ruta: filtroRuta } : [], 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const pasajes = result.rows;

        // Obtener lista de rutas para el filtro
        const rutasResult = await connection.execute(
            'SELECT id_ruta, nombre_ruta FROM RUTAS WHERE ESTADO = \'A\' ORDER BY nombre_ruta',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const rutas = rutasResult.rows;
        
        let optRutas = '<option value="">Todas las rutas</option>';
        optRutas += rutas.map(r => 
            `<option value="${r.ID_RUTA}" ${r.ID_RUTA == filtroRuta ? 'selected' : ''}>${r.NOMBRE_RUTA}</option>`
        ).join('');

        let tablaPasajes = '<thead class="table-dark"><tr><th class="text-center">ID</th><th>📅 Fecha y Hora</th><th>🧍 Pasajero</th><th>🚌 Ruta</th><th>🚗 Placa</th><th>📝 Tipo</th><th class="text-end">💵 Precio Base</th><th class="text-end">🏷️ Descuento</th><th class="text-end">💰 Valor Unitario</th><th class="text-end">🔢 Cantidad</th><th class="text-end">🧾 Total</th><th class="text-center">⚙️ Acciones</th></tr></thead><tbody>';
        pasajes.forEach((p, index) => {
            const fecha = p.FECHA_VIAJE ? new Date(p.FECHA_VIAJE).toLocaleString('es-MX') : 'N/A';
            const rowClass = index % 2 === 0 ? 'table-light' : 'table-white';
            tablaPasajes += `<tr class="${rowClass} align-middle">
                <td class="fw-bold text-center text-primary">${p.ID_PASAJE}</td>
                <td><small class="text-muted">${fecha}</small></td>
          <td>${p.NOMBRE_PASAJERO || ''}</td>
                <td><strong>${p.NOMBRE_RUTA}</strong></td>
                <td><span class="badge bg-info text-dark">${p.PLACA}</span></td>
                <td>${p.DESCRIPCION}</td>
            <td class="text-end">$<strong>${parseFloat(p.PRECIO_BASE).toFixed(2)}</strong></td>
            <td class="text-end"><span class="badge bg-warning text-dark">${parseFloat(p.DESCUENTO).toFixed(2)}%</span></td>
            <td class="text-end"><strong class="text-success">$${parseFloat(p.VALOR_FINAL).toFixed(2)}</strong></td>
            <td class="text-end">${p.CANTIDAD}</td>
            <td class="text-end fw-bold text-success">$${parseFloat(p.TOTAL_PAGAR || 0).toFixed(2)}</td>
                <td class="text-center">
                    <a href="/editar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-warning me-2" title="Editar">✏️</a>
                    <a href="/eliminar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-danger" title="Eliminar" onclick="return confirm('¿Confirmar eliminación?')">🗑️</a>
                </td>
            </tr>`;
        });
        tablaPasajes += '</tbody>';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pasajes</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Dashboard</a>
        <a class="nav-link active" href="/pasajes">Consultar</a>
        <a class="nav-link" href="/crear-pasaje">Nuevo</a>
        <a class="nav-link" href="/exportar">Exportar</a>
      </div>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-white mb-4">📋 Pasajes Registrados (${pasajes.length})</h1>
    
    <div class="glass-card p-4 mb-3">
      <h5 class="mb-3">🔍 Filtros</h5>
      <form method="GET" action="/pasajes" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Filtrar por Ruta</label>
          <select name="ruta" class="form-control">
            ${optRutas}
          </select>
        </div>
        <div class="col-md-6 d-flex align-items-end">
          <button type="submit" class="btn btn-primary me-2">Filtrar</button>
          <a href="/pasajes" class="btn btn-secondary">Limpiar</a>
        </div>
      </form>
    </div>
    
    <div class="glass-card p-4 shadow-lg">
      <h5 class="mb-4"><strong>📊 Listado de Pasajes</strong></h5>
      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle border-bottom">
          ${tablaPasajes}
        </table>
      </div>
      <div class="text-muted small mt-2">
        <p>📍 Total de pasajes: <strong>${pasajes.length}</strong></p>
      </div>
    </div>

    <div class="mt-3">
      <a href="/crear-pasaje" class="btn btn-success">+ Nuevo Pasaje</a>
      <a href="/" class="btn btn-secondary">Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== CREAR PASAJE ======================
app.get('/crear-pasaje', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const rutas = await connection.execute('SELECT id_ruta, nombre_ruta, precio_base FROM RUTAS WHERE ESTADO = \'A\' ORDER BY nombre_ruta', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const unidades = await connection.execute('SELECT id_unidad, placa, capacidad FROM UNIDADES WHERE ESTADO = \'A\' ORDER BY placa', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const tipos = await connection.execute('SELECT id_tipo, descripcion, descuento FROM TIPOS_PASAJE ORDER BY descripcion', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        let optRutas = rutas.rows.map(r => `<option value="${r.ID_RUTA}">${r.NOMBRE_RUTA} (Base: $${parseFloat(r.PRECIO_BASE).toFixed(2)})</option>`).join('');
        let optUnidades = unidades.rows.map(u => `<option value="${u.ID_UNIDAD}">${u.PLACA} (Cap: ${u.CAPACIDAD})</option>`).join('');
        let optTipos = tipos.rows.map(t => `<option value="${t.ID_TIPO}">${t.DESCRIPCION} (Desc: ${parseFloat(t.DESCUENTO).toFixed(2)}%)</option>`).join('');

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
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa</a>
      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="/">Dashboard</a>
        <a class="nav-link" href="/pasajes">Consultar</a>
        <a class="nav-link active" href="/crear-pasaje">Nuevo</a>
        <a class="nav-link" href="/exportar">Exportar</a>
      </div>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-white mb-4">➕ Nuevo Pasaje</h1>
    
    <div class="glass-card p-4" style="max-width: 500px;">
      <form method="POST" action="/guardar-pasaje">
        <div class="mb-3">
          <label class="form-label">Ruta</label>
          <select name="id_ruta" class="form-control" required>
            <option value="">-- Seleccionar --</option>
            ${optRutas}
          </select>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Unidad</label>
          <select name="id_unidad" class="form-control" required>
            <option value="">-- Seleccionar --</option>
            ${optUnidades}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Tipo Pasaje</label>
          <select name="id_tipo" class="form-control" required>
            <option value="">-- Seleccionar --</option>
            ${optTipos}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Nombre del pasajero</label>
          <input type="text" name="nombre_pasajero" class="form-control" maxlength="150" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Cantidad de pasajes</label>
          <input type="number" name="cantidad" class="form-control" min="1" max="999" value="1" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Fecha y hora</label>
          <input type="datetime-local" name="fecha_viaje" class="form-control" required />
          <small class="text-muted">Ejemplo: 2026-01-19T10:30</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Precio Base</label>
          <input type="text" id="precio_base" class="form-control" readonly value="$0.00" style="background-color: #f0f0f0;" />
        </div>

        <div class="mb-3">
          <label class="form-label">Descuento</label>
          <input type="text" id="descuento" class="form-control" readonly value="0%" style="background-color: #f0f0f0;" />
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>Valor Final (Calculado)</strong></label>
          <input type="text" id="valor_final" class="form-control" readonly value="$0.00" style="background-color: #e8f5e9; font-weight: bold; font-size: 1.1em;" />
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>Total a pagar (x cantidad)</strong></label>
          <input type="text" id="valor_total" class="form-control" readonly value="$0.00" style="background-color: #e8f5e9; font-weight: bold; font-size: 1.1em;" />
        </div>
        
        <p class="alert alert-info" style="font-size: 0.9em;">
          <strong>⚙️ Nota:</strong> El valor final se calcula automáticamente mediante trigger Oracle:<br>
          <code>Valor Final = Precio Base - (Precio Base × Descuento%)</code>
        </p>

        <button type="submit" class="btn btn-success">Guardar</button>
        <a href="/pasajes" class="btn btn-secondary">Cancelar</a>
      </form>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    // Datos de rutas y tipos
    const rutas = ${JSON.stringify(rutas.rows)};
    const tipos = ${JSON.stringify(tipos.rows)};

    const selectRuta = document.querySelector('select[name="id_ruta"]');
    const selectTipo = document.querySelector('select[name="id_tipo"]');
    const inputCantidad = document.querySelector('input[name="cantidad"]');
    const inputPrecioBase = document.getElementById('precio_base');
    const inputDescuento = document.getElementById('descuento');
    const inputValorFinal = document.getElementById('valor_final');
    const inputValorTotal = document.getElementById('valor_total');

    function calcular() {
      const rutaId = parseInt(selectRuta.value);
      const tipoId = parseInt(selectTipo.value);
      const cantidad = Math.max(1, Math.min(parseInt(inputCantidad.value) || 1, 999));

      if (!rutaId || !tipoId) {
        inputPrecioBase.value = '$0.00';
        inputDescuento.value = '0%';
        inputValorFinal.value = '$0.00';
        inputValorTotal.value = '$0.00';
        return;
      }

      const ruta = rutas.find(r => r.ID_RUTA === rutaId);
      const tipo = tipos.find(t => t.ID_TIPO === tipoId);

      if (ruta && tipo) {
        const precioBase = parseFloat(ruta.PRECIO_BASE);
        const descuento = parseFloat(tipo.DESCUENTO);
        const valorFinal = precioBase - (precioBase * descuento / 100);

        inputPrecioBase.value = '$' + precioBase.toFixed(2);
        inputDescuento.value = descuento.toFixed(2) + '%';
        inputValorFinal.value = '$' + valorFinal.toFixed(2);
        inputValorTotal.value = '$' + (valorFinal * cantidad).toFixed(2);
      }
    }

    selectRuta.addEventListener('change', calcular);
    selectTipo.addEventListener('change', calcular);
    inputCantidad.addEventListener('input', calcular);
  </script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== GUARDAR PASAJE ======================
app.post('/guardar-pasaje', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const { id_ruta, id_unidad, id_tipo, fecha_viaje, cantidad, nombre_pasajero } = req.body;

        const cantidadNum = Math.max(1, Math.min(parseInt(cantidad, 10) || 1, 999));

        const query = `
        INSERT INTO PASAJES (id_ruta, id_unidad, id_tipo, fecha_viaje, cantidad, nombre_pasajero)
        VALUES (:id_ruta, :id_unidad, :id_tipo, TO_DATE(:fecha_viaje, 'YYYY-MM-DD"T"HH24:MI'), :cantidad, :nombre_pasajero)
      `;

        await connection.execute(query, { id_ruta, id_unidad, id_tipo, fecha_viaje, cantidad: cantidadNum, nombre_pasajero }, { autoCommit: true });

        const mensajeOk = cantidadNum > 1
            ? `Se registró 1 compra con ${cantidadNum} pasajes`
            : 'Pasaje creado exitosamente';

        res.redirect(`/pasajes?msg=${encodeURIComponent(mensajeOk)}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        let mensajeError = error.message;
        let tituloError = 'Error al crear pasaje';
        
        // Detectar error del trigger de validación de unidad
        if (error.message.includes('ORA-20001') || error.message.includes('ya tiene asignada una ruta')) {
            mensajeError = 'La unidad (vehículo) seleccionada ya tiene asignada una ruta en esa fecha y hora. Por favor, seleccione otra unidad o cambie la fecha del viaje.';
            tituloError = '⚠️ Unidad no disponible';
        } else if (error.message.includes('ORA-02291')) {
            mensajeError = 'Uno de los valores seleccionados (ruta, unidad o tipo) no es válido o no existe.';
            tituloError = '❌ Datos inválidos';
        } else if (error.message.includes('ORA-01847') || error.message.includes('date')) {
            mensajeError = 'La fecha ingresada no es válida. Por favor, verifique el formato de la fecha.';
            tituloError = '📅 Fecha inválida';
        }
        
        res.status(500).send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Error</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <div class="container py-5">
    <div class="glass-card p-5 text-center" style="max-width: 700px; margin: 0 auto;">
      <div class="mb-3"><span class="badge bg-danger px-4 py-2 fs-5">❌ Error</span></div>
      <h2 class="fw-bold mb-3">${tituloError}</h2>
      <div class="alert alert-warning text-start">
        <p class="mb-0"><strong>Detalle:</strong> ${mensajeError}</p>
      </div>
      <div class="mt-4">
        <a href="/crear-pasaje" class="btn btn-primary">🔄 Intentar nuevamente</a>
        <a href="/pasajes" class="btn btn-secondary">🔙 Volver a Pasajes</a>
      </div>
    </div>
  </div>
</body>
</html>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== EDITAR PASAJE ======================
app.get('/editar-pasaje/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const { id } = req.params;
        
        const pasajeResult = await connection.execute(
            'SELECT * FROM PASAJES WHERE id_pasaje = :id',
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (!pasajeResult.rows.length) {
            return res.status(404).send('<h1>Pasaje no encontrado</h1>');
        }

        const pasaje = pasajeResult.rows[0];

        const [rutas, unidades, tipos] = await Promise.all([
            connection.execute('SELECT id_ruta, nombre_ruta, precio_base FROM RUTAS WHERE ESTADO = \'A\' ORDER BY nombre_ruta', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            connection.execute('SELECT id_unidad, placa, capacidad FROM UNIDADES WHERE ESTADO = \'A\' ORDER BY placa', [], { outFormat: oracledb.OUT_FORMAT_OBJECT }),
            connection.execute('SELECT id_tipo, descripcion, descuento FROM TIPOS_PASAJE ORDER BY descripcion', [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
        ]);

        let optRutas = rutas.rows.map(r => `<option value="${r.ID_RUTA}" ${r.ID_RUTA === pasaje.ID_RUTA ? 'selected' : ''}>${r.NOMBRE_RUTA} (Base: $${parseFloat(r.PRECIO_BASE).toFixed(2)})</option>`).join('');
        let optUnidades = unidades.rows.map(u => `<option value="${u.ID_UNIDAD}" ${u.ID_UNIDAD === pasaje.ID_UNIDAD ? 'selected' : ''}>${u.PLACA} (Cap: ${u.CAPACIDAD})</option>`).join('');
        let optTipos = tipos.rows.map(t => `<option value="${t.ID_TIPO}" ${t.ID_TIPO === pasaje.ID_TIPO ? 'selected' : ''}>${t.DESCRIPCION} (Desc: ${parseFloat(t.DESCUENTO).toFixed(2)}%)</option>`).join('');

        const fecha = (() => {
          if (!pasaje.FECHA_VIAJE) return '';
          const d = new Date(pasaje.FECHA_VIAJE);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
          return local.toISOString().slice(0, 16); // formato YYYY-MM-DDTHH:MM
        })();

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
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa</a>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-white mb-4">✏️ Editar Pasaje #${id}</h1>
    
    <div class="glass-card p-4" style="max-width: 500px;">
      <form method="POST" action="/actualizar-pasaje/${id}">
        <div class="mb-3">
          <label class="form-label">Ruta</label>
          <select name="id_ruta" class="form-control" required>
            ${optRutas}
          </select>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Unidad</label>
          <select name="id_unidad" class="form-control" required>
            ${optUnidades}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Tipo Pasaje</label>
          <select name="id_tipo" class="form-control" required>
            ${optTipos}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Fecha y hora</label>
          <input type="datetime-local" name="fecha_viaje" class="form-control" value="${fecha}" required />
          <small class="text-muted">Ejemplo: 2026-01-19T10:30</small>
        </div>

        <div class="alert alert-warning">
          <strong>Valor Final Actual:</strong> $${parseFloat(pasaje.VALOR_FINAL).toFixed(2)}
          <p style="font-size: 0.9em; margin-top: 0.5rem;">
            Se recalculará automáticamente al actualizar la ruta o tipo de pasaje.
          </p>
        </div>

        <button type="submit" class="btn btn-warning">Actualizar</button>
        <a href="/pasajes" class="btn btn-secondary">Cancelar</a>
      </form>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== ACTUALIZAR PASAJE ======================
app.post('/actualizar-pasaje/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const { id } = req.params;
        const { id_ruta, id_unidad, id_tipo, fecha_viaje, valor } = req.body;
        
        const query = `
            UPDATE PASAJES 
            SET id_ruta = :id_ruta, id_unidad = :id_unidad, id_tipo = :id_tipo, 
              fecha_viaje = TO_DATE(:fecha_viaje, 'YYYY-MM-DD"T"HH24:MI')
            WHERE id_pasaje = :id
        `;

        await connection.execute(query,
            { id_ruta, id_unidad, id_tipo, fecha_viaje, id },
            { autoCommit: true }
        );

        res.redirect('/pasajes?msg=Pasaje actualizado exitosamente');
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Detectar el error del trigger de unidad duplicada
        if (error.message.includes('ORA-20001')) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Unidad ya asignada</title>
                    ${bootstrapLink}
                    ${estilosGlobales}
                </head>
                <body class="bg-light">
                    <div class="container mt-5">
                        <div class="glass-card">
                            <div class="text-center mb-4">
                                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 4rem;"></i>
                            </div>
                            <h2 class="text-center text-danger mb-4">⚠️ Conflicto de Horario</h2>
                            <div class="alert alert-warning" role="alert">
                                <h5 class="alert-heading">La unidad (vehículo) seleccionada ya tiene asignada una ruta en esa fecha y hora.</h5>
                                <hr>
                                <p class="mb-0">Por favor, seleccione otra unidad o cambie la fecha del viaje.</p>
                            </div>
                            <div class="text-center mt-4">
                                <a href="/editar-pasaje/${id}" class="btn btn-primary btn-lg">
                                    🔙 Volver a editar
                                </a>
                                <a href="/pasajes" class="btn btn-secondary btn-lg">
                                    📋 Ver todos los pasajes
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Detectar error de clave foránea inválida
        if (error.message.includes('ORA-02291')) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Datos inválidos</title>
                    ${bootstrapLink}
                    ${estilosGlobales}
                </head>
                <body class="bg-light">
                    <div class="container mt-5">
                        <div class="glass-card">
                            <h2 class="text-center text-danger mb-4">❌ Error de Validación</h2>
                            <div class="alert alert-danger" role="alert">
                                <p class="mb-0">Uno de los valores seleccionados (ruta, unidad o tipo) no es válido o no existe.</p>
                            </div>
                            <div class="text-center mt-4">
                                <a href="/editar-pasaje/${id}" class="btn btn-primary btn-lg">🔙 Volver a editar</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Detectar error de formato de fecha
        if (error.message.includes('ORA-01847')) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error - Fecha inválida</title>
                    ${bootstrapLink}
                    ${estilosGlobales}
                </head>
                <body class="bg-light">
                    <div class="container mt-5">
                        <div class="glass-card">
                            <h2 class="text-center text-danger mb-4">📅 Error de Fecha</h2>
                            <div class="alert alert-danger" role="alert">
                                <p class="mb-0">La fecha ingresada no es válida. Por favor, verifique el formato de la fecha.</p>
                            </div>
                            <div class="text-center mt-4">
                                <a href="/editar-pasaje/${id}" class="btn btn-primary btn-lg">🔙 Volver a editar</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Error genérico
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error</title>
                ${bootstrapLink}
                ${estilosGlobales}
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="glass-card">
                        <h2 class="text-center text-danger mb-4">❌ Error</h2>
                        <div class="alert alert-danger" role="alert">
                            <p class="mb-0">${error.message}</p>
                        </div>
                        <div class="text-center mt-4">
                            <a href="/editar-pasaje/${id}" class="btn btn-primary btn-lg">🔙 Volver a editar</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== ELIMINAR PASAJE ======================
app.get('/eliminar-pasaje/:id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const { id } = req.params;
        
        await connection.execute('DELETE FROM PASAJES WHERE id_pasaje = :id', { id }, { autoCommit: true });

        res.redirect('/pasajes?msg=Pasaje eliminado exitosamente');
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== EXPORTAR ======================
app.get('/exportar', async (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exportar</title>
  ${bootstrapLink}
  ${estilosGlobales}
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">🚌 Cooperativa</a>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-white mb-4">📤 Exportar Datos</h1>
    
    <div class="glass-card p-4">
      <p>Selecciona el formato de exportación:</p>
      <div class="btn-group mt-3">
        <a href="/descargar-csv" class="btn btn-info">📥 Descargar CSV</a>
      </div>
    </div>

    <div class="mt-3">
      <a href="/" class="btn btn-secondary">Volver</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    res.send(html);
});

// ====================== DESCARGAR CSV ======================
app.get('/descargar-csv', async (req, res) => {
    let connection;
    try {
        const fs = require('fs');
        const path = require('path');
        
        connection = await getConnection();

        const query = `
            SELECT p.id_pasaje, p.fecha_viaje, p.cantidad, p.total_pagar, p.nombre_pasajero, r.nombre_ruta, u.placa, tp.descripcion, p.valor_final
            FROM PASAJES p
            JOIN RUTAS r ON p.id_ruta = r.id_ruta
            JOIN UNIDADES u ON p.id_unidad = u.id_unidad
            JOIN TIPOS_PASAJE tp ON p.id_tipo = tp.id_tipo
            ORDER BY p.fecha_viaje DESC
        `;

        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const pasajes = result.rows;

        let csv = 'ID,Fecha,Hora,Pasajero,Ruta,Placa,Tipo Pasaje,Valor Unitario,Cantidad,Total Pagar\n';
        pasajes.forEach(p => {
            const fechaObj = p.FECHA_VIAJE ? new Date(p.FECHA_VIAJE) : null;
            const fecha = fechaObj ? fechaObj.toLocaleDateString() : '';
            const hora = fechaObj ? fechaObj.toLocaleTimeString() : '';
          csv += `${p.ID_PASAJE},"${fecha}","${hora}","${p.NOMBRE_PASAJERO}","${p.NOMBRE_RUTA}","${p.PLACA}","${p.DESCRIPCION}",${p.VALOR_FINAL},${p.CANTIDAD},${p.TOTAL_PAGAR}\n`;
        });

        // Guardar en C:\OracleFiles
        const dirPath = 'C:\\OracleFiles';
        const fileName = `pasajes_export_${new Date().getTime()}.csv`;
        const filePath = path.join(dirPath, fileName);
        
        // Crear directorio si no existe
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Escribir archivo
        fs.writeFileSync(filePath, '\ufeff' + csv, 'utf-8');
        
        res.status(200).send(`✅ CSV guardado exitosamente en: ${filePath}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).send(`Error: ${error.message}`);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
});

// ====================== INICIAR SERVIDOR ======================
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Dashboard: http://localhost:${port}/`);
    console.log(`Presiona Ctrl+C para salir...`);
});

module.exports = app;
