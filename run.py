#!/usr/bin/env python3
"""
Lanzador local para Diario de Síntomas - Bitácora de Salud
Inicia un servidor local y abre la aplicación en el navegador.
"""

import http.server
import socketserver
import webbrowser
import socket
import os
import sys

PORT = 8000

def get_local_ip():
    """Obtiene la IP local de la máquina en la red Wi-Fi para acceder desde el celular."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Deshabilitar cache para desarrollo local rápido
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    local_ip = get_local_ip()
    url_local = f"http://localhost:{PORT}/index.html"
    url_mobile = f"http://{local_ip}:{PORT}/index.html"

    print("=" * 65)
    print("  DIARIO DE SINTOMAS - BITACORA DE SALUD (PWA)")
    print("=" * 65)
    print(f"\n[+] Servidor iniciado correctamente en el puerto {PORT}")
    print(f"\n💻 En tu computadora: {url_local}")
    print(f"📱 En tu celular (misma red Wi-Fi): {url_mobile}")
    print("\n💡 Para usar como App Móvil:")
    print("   1. Abre el enlace del celular en Chrome (Android) o Safari (iPhone).")
    print("   2. Toca 'Compartir' o los tres puntos y selecciona 'Agregar a la pantalla de inicio'.")
    print("   3. ¡Listo! Funcionará como una App independiente, incluso sin internet.\n")
    print("Presiona Ctrl + C en esta consola para detener el servidor.\n" + "=" * 65)

    webbrowser.open(url_local)

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido. ¡Hasta pronto!")
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            print(f"\nEl puerto {PORT} ya está en uso. Intentando en http://localhost:{PORT + 1}/index.html ...")
            with socketserver.TCPServer(("", PORT + 1), Handler) as httpd:
                webbrowser.open(f"http://localhost:{PORT + 1}/index.html")
                httpd.serve_forever()
        else:
            raise

if __name__ == "__main__":
    main()
