/**
 * Diario de Síntomas - Lógica de Aplicación
 */

const DEFAULT_MEDICATIONS = [
  "Ibuprofeno 600mg",
  "Paracetamol 1g",
  "Ketorolaco",
  "Zolmitriptán",
  "Sumatriptán",
  "Ergotamina",
  "Antiemético (Metoclopramida)"
];

const AppState = {
  records: [],
  profile: {
    nombre: '',
    medico: '',
    notas: ''
  },
  medications: [...DEFAULT_MEDICATIONS],
  currentEditingId: null,
  activeFilter: 'all',
  searchQuery: '',
  
  // Claves de LocalStorage
  STORAGE_RECORDS_KEY: 'diario_sintomas_records_v1',
  STORAGE_PROFILE_KEY: 'diario_sintomas_profile_v1',
  STORAGE_MEDS_KEY: 'diario_sintomas_medications_v1'
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupEventListeners();
  renderApp();
  
  // Si no hay datos, sugerir cargar datos de ejemplo si es la primera vez
  if (AppState.records.length === 0) {
    showFirstTimeWelcome();
  }
});

// Cargar datos de LocalStorage
function loadStoredData() {
  try {
    const storedRecords = localStorage.getItem(AppState.STORAGE_RECORDS_KEY);
    if (storedRecords) {
      AppState.records = JSON.parse(storedRecords);
    }
    const storedProfile = localStorage.getItem(AppState.STORAGE_PROFILE_KEY);
    if (storedProfile) {
      AppState.profile = JSON.parse(storedProfile);
    }
    const storedMeds = localStorage.getItem(AppState.STORAGE_MEDS_KEY);
    if (storedMeds) {
      const parsed = JSON.parse(storedMeds);
      if (Array.isArray(parsed) && parsed.length > 0) {
        AppState.medications = parsed;
      }
    }
  } catch (e) {
    console.error("Error al cargar datos locales:", e);
  }
}

// Guardar datos en LocalStorage
function persistRecords() {
  try {
    localStorage.setItem(AppState.STORAGE_RECORDS_KEY, JSON.stringify(AppState.records));
  } catch (e) {
    console.error("Error guardando registros:", e);
  }
}

function persistProfile() {
  try {
    localStorage.setItem(AppState.STORAGE_PROFILE_KEY, JSON.stringify(AppState.profile));
  } catch (e) {
    console.error("Error guardando perfil:", e);
  }
}

function persistMedications() {
  try {
    localStorage.setItem(AppState.STORAGE_MEDS_KEY, JSON.stringify(AppState.medications));
  } catch (e) {
    console.error("Error guardando medicamentos:", e);
  }
}

// Configurar escuchadores de eventos
function setupEventListeners() {
  // Inicializar iconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Botón Nuevo Registro
  const btnNewRecord = document.getElementById('btnNewRecord');
  const btnFabNew = document.getElementById('btnFabNew');
  if (btnNewRecord) btnNewRecord.addEventListener('click', () => openRecordModal());
  if (btnFabNew) btnFabNew.addEventListener('click', () => openRecordModal());

  // Cerrar Modal
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelRecord = document.getElementById('btnCancelRecord');
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeRecordModal);
  if (btnCancelRecord) btnCancelRecord.addEventListener('click', closeRecordModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeRecordModal();
    });
  }

  // Formulario de Registro
  const recordForm = document.getElementById('recordForm');
  if (recordForm) {
    recordForm.addEventListener('submit', handleSaveRecord);
  }

  // Slider de Intensidad
  const inputIntensidad = document.getElementById('inputIntensidad');
  if (inputIntensidad) {
    inputIntensidad.addEventListener('input', (e) => updateIntensityDisplay(e.target.value));
  }

  // Tratamiento Sí / No toggle
  const radTratamientoSi = document.getElementById('tratamientoSi');
  const radTratamientoNo = document.getElementById('tratamientoNo');
  if (radTratamientoSi && radTratamientoNo) {
    radTratamientoSi.addEventListener('change', toggleTratamientoFields);
    radTratamientoNo.addEventListener('change', toggleTratamientoFields);
  }

  // Botón Exportar PDF
  const btnExportPDF = document.getElementById('btnExportPDF');
  const btnExportPDFHeader = document.getElementById('btnExportPDFHeader');
  if (btnExportPDF) btnExportPDF.addEventListener('click', handleExportPDF);
  if (btnExportPDFHeader) btnExportPDFHeader.addEventListener('click', handleExportPDF);

  // Botón Exportar CSV / Excel
  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) btnExportCSV.addEventListener('click', handleExportCSV);

  // Botón Configuración de Paciente
  const btnProfile = document.getElementById('btnProfile');
  if (btnProfile) btnProfile.addEventListener('click', openProfileModal);

  // Modal de Perfil
  const btnCloseProfileModal = document.getElementById('btnCloseProfileModal');
  const profileForm = document.getElementById('profileForm');
  if (btnCloseProfileModal) btnCloseProfileModal.addEventListener('click', closeProfileModal);
  if (profileForm) profileForm.addEventListener('submit', handleSaveProfile);

  // Backup & Restore
  const btnBackupJSON = document.getElementById('btnBackupJSON');
  const inputRestoreJSON = document.getElementById('inputRestoreJSON');
  if (btnBackupJSON) btnBackupJSON.addEventListener('click', handleBackupJSON);
  if (inputRestoreJSON) inputRestoreJSON.addEventListener('change', handleRestoreJSON);

  // Botón Cargar Datos Demo
  const btnLoadDemo = document.getElementById('btnLoadDemo');
  if (btnLoadDemo) btnLoadDemo.addEventListener('click', loadDemoData);

  // Barra de Búsqueda y Filtros
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.toLowerCase().trim();
      renderRecordsList();
    });
  }

  // Filtros rápidos por botones (Todos, Mes, Severos)
  const filterButtons = document.querySelectorAll('.filter-pill');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('bg-sky-600', 'text-white', 'border-sky-600'));
      filterButtons.forEach(b => b.classList.add('bg-white', 'text-slate-600', 'border-slate-200'));
      
      btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
      btn.classList.add('bg-sky-600', 'text-white', 'border-sky-600');
      
      AppState.activeFilter = btn.dataset.filter;
      renderRecordsList();
    });
  });

  // Setup Chips interactivos
  setupChipGroup('chipsPresentacion', 'inputPresentacion', false);
  setupChipGroup('chipsTipoDolor', 'inputCaracteristicas', true);
  setupChipGroup('chipsLocalizacion', 'inputCaracteristicas', true);
  setupChipGroup('chipsDuracion', 'inputDuracion', false);
  setupChipGroup('chipsDesencadenantes', 'inputDesencadenantes', true);
  setupChipGroup('chipsMedicamentos', 'inputMedicamento', true);
  setupChipGroup('chipsMejoria', 'inputMejoria', false);
  setupChipGroup('chipsAliviantes', 'inputFactoresAliviantes', true);
  setupChipGroup('chipsOtros', 'inputOtros', true);

  // Agregar medicamentos personalizados
  const btnToggleAddMed = document.getElementById('btnToggleAddMed');
  const boxAddCustomMed = document.getElementById('boxAddCustomMed');
  const btnCancelAddMed = document.getElementById('btnCancelAddMed');
  const btnSaveNewMed = document.getElementById('btnSaveNewMed');
  const inputNewMedName = document.getElementById('inputNewMedName');
  const inputMedicamento = document.getElementById('inputMedicamento');
  const btnQuickSaveInputMed = document.getElementById('btnQuickSaveInputMed');

  if (btnToggleAddMed && boxAddCustomMed) {
    btnToggleAddMed.addEventListener('click', () => {
      boxAddCustomMed.classList.toggle('hidden');
      if (!boxAddCustomMed.classList.contains('hidden') && inputNewMedName) {
        inputNewMedName.focus();
      }
    });
  }

  if (btnCancelAddMed && boxAddCustomMed) {
    btnCancelAddMed.addEventListener('click', () => {
      boxAddCustomMed.classList.add('hidden');
      if (inputNewMedName) inputNewMedName.value = '';
    });
  }

  const triggerSaveNewMed = () => {
    if (inputNewMedName) {
      const val = inputNewMedName.value.trim();
      if (val) {
        addCustomMedication(val);
        inputNewMedName.value = '';
        if (boxAddCustomMed) boxAddCustomMed.classList.add('hidden');
      }
    }
  };

  if (btnSaveNewMed) btnSaveNewMed.addEventListener('click', triggerSaveNewMed);
  if (inputNewMedName) {
    inputNewMedName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSaveNewMed();
      }
    });
  }

  // Detectar cuando el usuario escribe en el campo libre de medicamento
  if (inputMedicamento && btnQuickSaveInputMed) {
    inputMedicamento.addEventListener('input', (e) => {
      const typed = e.target.value.trim();
      if (typed && typed.length >= 3) {
        const exists = AppState.medications.some(m => m.toLowerCase() === typed.toLowerCase());
        if (!exists) {
          btnQuickSaveInputMed.classList.remove('hidden');
        } else {
          btnQuickSaveInputMed.classList.add('hidden');
        }
      } else {
        btnQuickSaveInputMed.classList.add('hidden');
      }
      syncSingleGroup('chipsMedicamentos', 'inputMedicamento', true);
    });

    btnQuickSaveInputMed.addEventListener('click', () => {
      const typed = inputMedicamento.value.trim();
      if (typed) {
        addCustomMedication(typed);
        btnQuickSaveInputMed.classList.add('hidden');
      }
    });
  }
}

