const { sequelize } = require('../src/config/database');
// Importamos modelos (asegúrate de que las rutas sean correctas)
const { Fiado, FiadoDetalle, Cliente, ClienteTienda, Tienda } = require('../src/models');

async function migrarDatos() {
    try {
        console.log('1️⃣ Extrayendo datos críticos de la estructura antigua...');

        // 1. Guardar fiados con sus productos en JSON
        const fiadosAntiguos = await Fiado.findAll({
            attributes: ['id', 'tienda_id', 'cliente_id', 'tendero_id', 'numero_fiado', 'fecha_fiado', 'fecha_vencimiento', 'monto_total', 'monto_pagado', 'estado', 'notas', 'productos']
        });

        // 2. Guardar clientes con sus datos de crédito
        const clientesAntiguos = await Cliente.findAll({
            attributes: ['id', 'tienda_id', 'limite_credito', 'saldo_actual', 'score_pagador', 'categoria_pagador', 'total_fiados', 'total_pagos', 'total_mora']
        });

        console.log(`   - Fiados encontrados: ${fiadosAntiguos.length}`);
        console.log(`   - Clientes encontrados: ${clientesAntiguos.length}`);

        console.log('2️⃣ Recreando tablas con la nueva estructura v6...');
        // Esto borra y crea las tablas nuevas (asegúrate de tener un backup si es producción)
        await sequelize.sync({ force: true });

        console.log('3️⃣ Migrando datos a las nuevas tablas relacionales...');

        // Migrar Clientes a ClienteTienda
        for (const c of clientesAntiguos) {
            if (c.tienda_id) {
                await ClienteTienda.create({
                    cliente_id: c.id,
                    tienda_id: c.tienda_id,
                    limite_credito: c.limite_credito || 500,
                    saldo_actual: c.saldo_actual || 0,
                    score_pagador: c.score_pagador || 100,
                    categoria_pagador: c.categoria_pagador || 'nuevo',
                    total_fiados: c.total_fiados || 0,
                    total_pagos: c.total_pagos || 0,
                    cantidad_fiados_mora: c.total_mora || 0,
                    metodo_vinculacion: 'manual'
                });
            }
        }

        // Migrar Fiados a Fiado + FiadoDetalle
        for (const f of fiadosAntiguos) {
            // Crear el fiado padre (sin el campo productos)
            const nuevoFiado = await Fiado.create({
                id: f.id, // Mantenemos el mismo UUID para no romper referencias
                tienda_id: f.tienda_id,
                cliente_id: f.cliente_id,
                tendero_id: f.tendero_id,
                numero_fiado: f.numero_fiado,
                fecha_fiado: f.fecha_fiado,
                fecha_vencimiento: f.fecha_vencimiento,
                monto_total: f.monto_total,
                monto_pagado: f.monto_pagado,
                estado: f.estado,
                notas: f.notas
            });

            // Si tenía productos en JSON, crearlos como FiadoDetalle
            if (f.productos && Array.isArray(f.productos) && f.productos.length > 0) {
                const detalles = f.productos.map(prod => ({
                    fiado_id: nuevoFiado.id,
                    producto_id: prod.producto_id, // Asumiendo que tu JSON tenía esta clave
                    cantidad: prod.cantidad || 1,
                    precio_unitario: prod.precio_unitario || 0,
                    subtotal: prod.subtotal || 0
                }));
                await FiadoDetalle.bulkCreate(detalles);
            }
        }

        console.log('✅ ¡Migración a v6 completada con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrarDatos();