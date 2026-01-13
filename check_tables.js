const oracledb = require('oracledb');

(async () => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: 'hr',
      password: 'hr',
      connectString: 'localhost:1521/XE'
    });
    
    console.log('✅ Conexión exitosa con usuario hr');
    
    // Verificar todas las tablas del usuario hr
    const tablas = await conn.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('\n📋 Tablas en el esquema HR:');
    if (tablas.rows.length === 0) {
      console.log('   ❌ No hay tablas creadas en el esquema hr');
    } else {
      tablas.rows.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    }

    // Verificar si las tablas están en SYS
    const tablasEnSys = await conn.execute(
      `SELECT table_name, owner FROM all_tables WHERE table_name IN ('RUTAS', 'UNIDADES', 'TIPOS_PASAJE', 'PASAJES') ORDER BY owner, table_name`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    console.log('\n📊 Dónde existen las tablas en toda la BD:');
    if (tablasEnSys.rows.length === 0) {
      console.log('   ❌ Las tablas no existen en ningún lado');
    } else {
      tablasEnSys.rows.forEach(t => console.log(`   ${t.OWNER}.${t.TABLE_NAME}`));
    }

    await conn.close();
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
})();