// Configura el comportamiento de un grupo de botones de etiquetas (chips)
function setupChipGroup(containerId, targetInputId, isMultiSelect) {
  const container = document.getElementById(containerId);
  const targetInput = document.getElementById(targetInputId);
  if (!container || !targetInput) return;

  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-btn');
    if (!chip) return;

    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    const value = chip.dataset.val || chip.textContent.trim();

    if (!isMultiSelect) {
      // Selección única
      const allChips = container.querySelectorAll('.chip-btn');
      allChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      targetInput.value = value;
    } else {
      // Selección múltiple: concatena o remueve del campo de texto
      const isCurrentlyActive = chip.classList.contains('active');
      if (isCurrentlyActive) {
        chip.classList.remove('active');
        // Remover valor del input
        let currentValues = targetInput.value.split(',').map(s => s.trim()).filter(Boolean);
        currentValues = currentValues.filter(v => v.toLowerCase() !== value.toLowerCase());
        targetInput.value = currentValues.join(', ');
      } else {
        chip.classList.add('active');
        // Añadir valor al input
        let currentValues = targetInput.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!currentValues.some(v => v.toLowerCase() === value.toLowerCase())) {
          currentValues.push(value);
        }
        targetInput.value = currentValues.join(', ');
      }
    }
  });
}

// Sincronizar estado visual de chips con el texto del input
function syncChipsWithInputs() {
  syncSingleGroup('chipsPresentacion', 'inputPresentacion', false);
  syncSingleGroup('chipsTipoDolor', 'inputCaracteristicas', true);
  syncSingleGroup('chipsLocalizacion', 'inputCaracteristicas', true);
  syncSingleGroup('chipsDuracion', 'inputDuracion', false);
  syncSingleGroup('chipsDesencadenantes', 'inputDesencadenantes', true);
  syncSingleGroup('chipsMedicamentos', 'inputMedicamento', true);
  syncSingleGroup('chipsMejoria', 'inputMejoria', false);
  syncSingleGroup('chipsAliviantes', 'inputFactoresAliviantes', true);
  syncSingleGroup('chipsOtros', 'inputOtros', true);
}

function syncSingleGroup(containerId, inputId, isMulti) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  if (!container || !input) return;

  const currentVal = input.value.trim().toLowerCase();
  const chips = container.querySelectorAll('.chip-btn');

  chips.forEach(chip => {
    const val = (chip.dataset.val || chip.textContent).trim().toLowerCase();
    if (!isMulti) {
      chip.classList.toggle('active', currentVal === val);
    } else {
      const parts = currentVal.split(',').map(s => s.trim());
      chip.classList.toggle('active', parts.includes(val) || currentVal.includes(val));
    }
  });
}

