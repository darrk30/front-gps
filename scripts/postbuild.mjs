// Hostinger sirve este sitio con Nginx puro, que no lee .htaccess (eso es
// exclusivo de Apache) — sin config de servidor propia no hay forma de hacer
// un rewrite real de "cualquier ruta -> index.html" para que React Router
// funcione en rutas como /mapa o /perfil al recargar. El truco universal para
// hosting estático sin ese control (GitHub Pages, etc.): copiar index.html
// como 404.html, así cualquier ruta desconocida sirve igual la SPA, que
// arranca y el router ya resuelve la pantalla correcta según la URL.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
