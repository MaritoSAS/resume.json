# Carta de presentación · Mariana Raquel Mamani

Currículum en [JSON Resume](https://jsonresume.org/) (schema v1.0.0) y página estática que lo muestra. Grupo Marito S.A.S. es la empresa, Magnami ([magnami.ar](https://magnami.ar)) es su identidad institucional y Moxotoro es un proyecto de turismo de ese ecosistema.

La página está en español, no usa fotos y se publica desde la raíz del repositorio.

**Página:** [https://maritosas.github.io/resume.json/](https://maritosas.github.io/resume.json/)

Esa dirección queda activa después de fusionar este cambio en `main` y de encender GitHub Pages:

1. En el repositorio, abrir **Settings → Pages**.
2. En **Build and deployment**, elegir **Deploy from a branch**.
3. Branch: **main**. Carpeta: **/ (root)**. Guardar.

Hasta ese momento el enlace responde 404. La vista previa local no depende de Pages.

## Cómo actualizar el JSON

El contenido visible sale de [`resume.json`](resume.json). La página lo lee al cargar: no hay que recompilar ni tocar el HTML para cambiar un texto, una fecha o un proyecto.

1. Editar `resume.json`.
2. Mantener `"$schema"` apuntando al schema v1.0.0.
3. Fechas en `YYYY`, `YYYY-MM` o `YYYY-MM-DD`. Si el dato no existe, omitir el campo. Si un rol sigue vigente, omitir `endDate`. No usar `"Presente"`.
4. No completar con clientes, cargos, métricas ni fechas que no estén confirmados.
5. Publicar el cambio en `main`.

Para verlo en la computadora, desde la raíz del repositorio:

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080/`. Abrir `index.html` con doble clic no alcanza: el navegador bloquea la lectura de `resume.json` en `file://`.

## Tres propuestas visuales

La página de la raíz sigue en pie. Estas carpetas son mockups de marca personal, con el mismo `resume.json` y otra identidad (ninguna repite el fondo oscuro con dorado de Magnami):

| Propuesta | Carpeta |
| --- | --- |
| Editorial clara | [mockups/editorial/](mockups/editorial/) |
| Andino contemporáneo | [mockups/andino/](mockups/andino/) |
| Tech minimalista | [mockups/tech/](mockups/tech/) |

Cada `index.html` es autocontenido y lee `../../resume.json`. Con el servidor local: `http://localhost:8080/mockups/editorial/` (y lo mismo para `andino` y `tech`).

## Archivos

| Archivo | Uso |
| --- | --- |
| `resume.json` | Datos del currículum |
| `index.html` | Página |
| `styles.css` | Estilos |
| `main.js` | Lectura del JSON y comportamiento |
| `favicon.svg` | Ícono tipográfico, sin foto |