// Actualizar indicador visual de intensidad EVA (0 a 10)
function updateIntensityDisplay(val) {
  const num = parseInt(val, 10);
  const badge = document.getElementById('intensityBadge');
  const label = document.getElementById('intensityLabel');
  const emoji = document.getElementById('intensityEmoji');
  if (!badge || !label) return;

  badge.textContent = `${num} / 10`;

  let colorClass = 'bg-slate-100 text-slate-700';
  let desc = 'Sin dolor';
  let em = '😊';

  if (num === 0) {
    colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
    desc = '0 - Sin dolor';
    em = '😊';
  } else if (num >= 1 && num <= 3) {
    colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    desc = `${num} - Dolor leve`;
    em = '🙂';
  } else if (num >= 4 && num <= 6) {
    colorClass = 'bg-amber-100 text-amber-800 border-amber-300';
    desc = `${num} - Dolor moderado`;
    em = '😐';
  } else if (num >= 7 && num <= 8) {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-300';
    desc = `${num} - Dolor severo / fuerte`;
    em = '😣';
  } else {
    colorClass = 'bg-rose-100 text-rose-800 border-rose-300';
    desc = `${num} - Dolor insoportable / crisis máxima`;
    em = '😭';
  }

  badge.className = `px-3 py-1 rounded-full text-sm font-bold border transition-colors ${colorClass}`;
  label.textContent = desc;
  if (emoji) emoji.textContent = em;
}

// Alternar campos de medicamento según Tratamiento Sí / No
function toggleTratamientoFields() {
  const radSi = document.getElementById('tratamientoSi');
  const detailsBox = document.getElementById('tratamientoDetailsBox');
  if (!detailsBox) return;

  const inputMejoria = document.getElementById('inputMejoria');

  if (radSi && radSi.checked) {
    detailsBox.classList.remove('hidden');
    if (inputMejoria && (!inputMejoria.value || inputMejoria.value === 'No aplica' || inputMejoria.value === 'No tomó')) {
      inputMejoria.value = 'Sin mejoría';
    }
    syncSingleGroup('chipsMejoria', 'inputMejoria', false);
  } else {
    detailsBox.classList.add('hidden');
    const inputMed = document.getElementById('inputMedicamento');
    if (inputMed) inputMed.value = '';
    if (inputMejoria && !inputMejoria.value) {
      inputMejoria.value = 'Sin mejoría';
    }
    syncSingleGroup('chipsMejoria', 'inputMejoria', false);
  }
}

// Renderizar chips de medicamentos (por defecto y personalizados)
function renderMedicationChips() {
  const container = document.getElementById('chipsMedicamentos');
  if (!container) return;

  container.innerHTML = AppState.medications.map(med => {
    const isDefault = DEFAULT_MEDICATIONS.includes(med);
    return `
      <div 
        class="chip-btn inline-flex items-center gap-1 group select-none" 
        data-val="${escapeHtml(med)}"
      >
        <span>${escapeHtml(med)}</span>
        ${!isDefault ? `
          <span 
            role="button" 
            title="Quitar de medicamentos habituales" 
            class="ml-1 text-slate-400 hover:text-rose-600 font-bold px-1 rounded hover:bg-rose-100/70 transition-colors"
            onclick="event.stopPropagation(); removeCustomMedication('${escapeHtml(med)}')"
          >×</span>
        ` : ''}
      </div>
    `;
  }).join('');

  syncSingleGroup('chipsMedicamentos', 'inputMedicamento', true);
}

// Agregar nuevo medicamento persistente
function addCustomMedication(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const exists = AppState.medications.some(m => m.toLowerCase() === trimmed.toLowerCase());
  if (!exists) {
    AppState.medications.push(trimmed);
    persistMedications();
    renderMedicationChips();
    showToast(`Medicamento "${trimmed}" guardado como botón rápido.`);
  } else {
    showToast(`"${trimmed}" ya está en tus medicamentos.`);
  }

  // Si el modal está abierto, agregar o marcar en el campo de texto
  const inputMed = document.getElementById('inputMedicamento');
  if (inputMed) {
    let currentValues = inputMed.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!currentValues.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      currentValues.push(trimmed);
      inputMed.value = currentValues.join(', ');
    }
    syncSingleGroup('chipsMedicamentos', 'inputMedicamento', true);
  }
}

// Eliminar medicamento de la lista
function removeCustomMedication(name) {
  if (confirm(`¿Deseas quitar "${name}" de tu lista de medicamentos habituales?`)) {
    AppState.medications = AppState.medications.filter(m => m.toLowerCase() !== name.toLowerCase());
    persistMedications();
    renderMedicationChips();
    showToast("Medicamento eliminado de la lista.");
  }
}

