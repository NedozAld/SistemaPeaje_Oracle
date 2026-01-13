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
        
        const query = `
            SELECT p.id_pasaje, p.fecha_viaje, r.nombre_ruta, r.precio_base, u.placa, u.capacidad, tp.descripcion, tp.descuento, p.valor_final
            FROM PASAJES p
            JOIN RUTAS r ON p.id_ruta = r.id_ruta
            JOIN UNIDADES u ON p.id_unidad = u.id_unidad
            JOIN TIPOS_PASAJE tp ON p.id_tipo = tp.id_tipo
            ORDER BY p.fecha_viaje DESC
        `;

        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const pasajes = result.rows;

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
        
        <p class="alert alert-info" style="font-size: 0.9em; margin-top: 1rem;">
          <strong>⚙️ Nota:</strong> El valor final se calcula automáticamente mediante trigger:<br>
          <code>Valor Final = Precio Base - (Precio Base × Descuento%)</code>
        </p>

        <button type="submit" class="btn btn-success">Guardar</button>
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
