# Diario de Síntomas - Bitácora de Salud

Aplicación web móvil (PWA) diseñada para registrar de forma rápida y sencilla episodios de dolor de cabeza, migraña y cefaleas, con capacidad de **exportar en PDF la ficha médica idéntica a la solicitada por neurólogos y especialistas**.

---

## 📋 Columnas de la Ficha Médica Incluidas

La aplicación replica exactamente cada columna y anotación de la ficha médica:

1. **Fecha y hora:** Registro cronológico con identificación de frecuencia y presentación (*Matutina, Vespertina, Nocturna, Madrugada*).
2. **Características del dolor y localización:** Identificación de episodios típicos (*tipo tensión, migrañoso pulsátil, cervicalgia, punzante, etc.*) y su localización (*hemicránea izquierda/derecha, frontal, ocular, occipital, holocraneana*).
3. **Intensidad (0-10):** Escala EVA con selector visual interactivo, colores y expresiones.
4. **Duración:** Selector rápido de intervalos (*< 1h, 1-2h, 2-4h, 4-8h, 24h, varios días*).
5. **Factores desencadenantes:** Ciclo menstrual, sueño/insomnio, exceso de sueño, factores psicológicos (estrés), hormonales (ACO), ejercicio físico, ayuno prolongado, alimentación (café, chocolate, alcohol), ambientales y ruido.
6. **Tratamiento (Sí / No):** Medicamento administrado y dosis (*Ibuprofeno, Paracetamol, Triptanes, etc.*).
7. **Mejoría con el tratamiento:** *Mejoría total, Mejoría parcial, Sin mejoría, Empeoró*.
8. **Factores aliviantes:** Reposo en cama, habitación oscura, compresas de hielo, silencio, sueño, ducha caliente, hidratación.
9. **Otros síntomas:** Náuseas, vómitos, fotofobia, fonofobia, aura visual, mareos/vértigo.

---

## 🚀 Cómo Iniciar la Aplicación en tu Computadora

Solo requieres tener Python instalado:

1. Abre una terminal en esta carpeta (`d:\Proyectos\bitacoraSalud`) o haz doble clic en `run.py`.
2. Ejecuta:
   ```bash
   python run.py
   ```
3. Se abrirá automáticamente tu navegador en `http://localhost:8000/index.html`.

---

## 📱 Cómo Usarla e Instalarla en tu Celular (Android / iPhone)

Tienes dos opciones muy sencillas:

### Opción 1: En tu red Wi-Fi local (Inmediato)
1. Con la computadora corriendo `python run.py`, verás en la consola una dirección similar a:
   `http://192.168.1.XX:8000/index.html`
2. Abre esa dirección en el navegador de tu celular (Google Chrome en Android o Safari en iPhone).
3. Para instalarla como App:
   - **En Android (Chrome):** Toca los tres puntos `⋮` arriba a la derecha y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
   - **En iPhone (Safari):** Toca el botón de Compartir (icono de un cuadro con flecha hacia arriba) y elige **"Agregar al inicio"**.
4. ¡Listo! Tendrás el icono de la app en la pantalla de inicio y funcionará a pantalla completa e incluso sin internet.

### Opción 2: Subir a Internet (Gratis y accesible desde cualquier lugar)
Puedes subir estos archivos a **GitHub Pages**, **Vercel** o **Netlify** en 2 minutos (es 100% estático, no requiere servidor de base de datos) y tendrás un enlace `https://tu-nombre.github.io/diario-salud` para abrirlo donde quieras.

---

## 📄 Exportación a PDF

- Haz clic en el botón **"PDF"** o **"Exportar PDF Ficha"**.
- El sistema generará un documento en formato apaisado (Landscape A4) con la tabla de 9 columnas, el encabezado oficial **DIARIO DE SINTOMAS**, los datos del paciente y las tres notas al pie originales.
- Puedes imprimirlo directamente o enviárselo por WhatsApp o correo a tu médico.

---

## 🔒 Privacidad y Respaldo de Datos

- **100% Privado:** Todos tus registros se guardan en el almacenamiento local de tu dispositivo (`LocalStorage`). Ningún dato de salud se envía a servidores externos.
- **Copia de Seguridad:** Puedes hacer clic en **"Copia"** para descargar un archivo `.json` con todos tus registros y restaurarlo en cualquier otro dispositivo con **"Restaurar"**.
- **Excel / CSV:** También puedes exportar toda la bitácora a formato CSV compatible con Microsoft Excel.