// Abrir modal para crear o editar
function openRecordModal(recordId = null) {
  AppState.currentEditingId = recordId;
  const modal = document.getElementById('recordModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('recordForm');
  if (!modal || !form) return;

  form.reset();
  renderMedicationChips();

  if (recordId) {
    modalTitle.textContent = "Editar Episodio";
    const item = AppState.records.find(r => r.id === recordId);
    if (item) {
      document.getElementById('inputFecha').value = item.fecha || '';
      document.getElementById('inputHora').value = item.hora || '';
      document.getElementById('inputPresentacion').value = item.presentacion || '';
      document.getElementById('inputCaracteristicas').value = item.caracteristicas || '';
      document.getElementById('inputIntensidad').value = item.intensidad !== undefined ? item.intensidad : 5;
      document.getElementById('inputDuracion').value = item.duracion || '';
      document.getElementById('inputDesencadenantes').value = item.desencadenantes || '';
      
      const isSi = (item.tratamiento === 'Sí' || item.tratamiento === 'Si');
      document.getElementById('tratamientoSi').checked = isSi;
      document.getElementById('tratamientoNo').checked = !isSi;
      
      document.getElementById('inputMedicamento').value = item.medicamento || '';
      document.getElementById('inputMejoria').value = item.mejoria || 'Sin mejoría';
      document.getElementById('inputFactoresAliviantes').value = item.factoresAliviantes || '';
      document.getElementById('inputOtros').value = item.otros || '';

      updateIntensityDisplay(item.intensidad !== undefined ? item.intensidad : 5);
      toggleTratamientoFields();
      syncChipsWithInputs();
    }
  } else {
    modalTitle.textContent = "Registrar Nuevo Episodio";
    // Valores predeterminados: fecha y hora actual
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('inputFecha').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('inputHora').value = `${hh}:${min}`;
    
    // Sugerir presentación según la hora
    let pres = 'Matutina';
    const hourNum = now.getHours();
    if (hourNum >= 5 && hourNum < 12) pres = 'Matutina';
    else if (hourNum >= 12 && hourNum < 19) pres = 'Vespertina';
    else if (hourNum >= 19 && hourNum < 24) pres = 'Nocturna';
    else pres = 'Madrugada';
    
    document.getElementById('inputPresentacion').value = pres;
    document.getElementById('inputIntensidad').value = 5;
    document.getElementById('tratamientoNo').checked = true;
    document.getElementById('inputMejoria').value = 'Sin mejoría';
    
    updateIntensityDisplay(5);
    toggleTratamientoFields();
    syncChipsWithInputs();
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRecordModal() {
  const modal = document.getElementById('recordModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  AppState.currentEditingId = null;
}

// Guardar registro (Crear o Actualizar)
function handleSaveRecord(e) {
  e.preventDefault();

  const fecha = document.getElementById('inputFecha').value;
  const hora = document.getElementById('inputHora').value;
  const presentacion = document.getElementById('inputPresentacion').value.trim();
  const caracteristicas = document.getElementById('inputCaracteristicas').value.trim();
  const intensidad = parseInt(document.getElementById('inputIntensidad').value, 10);
  const duracion = document.getElementById('inputDuracion').value.trim();
  const desencadenantes = document.getElementById('inputDesencadenantes').value.trim();
  
  const radSi = document.getElementById('tratamientoSi');
  const tratamiento = radSi.checked ? 'Sí' : 'No';
  const medicamento = radSi.checked ? document.getElementById('inputMedicamento').value.trim() : '';
  const mejoria = document.getElementById('inputMejoria').value.trim() || 'Sin mejoría';
  
  const factoresAliviantes = document.getElementById('inputFactoresAliviantes').value.trim();
  const otros = document.getElementById('inputOtros').value.trim();

  if (!fecha) {
    showToast("Por favor ingresa la fecha del episodio.", "error");
    return;
  }

  const recordData = {
    id: AppState.currentEditingId || Date.now().toString(),
    fecha,
    hora,
    presentacion,
    caracteristicas,
    intensidad,
    duracion,
    desencadenantes,
    tratamiento,
    medicamento,
    mejoria,
    factoresAliviantes,
    otros,
    updatedAt: new Date().toISOString()
  };

  if (AppState.currentEditingId) {
    const idx = AppState.records.findIndex(r => r.id === AppState.currentEditingId);
    if (idx !== -1) {
      AppState.records[idx] = recordData;
      showToast("Episodio actualizado correctamente.");
    }
  } else {
    // Insertar al inicio (orden cronológico inverso por defecto)
    AppState.records.unshift(recordData);
    showToast("Episodio guardado exitosamente.");
  }

  // Ordenar registros por fecha y hora descendente
  AppState.records.sort((a, b) => {
    const dtA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
    const dtB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
    return dtB - dtA;
  });

  persistRecords();
  closeRecordModal();
  renderApp();
}

// Eliminar registro
function deleteRecord(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
    AppState.records = AppState.records.filter(r => r.id !== id);
    persistRecords();
    renderApp();
    showToast("Registro eliminado.");
  }
}

// Modal Perfil de Paciente
function openProfileModal() {
  document.getElementById('profileNombre').value = AppState.profile.nombre || '';
  document.getElementById('profileMedico').value = AppState.profile.medico || '';
  document.getElementById('profileNotas').value = AppState.profile.notas || '';
  document.getElementById('profileModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function handleSaveProfile(e) {
  e.preventDefault();
  AppState.profile.nombre = document.getElementById('profileNombre').value.trim();
  AppState.profile.medico = document.getElementById('profileMedico').value.trim();
  AppState.profile.notas = document.getElementById('profileNotas').value.trim();
  persistProfile();
  closeProfileModal();
  renderProfileHeader();
  showToast("Datos de paciente actualizados.");
}

// Renderizado General
function renderApp() {
  renderProfileHeader();
  renderStats();
  renderRecordsList();
  renderMedicationChips();
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderProfileHeader() {
  const patientDisplay = document.getElementById('patientNameDisplay');
  if (patientDisplay) {
    if (AppState.profile.nombre) {
      patientDisplay.textContent = AppState.profile.nombre;
    } else {
      patientDisplay.textContent = "Sin nombre configurado (toca para editar)";
    }
  }
}

// Renderizado de Estadísticas Resumen
function renderStats() {
  const countEl = document.getElementById('statTotalCount');
  const avgEl = document.getElementById('statAvgIntensity');
  const triggerEl = document.getElementById('statTopTrigger');
  const monthEl = document.getElementById('statThisMonth');

  const total = AppState.records.length;
  if (countEl) countEl.textContent = total;

  if (total === 0) {
    if (avgEl) avgEl.textContent = "-";
    if (triggerEl) triggerEl.textContent = "-";
    if (monthEl) monthEl.textContent = "0";
    return;
  }

  // Promedio intensidad
  const sumInt = AppState.records.reduce((acc, r) => acc + (Number(r.intensidad) || 0), 0);
  const avg = (sumInt / total).toFixed(1);
  if (avgEl) avgEl.textContent = `${avg} / 10`;

  // Episodios este mes
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthCount = AppState.records.filter(r => r.fecha && r.fecha.startsWith(currentMonthStr)).length;
  if (monthEl) monthEl.textContent = monthCount;

  // Desencadenante más frecuente
  const triggersMap = {};
  AppState.records.forEach(r => {
    if (r.desencadenantes) {
      const parts = r.desencadenantes.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(t => {
        triggersMap[t] = (triggersMap[t] || 0) + 1;
      });
    }
  });

  let topTrigger = "-";
  let maxCount = 0;
  for (const [key, cnt] of Object.entries(triggersMap)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      topTrigger = key;
    }
  }
  if (triggerEl) triggerEl.textContent = topTrigger;
}

// Renderizado de Lista de Registros
function renderRecordsList() {
  const container = document.getElementById('recordsList');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  // Filtrado
  let filtered = [...AppState.records];

  // Filtro por píldora activa
  const now = new Date();
  if (AppState.activeFilter === 'month') {
    const curMonth = now.toISOString().slice(0, 7);
    filtered = filtered.filter(r => r.fecha && r.fecha.startsWith(curMonth));
  } else if (AppState.activeFilter === 'week') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    filtered = filtered.filter(r => new Date(r.fecha) >= sevenDaysAgo);
  } else if (AppState.activeFilter === 'severe') {
    filtered = filtered.filter(r => Number(r.intensidad) >= 7);
  }

  // Filtro por texto de búsqueda
  if (AppState.searchQuery) {
    const q = AppState.searchQuery;
    filtered = filtered.filter(r => 
      (r.caracteristicas && r.caracteristicas.toLowerCase().includes(q)) ||
      (r.desencadenantes && r.desencadenantes.toLowerCase().includes(q)) ||
      (r.medicamento && r.medicamento.toLowerCase().includes(q)) ||
      (r.factoresAliviantes && r.factoresAliviantes.toLowerCase().includes(q)) ||
      (r.otros && r.otros.toLowerCase().includes(q)) ||
      (r.fecha && r.fecha.includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(item => {
    // Formato de fecha legible
    let dateStr = item.fecha || 'Sin fecha';
    if (item.fecha) {
      const parts = item.fecha.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        dateStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    }

    // Color de intensidad
    const intens = Number(item.intensidad) || 0;
    let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
    if (intens >= 1 && intens <= 3) badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    else if (intens >= 4 && intens <= 6) badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    else if (intens >= 7 && intens <= 8) badgeBg = 'bg-orange-100 text-orange-800 border-orange-300';
    else if (intens >= 9) badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';

    const tomoTratamiento = item.tratamiento === 'Sí' || item.tratamiento === 'Si';

    return `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all hover:shadow-md">
        <!-- Header de la tarjeta -->
        <div class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-800 text-base">${dateStr}</span>
              ${item.hora ? `<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">${item.hora}</span>` : ''}
              ${item.presentacion ? `<span class="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-medium">${item.presentacion}</span>` : ''}
            </div>
            ${item.duracion ? `<p class="text-xs text-slate-500 mt-0.5">⏱ Duración: <strong class="text-slate-700">${item.duracion}</strong></p>` : ''}
          </div>
          <div class="flex flex-col items-end">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${badgeBg}">
              EVA ${intens}/10
            </span>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="py-3 space-y-2 text-xs md:text-sm text-slate-700">
          ${item.caracteristicas ? `
            <div>
              <span class="font-semibold text-slate-900 block text-xs uppercase tracking-wider text-slate-500 mb-0.5">Características y Localización:</span>
              <p class="bg-slate-50 p-2 rounded-lg border border-slate-100">${escapeHtml(item.caracteristicas)}</p>
            </div>
          ` : ''}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            ${item.desencadenantes ? `
              <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span class="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Desencadenantes:</span>
                <p class="text-slate-700">${escapeHtml(item.desencadenantes)}</p>
              </div>
            ` : ''}

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span class="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Tratamiento:</span>
              <p class="text-slate-700">
                ${tomoTratamiento ? `
                  <span class="text-emerald-700 font-semibold">Tomó medicación</span> 
                  ${item.medicamento ? `(${escapeHtml(item.medicamento)})` : ''}
                  ${item.mejoria ? `<br><span class="text-xs text-slate-600">Mejoría: <strong>${escapeHtml(item.mejoria)}</strong></span>` : ''}
                ` : `<span class="text-slate-500">No tomó medicación</span>`}
              </p>
            </div>
          </div>

          ${(item.factoresAliviantes || item.otros) ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              ${item.factoresAliviantes ? `
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Factores Aliviantes:</span>
                  <p class="text-slate-700">${escapeHtml(item.factoresAliviantes)}</p>
                </div>
              ` : ''}
              ${item.otros ? `
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span class="font-semibold text-slate-500 block text-xs uppercase tracking-wider mb-0.5">Otros Síntomas:</span>
                  <p class="text-slate-700">${escapeHtml(item.otros)}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Acciones: Editar / Eliminar -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button onclick="openRecordModal('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar
          </button>
          <button onclick="deleteRecord('${item.id}')" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Eliminar
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Manejar exportación a PDF
function handleExportPDF() {
  if (AppState.records.length === 0) {
    if (confirm("No tienes registros guardados aún. ¿Deseas exportar una hoja en blanco con el formato para imprimir o cargar ejemplos de prueba primero?")) {
      PDFExporter.exportToPDF([], AppState.profile, { fillEmptyRows: true });
    }
    return;
  }

  showToast("Generando PDF...", "info");
  setTimeout(() => {
    try {
      const fileName = PDFExporter.exportToPDF(AppState.records, AppState.profile);
      showToast(`PDF descargado: ${fileName}`);
    } catch (e) {
      console.error("Error al exportar PDF:", e);
      showToast("Hubo un error al generar el PDF.", "error");
    }
  }, 100);
}

// Manejar exportación a CSV
function handleExportCSV() {
  if (AppState.records.length === 0) {
    showToast("No hay registros para exportar.", "error");
    return;
  }
  PDFExporter.exportToCSV(AppState.records, AppState.profile);
  showToast("Archivo CSV descargado.");
}

// Backup JSON
function handleBackupJSON() {
  const backupData = {
    app: "DiarioDeSintomas",
    version: "1.2",
    exportedAt: new Date().toISOString(),
    profile: AppState.profile,
    medications: AppState.medications,
    records: AppState.records
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Copia_Seguridad_DiarioSalud_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia de seguridad descargada.");
}

// Restore JSON
function handleRestoreJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed.records)) {
        if (confirm(`Se encontraron ${parsed.records.length} registros en la copia de seguridad. ¿Deseas importarlos?`)) {
          AppState.records = parsed.records;
          if (parsed.profile) AppState.profile = parsed.profile;
          if (Array.isArray(parsed.medications) && parsed.medications.length > 0) {
            AppState.medications = parsed.medications;
            persistMedications();
          }
          persistRecords();
          persistProfile();
          renderApp();
          showToast("¡Datos y medicamentos restaurados con éxito!");
        }
      } else {
        alert("El archivo no tiene el formato esperado.");
      }
    } catch (err) {
      alert("Error al leer el archivo JSON: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Cargar datos de prueba
function loadDemoData() {
  const demoRecords = [
    {
      id: "demo-1",
      fecha: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
      hora: "08:30",
      presentacion: "Matutina",
      caracteristicas: "Dolor pulsátil intenso en hemicránea izquierda, retroocular y temporal.",
      intensidad: 8,
      duracion: "6 horas",
      desencadenantes: "Ciclo menstrual, Falta de sueño (dormí 4 horas)",
      tratamiento: "Sí",
      medicamento: "Zolmitriptán 2.5mg + Paracetamol 1g",
      mejoria: "Mejoría total",
      factoresAliviantes: "Habitación oscura, reposo en cama, paños de hielo",
      otros: "Náuseas intensas, fotofobia y fonofobia marcada, luces parpadeantes previas (aura)"
    },
    {
      id: "demo-2",
      fecha: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
      hora: "16:45",
      presentacion: "Vespertina",
      caracteristicas: "Tipo tensión en banda frontal, opresivo con cervicalgia y tensión en cuello.",
      intensidad: 5,
      duracion: "3 horas",
      desencadenantes: "Estrés laboral prolongado frente al monitor, salté el almuerzo (ayuno)",
      tratamiento: "Sí",
      medicamento: "Ibuprofeno 600mg",
      mejoria: "Mejoría parcial",
      factoresAliviantes: "Masaje en trapecio y cuello, hidratación con agua fría",
      otros: "Pesadez ocular, fatiga"
    },
    {
      id: "demo-3",
      fecha: new Date().toISOString().slice(0, 10),
      hora: "21:15",
      presentacion: "Nocturna",
      caracteristicas: "Dolor sordo occipital con irradiación cervical.",
      intensidad: 4,
      duracion: "2 horas",
      desencadenantes: "Postura frente a la pantalla, cambios bruscos de temperatura",
      tratamiento: "No",
      medicamento: "",
      mejoria: "No aplica",
      factoresAliviantes: "Ducha caliente y descanso en silencio",
      otros: "Contractura muscular"
    }
  ];

  AppState.records = demoRecords;
  if (!AppState.profile.nombre) {
    AppState.profile.nombre = "María González";
    AppState.profile.medico = "Dr. Alejandro Ramos (Neurología)";
  }
  persistRecords();
  persistProfile();
  renderApp();
  showToast("¡Ejemplos médicos cargados correctamente!");
}

function showFirstTimeWelcome() {
  // Nada intrusivo, la pantalla vacía ya muestra un botón amigable para registrar o cargar demo
}

// Utilidad Toast Notification
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-white text-xs md:text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none opacity-0';
    document.body.appendChild(toast);
  }

  if (type === 'error') {
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-white text-xs md:text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none bg-rose-600 opacity-100 translate-y-0';
  } else if (type === 'info') {
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-white text-xs md:text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none bg-sky-600 opacity-100 translate-y-0';
  } else {
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-white text-xs md:text-sm font-medium shadow-lg transition-all duration-300 pointer-events-none bg-slate-900 opacity-100 translate-y-0';
  }

  toast.textContent = message;

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
  }, 2800);
}

// Escapar HTML para evitar XSS
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Exponer funciones globales para los onclick de los botones
window.openRecordModal = openRecordModal;
window.deleteRecord = deleteRecord;
window.addCustomMedication = addCustomMedication;
window.removeCustomMedication = removeCustomMedication;
