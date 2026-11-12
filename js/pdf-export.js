/**
 * Generador de PDF para Diario de Síntomas
 * Reproduce fielmente el formato de la ficha médica original
 */

const PDFExporter = {
  /**
   * Genera y descarga el documento PDF con los registros
   * @param {Array} records - Lista de registros de síntomas
   * @param {Object} profile - Datos del paciente (nombre, médico, etc.)
   * @param {Object} options - Opciones de visualización (incluir filas vacías, etc.)
   */
  exportToPDF(records, profile = {}, options = {}) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert("Error: jsPDF no está cargado correctamente.");
      return;
    }

    // Configuración en orientación horizontal (Landscape) A4 para tabla de 9 columnas
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Encabezado principal: "DIARIO DE SINTOMAS"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text("DIARIO DE SINTOMAS", pageWidth / 2, 16, { align: "center" });

    // 2. Información del paciente / fechas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    const pacienteNombre = profile.nombre ? profile.nombre : "___________________________________";
    const medicoNombre = profile.medico ? profile.medico : "";
    const fechaEmision = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    let infoY = 22;
    doc.text(`Paciente: ${pacienteNombre}`, 14, infoY);
    if (medicoNombre) {
      doc.text(`Médico: ${medicoNombre}`, 120, infoY);
    }
    doc.text(`Fecha de emisión: ${fechaEmision}`, pageWidth - 14, infoY, { align: "right" });

    // 3. Preparación de columnas y datos para AutoTable
    const headers = [
      [
        { content: "Fecha y hora", styles: { halign: 'center' } },
        { content: "Características del dolor y\nlocalización/o de los síntomas", styles: { halign: 'center' } },
        { content: "Intensidad\n0-10", styles: { halign: 'center' } },
        { content: "Duración", styles: { halign: 'center' } },
        { content: "Factores\ndesencadenantes", styles: { halign: 'center' } },
        { content: "Tratamiento\n—\nSi/No", styles: { halign: 'center' } },
        { content: "Mejoría con\nel\ntratamiento", styles: { halign: 'center' } },
        { content: "Factores aliviantes\no que le quita los\nsíntomas", styles: { halign: 'center' } },
        { content: "Otros", styles: { halign: 'center' } }
      ]
    ];

    // Formatear filas con los datos reales
    const rows = records.map(item => {
      // Formato fecha y hora + presentación
      let fechaHoraStr = "";
      if (item.fecha) {
        const [y, m, d] = item.fecha.split('-');
        fechaHoraStr = `${d}/${m}/${y}`;
      }
      if (item.hora) {
        fechaHoraStr += `\n${item.hora}`;
      }
      if (item.presentacion) {
        fechaHoraStr += `\n(${item.presentacion})`;
      }

      // Tratamiento Sí/No + medicamento
      let tratamientoStr = item.tratamiento === 'Sí' || item.tratamiento === 'Si' ? 'Sí' : 'No';
      if (item.medicamento && item.tratamiento === 'Sí') {
        tratamientoStr += `\n(${item.medicamento})`;
      }

      // Intensidad
      const intensidadStr = item.intensidad !== undefined && item.intensidad !== null ? `${item.intensidad} / 10` : '-';

      return [
        fechaHoraStr,
        item.caracteristicas || '',
        intensidadStr,
        item.duracion || '',
        item.desencadenantes || '',
        tratamientoStr,
        item.mejoria || '',
        item.factoresAliviantes || '',
        item.otros || ''
      ];
    });

    // Si hay pocos registros o el usuario quiere completar la hoja impresa, añadimos filas vacías
    const fillEmptyRows = options.fillEmptyRows !== false;
    const minRows = 12; // Cantidad similar a la hoja física
    if (fillEmptyRows && rows.length < minRows) {
      const emptyCount = minRows - rows.length;
      for (let i = 0; i < emptyCount; i++) {
        rows.push(['', '', '', '', '', '', '', '', '']);
      }
    }

    // 4. Renderizado de tabla mediante doc.autoTable
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 26,
      margin: { left: 10, right: 10, bottom: 24 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: [20, 20, 20],
        lineColor: [40, 40, 40],
        lineWidth: 0.25,
        cellPadding: 2,
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [245, 247, 250],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7.8,
        lineWidth: 0.35,
        lineColor: [20, 20, 20]
      },
      columnStyles: {
        0: { cellWidth: 26, halign: 'center' }, // Fecha y hora
        1: { cellWidth: 42 },                   // Características del dolor y localización
        2: { cellWidth: 18, halign: 'center' }, // Intensidad 0-10
        3: { cellWidth: 22, halign: 'center' }, // Duración
        4: { cellWidth: 40 },                   // Factores desencadenantes
        5: { cellWidth: 26, halign: 'center' }, // Tratamiento Si/No
        6: { cellWidth: 28, halign: 'center' }, // Mejoría
        7: { cellWidth: 40 },                   // Factores aliviantes
        8: { cellWidth: 35 }                    // Otros
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      didDrawPage: (data) => {
        // Notas al pie del documento (reproducción exacta del pie de página original)
        const footerY = pageHeight - 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);

        const nota1 = "** fecha y hora: identificar frecuencia y presentación (matutina, vespertina, nocturna)";
        const nota2 = "** características del dolor y localización: identificar episodios migrañosos típicos (tipo tensión, cervicalgia)";
        const nota3 = "** factores desencadenantes: ciclo menstrual, sueño, factores psicológicos, hormonales (ACO), físicos y metabólicos (ejercicio, ayuno, etc...), ambientales, alimentación.";

        doc.text(nota1, pageWidth / 2, footerY, { align: "center" });
        doc.text(nota2, pageWidth / 2, footerY + 4, { align: "center" });
        doc.text(nota3, pageWidth / 2, footerY + 8, { align: "center" });

        // Número de página
        doc.setFontSize(7);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 14, pageHeight - 6, { align: "right" });
      }
    });

    // 5. Descargar el archivo generado
    const safeDate = new Date().toISOString().slice(0, 10);
    const fileName = `Diario_de_Sintomas_${safeDate}.pdf`;
    doc.save(fileName);
    return fileName;
  },

  /**
   * Exporta a formato CSV compatible con Microsoft Excel
   */
  exportToCSV(records, profile = {}) {
    if (!records || records.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const headers = [
      "Fecha",
      "Hora",
      "Presentación",
      "Características y Localización",
      "Intensidad (0-10)",
      "Duración",
      "Factores Desencadenantes",
      "Tratamiento (Sí/No)",
      "Medicamento / Dosis",
      "Mejoría con Tratamiento",
      "Factores Aliviantes",
      "Otros Síntomas y Notas"
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${str}"`;
    };

    const rows = records.map(r => [
      escapeCSV(r.fecha),
      escapeCSV(r.hora),
      escapeCSV(r.presentacion),
      escapeCSV(r.caracteristicas),
      escapeCSV(r.intensidad),
      escapeCSV(r.duracion),
      escapeCSV(r.desencadenantes),
      escapeCSV(r.tratamiento),
      escapeCSV(r.medicamento),
      escapeCSV(r.mejoria),
      escapeCSV(r.factoresAliviantes),
      escapeCSV(r.otros)
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeDate = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Diario_de_Sintomas_${safeDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.PDFExporter = PDFExporter;
