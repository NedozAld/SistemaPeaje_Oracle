const express = require('express');
const path = require('path');
const oracledb = require('oracledb');
const app = express();
const port = process.env.PORT || 3000;

// Configuración
const db = {
    user: 'hr',
    password: 'hr',
    connectString: 'localhost:1521/XE'
};

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

        const queryTotal = 'SELECT COUNT(*) as cnt FROM PASAJES';
        const queryRutas = 'SELECT COUNT(*) as cnt FROM RUTAS WHERE ESTADO = \'A\'';
        const queryUnidades = 'SELECT COUNT(*) as cnt FROM UNIDADES WHERE ESTADO = \'A\'';
        const queryMonto = 'SELECT NVL(SUM(valor_final), 0) as total FROM PASAJES';

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
        <a href="/pasajes" class="btn btn-primary">Ver Pasajes</a>
        <a href="/crear-pasaje" class="btn btn-success">Crear Pasaje</a>
        <a href="/exportar" class="btn btn-info">Exportar CSV</a>
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

// ====================== LISTAR PASAJES ======================
app.get('/pasajes', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Obtener filtros de la URL
        const filtroRuta = req.query.ruta || '';
        
        // Query con filtro opcional por ruta
        let query = `
            SELECT p.id_pasaje, p.fecha_viaje, r.id_ruta, r.nombre_ruta, r.precio_base, u.placa, u.capacidad, tp.descripcion, tp.descuento, p.valor_final
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

        let tablaPasajes = '<tr><th>ID</th><th>Fecha</th><th>Ruta</th><th>Placa</th><th>Tipo</th><th>Precio Base</th><th>Descuento</th><th>Valor Final</th><th>Acciones</th></tr>';
        pasajes.forEach(p => {
            const fecha = p.FECHA_VIAJE ? new Date(p.FECHA_VIAJE).toLocaleDateString() : 'N/A';
            tablaPasajes += `<tr>
                <td>${p.ID_PASAJE}</td>
                <td>${fecha}</td>
                <td>${p.NOMBRE_RUTA}</td>
                <td>${p.PLACA}</td>
                <td>${p.DESCRIPCION}</td>
                <td>$${parseFloat(p.PRECIO_BASE).toFixed(2)}</td>
                <td>${parseFloat(p.DESCUENTO).toFixed(2)}%</td>
                <td><strong>$${parseFloat(p.VALOR_FINAL).toFixed(2)}</strong></td>
                <td>
                    <a href="/editar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-warning">Editar</a>
                    <a href="/eliminar-pasaje/${p.ID_PASAJE}" class="btn btn-sm btn-danger" onclick="return confirm('¿Confirmar eliminación?')">Eliminar</a>
                </td>
            </tr>`;
        });

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
    
    <div class="glass-card p-4">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            ${tablaPasajes}
          </thead>
        </table>
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
          <label class="form-label">Fecha</label>
          <input type="date" name="fecha_viaje" class="form-control" required />
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
    const inputPrecioBase = document.getElementById('precio_base');
    const inputDescuento = document.getElementById('descuento');
    const inputValorFinal = document.getElementById('valor_final');

    function calcular() {
      const rutaId = parseInt(selectRuta.value);
      const tipoId = parseInt(selectTipo.value);

      if (!rutaId || !tipoId) {
        inputPrecioBase.value = '$0.00';
        inputDescuento.value = '0%';
        inputValorFinal.value = '$0.00';
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
      }
    }

    selectRuta.addEventListener('change', calcular);
    selectTipo.addEventListener('change', calcular);
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
        
        const { id_ruta, id_unidad, id_tipo, fecha_viaje, valor } = req.body;
        
        const query = `
            INSERT INTO PASAJES (id_ruta, id_unidad, id_tipo, fecha_viaje)
            VALUES (:id_ruta, :id_unidad, :id_tipo, TO_DATE(:fecha_viaje, 'YYYY-MM-DD'))
        `;

        await connection.execute(query, 
            { id_ruta, id_unidad, id_tipo, fecha_viaje },
            { autoCommit: true }
        );

        res.redirect('/pasajes?msg=Pasaje creado exitosamente');
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

        const fecha = pasaje.FECHA_VIAJE ? new Date(pasaje.FECHA_VIAJE).toISOString().split('T')[0] : '';

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
          <label class="form-label">Fecha</label>
          <input type="date" name="fecha_viaje" class="form-control" value="${fecha}" required />
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
                fecha_viaje = TO_DATE(:fecha_viaje, 'YYYY-MM-DD')
            WHERE id_pasaje = :id
        `;

        await connection.execute(query,
            { id_ruta, id_unidad, id_tipo, fecha_viaje, id },
            { autoCommit: true }
        );

        res.redirect('/pasajes?msg=Pasaje actualizado exitosamente');
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
        connection = await getConnection();

        const query = `
            SELECT p.id_pasaje, p.fecha_viaje, r.nombre_ruta, u.placa, tp.descripcion, p.valor_final
            FROM PASAJES p
            JOIN RUTAS r ON p.id_ruta = r.id_ruta
            JOIN UNIDADES u ON p.id_unidad = u.id_unidad
            JOIN TIPOS_PASAJE tp ON p.id_tipo = tp.id_tipo
            ORDER BY p.fecha_viaje DESC
        `;

        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const pasajes = result.rows;

        let csv = 'ID,Fecha,Ruta,Placa,Tipo Pasaje,Valor Final\n';
        pasajes.forEach(p => {
            const fecha = p.FECHA_VIAJE ? new Date(p.FECHA_VIAJE).toLocaleDateString() : '';
            csv += `${p.ID_PASAJE},"${fecha}","${p.NOMBRE_RUTA}","${p.PLACA}","${p.DESCRIPCION}",${p.VALOR_FINAL}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="pasajes_export.csv"');
        res.send('\ufeff' + csv);
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
