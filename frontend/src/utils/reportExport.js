// src/utils/reportExport.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Helper para obtener fecha actual formateada YYYY-MM-DD
 */
const getFormattedDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * EXPORTAR REPORTE A EXCEL (.xlsx)
 * Genera un libro estructurado con pestañas de Resumen, Crecimiento, Ranking y Auditoría
 */
export const exportReportToExcel = (data, chartData) => {
  if (!data) return;

  const wb = XLSX.utils.book_new();

  // 1. Hoja: Resumen General
  const resumenRows = [
    { Métrica: 'Reporte', Valor: 'Gestión General de Tiendas y Tenderos - Fiamas' },
    { Métrica: 'Fecha de Emisión', Valor: new Date().toLocaleString('es-PE') },
    { Métrica: 'Total Tiendas Registradas', Valor: data.resumen?.totalTiendas ?? 0 },
    { Métrica: 'Tiendas Activas', Valor: data.resumen?.tiendasActivas ?? 0 },
    { Métrica: 'Tasa de Actividad (Tiendas)', Valor: `${data.resumen?.tasaActividadTiendas ?? 0}%` },
    { Métrica: 'Total Tenderos Registrados', Valor: data.resumen?.totalTenderos ?? 0 },
    { Métrica: 'Tenderos Activos', Valor: data.resumen?.tenderosActivos ?? 0 },
    { Métrica: 'Tasa de Actividad (Tenderos)', Valor: `${data.resumen?.tasaActividadTenderos ?? 0}%` },
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

  // 2. Hoja: Crecimiento Mensual
  if (chartData && chartData.length > 0) {
    const crecimientoRows = chartData.map(item => ({
      Mes: item.label || item.mes,
      'Total Registros': item.total,
    }));
    const wsCrecimiento = XLSX.utils.json_to_sheet(crecimientoRows);
    XLSX.utils.book_append_sheet(wb, wsCrecimiento, 'Crecimiento');
  }

  // 3. Hoja: Top Tenderos
  if (data.topTenderos && data.topTenderos.length > 0) {
    const topRows = data.topTenderos.map((t, idx) => ({
      Posición: idx + 1,
      Nombre: t.nombre,
      DNI: t.dni || '—',
      'Tiendas a Cargo': t.totalTiendas,
      Estado: t.activo ? 'Activo' : 'Inactivo',
    }));
    const wsTop = XLSX.utils.json_to_sheet(topRows);
    XLSX.utils.book_append_sheet(wb, wsTop, 'Top Tenderos');
  }

  // 4. Hoja: Última Actividad
  if (data.ultimaActividad && data.ultimaActividad.length > 0) {
    const actRows = data.ultimaActividad.map(act => ({
      Fecha: act.fecha ? new Date(act.fecha).toLocaleString('es-PE') : '—',
      Acción: act.accion?.replace(/_/g, ' ') || '—',
      Descripción: act.descripcion || '—',
    }));
    const wsActividad = XLSX.utils.json_to_sheet(actRows);
    XLSX.utils.book_append_sheet(wb, wsActividad, 'Auditoría Actividad');
  }

  // Generar y descargar archivo
  const filename = `Reporte_Fiamas_${getFormattedDate()}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * EXPORTAR REPORTE A PDF
 * Genera un documento PDF corporativo con tablas, estadísticas y estilo premium
 */
export const exportReportToPDF = (data, chartDataTiendas, chartDataTenderos) => {
  if (!data) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [29, 148, 146]; // #1D9492
  const darkColor = [30, 41, 59]; // #1E293B

  // Encabezado Corporativo
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FIAMAS - FIADO DIGITAL', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte Oficial de Rendimiento y Estadísticas', 14, 18);

  const emisionStr = `Generado el: ${new Date().toLocaleString('es-PE')}`;
  doc.setFontSize(9);
  doc.text(emisionStr, 210 - 14 - doc.getTextWidth(emisionStr), 15);

  let currentY = 32;

  // Título de Sección 1: Resumen de Indicadores Clave
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Indicadores Clave de Desempeño (KPIs)', 14, currentY);
  currentY += 4;

  const kpiData = [
    ['Métrica', 'Valor Actual', 'Detalle'],
    ['Total de Tiendas', `${data.resumen?.totalTiendas ?? 0}`, `${data.resumen?.tiendasActivas ?? 0} activas`],
    ['Total de Tenderos', `${data.resumen?.totalTenderos ?? 0}`, `${data.resumen?.tenderosActivos ?? 0} activos`],
    ['Tasa de Actividad Tiendas', `${data.resumen?.tasaActividadTiendas ?? 0}%`, 'Porcentaje sobre el total registrado'],
    ['Tasa de Actividad Tenderos', `${data.resumen?.tasaActividadTenderos ?? 0}%`, 'Porcentaje sobre el total registrado'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Título de Sección 2: Crecimiento mensual (Últimos 6 meses)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Crecimiento Mensual (Últimos 6 Meses)', 14, currentY);
  currentY += 4;

  const growthRows = (chartDataTiendas || []).map((item, idx) => {
    const tenderosCount = (chartDataTenderos && chartDataTenderos[idx]) ? chartDataTenderos[idx].total : 0;
    return [item.label || item.mes, item.total, tenderosCount];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Mes', 'Nuevas Tiendas', 'Nuevos Tenderos']],
    body: growthRows,
    theme: 'grid',
    headStyles: { fillColor: darkColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5, halign: 'center' },
    columnStyles: { 0: { halign: 'left' } },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Título de Sección 3: Top 5 Tenderos con más tiendas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Ranking de Mejores Tenderos (Top 5)', 14, currentY);
  currentY += 4;

  const topRows = (data.topTenderos || []).map((t, idx) => [
    `#${idx + 1}`,
    t.nombre,
    t.dni || '—',
    `${t.totalTiendas} tiendas`,
    t.activo ? 'Activo' : 'Inactivo',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Ranking', 'Nombre Completo', 'DNI', 'Tiendas a Cargo', 'Estado']],
    body: topRows.length > 0 ? topRows : [['—', 'Sin registros aún', '—', '0', '—']],
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    margin: { left: 14, right: 14 },
  });

  // Si cabe en la página o requiere nueva página para Actividad
  if (data.ultimaActividad && data.ultimaActividad.length > 0) {
    if (doc.lastAutoTable.finalY > 230) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = doc.lastAutoTable.finalY + 10;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Auditoría y Actividad Reciente del Sistema', 14, currentY);
    currentY += 4;

    const actRows = data.ultimaActividad.map(act => [
      act.fecha ? new Date(act.fecha).toLocaleString('es-PE') : '—',
      act.accion?.replace(/_/g, ' ') || '—',
      act.descripcion || '—',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Fecha y Hora', 'Acción Realizada', 'Descripción']],
      body: actRows,
      theme: 'grid',
      headStyles: { fillColor: darkColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 45 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Pie de página con numeración
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${pageCount} · Fiamas Plataforma Digital`, 14, 290);
    const rightText = 'Documento confidencial para uso administrativo';
    doc.text(rightText, 210 - 14 - doc.getTextWidth(rightText), 290);
  }

  // Guardar archivo PDF
  const filename = `Reporte_Fiamas_${getFormattedDate()}.pdf`;
  doc.save(filename);
};
