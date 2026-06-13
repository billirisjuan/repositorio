# EBikesCenter — Guía del propietario

Esta guía está escrita para alguien que **no sabe programar**. Sigue los pasos exactamente como se indican y todo funcionará.

---

## 1. Ver la web en tu ordenador (antes de subirla)

1. Abre la carpeta del proyecto en tu ordenador.
2. Haz **doble clic** en el archivo `index.html`.
3. Se abre en tu navegador. Así la ves sin subir nada.

> Si algo no aparece bien, prueba a abrir con **Google Chrome** o **Microsoft Edge** en vez del Explorador de archivos.

---

## 2. Subir la web a Hostinger

1. Entra en tu panel de **Hostinger** → **Administrador de archivos**.
2. Navega hasta la carpeta `public_html` (o la que te diga Hostinger para tu dominio).
3. **Sube toda la carpeta del proyecto** tal cual: arrastra o usa el botón "Subir archivos".
   Debes subir estos archivos y carpetas:
   - `index.html`
   - `styles.css`
   - `main.js`
   - `.htaccess`
   - `README.md`
   - carpeta `lib/` (con `manifest.js`, `gsap.min.js`, `ScrollTrigger.min.js`)
   - carpeta `assets/` (con las imágenes)
4. Espera a que termine la subida.
5. Abre tu dominio en el navegador. ¡Ya está en línea!

> **¿No se actualiza?** Pulsa `Ctrl + F5` (o `Cmd + Shift + R` en Mac) para forzar la recarga sin caché.

---

## 3. Cambiar textos, teléfono, dirección, etc.

**Todos los datos editables están en un solo archivo:** `lib/manifest.js`

### Cómo editarlo:
1. Abre `lib/manifest.js` con el **Bloc de notas** (Windows) o **TextEdit** (Mac).
2. Busca la sección que quieres cambiar (están comentadas con `── MARCA ──`, `── MODELOS ──`, etc.).
3. Cambia el texto **entre las comillas**. Por ejemplo:
   - `phone: '910 55 66 77'` → cámbialo por tu número real
   - `address: 'Calle Gran Vía 45, Madrid'` → pon tu dirección real
4. Guarda el archivo (`Ctrl + S`).
5. **Importante:** no borres las comas ni las comillas. Solo cambia lo que hay dentro de las comillas (`'...'`).

### Cambiar el número de WhatsApp:
Hay **dos sitios** donde aparece el número de WhatsApp. Cámbialos los dos:
1. En `lib/manifest.js`, línea con `whatsapp:` — pon el número con formato `+34XXXXXXXXX`
2. En `index.html` — busca (`Ctrl + F`) todas las apariciones de `34910556677` y sustitúyelas por tu número (sin el `+`).

---

## 4. Cambiar las fotos

Las fotos de la web van en la carpeta `assets/img/`.

1. Prepara tus fotos. Recomendado: formato **WebP** o **JPG**, tamaño máximo **800 KB** por foto.
2. Ponles **exactamente el mismo nombre** que el archivo que quieres sustituir. Por ejemplo, para cambiar la foto del hero, la nueva foto debe llamarse `hero-bg.webp`.
3. Copia la nueva foto en `assets/img/` y reemplaza la anterior.

### Nombres de los archivos de imagen:
| Archivo | Dónde aparece |
|---|---|
| `hero-bg.webp` | Foto grande de fondo en la portada |
| `tienda-01.webp` | Collage sección "La Tienda" (imagen 1) |
| `tienda-02.webp` | Collage sección "La Tienda" (imagen 2) |
| `tienda-03.webp` | Collage sección "La Tienda" (imagen 3) |
| `flotas-bg.webp` | Foto de fondo sección "Flotas & Empresas" |
| `gallery-01.webp` … `gallery-16.webp` | Galería de fotos (carrusel triple) |
| `og-image.webp` | Imagen que aparece al compartir en redes sociales |

---

## 5. Cambiar los modelos de bicicletas

En `lib/manifest.js`, busca la sección `bikes: [`. Cada bici es un bloque `{ ... }` separado por coma.

Para cambiar el nombre de una bici:
```
name: 'Urban Pro',   ← cambia esto
```

Para cambiar el precio:
```
price: '2.490 €',   ← cambia esto
```

Para cambiar la descripción:
```
description: 'Texto de la descripción...',  ← cambia esto
```

---

## 6. Cambiar el horario de servicios

En `lib/manifest.js`, busca la sección `services: [`. Cambia los textos de `days`, `name` y `description` de cada servicio.

---

## 7. Si algo no se actualiza después de cambiar archivos

Cuando subes archivos nuevos a Hostinger, el navegador a veces sigue mostrando la versión vieja. Para forzar la actualización:

1. **Ctrl + F5** (o **Cmd + Shift + R** en Mac) en el navegador.
2. Si sigue igual: abre el archivo `index.html` con el Bloc de notas, busca las líneas que acaban en `?v=20260613` y cambia la fecha por hoy (por ejemplo `?v=20260620`). Guarda y vuelve a subir el `index.html`.

---

## 8. Las librerías GSAP (animaciones)

La carpeta `lib/` debe contener:
- `manifest.js` ✅ (ya está incluido)
- `gsap.min.js` ← **descarga gratis** desde https://gsap.com/community/files/file/2-gsap-3-minified/
- `ScrollTrigger.min.js` ← incluido en el mismo paquete de GSAP

Si no tienes estas librerías, la web sigue funcionando (sin animaciones de scroll avanzadas). Las animaciones de entrada y el carrusel horizontal de bicis seguirán funcionando con CSS puro.

---

## 9. Contacto técnico

Si tienes dudas sobre la web, contacta con quien te la desarrolló.

Para cambios básicos (textos, fotos, números de teléfono), esta guía cubre todo lo que necesitas.

---

*EBikesCenter · web estática · sin servidor · sin npm · compatible con Hostinger*
