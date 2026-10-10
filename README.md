# WORTH

Experiencia web interactiva sobre el valor-signo de los objetos (inspirada en Jean Baudrillard). Todo es simulado en el frontend: no hay backend, login ni pagos reales.

## Cómo ejecutarla

Abrí `index.html` en el navegador (doble clic). Necesita conexión a internet para cargar Tailwind CSS y la tipografía Inter Tight desde CDN.

## Estructura

```
index.html        Estructura de todas las etapas
css/styles.css    Estilos (tema oscuro, acento naranja), animaciones y responsive
js/products.js    Datos de los objetos  ← productos, precios (ARS) y valores
js/art.js         Ilustraciones provisorias (se usan si falta la foto)
js/app.js         Lógica: grilla, ficha, selección, indicadores, confirmación
img/              Fotos de los objetos (ver img/LEEME.txt)
```

## Imágenes

Cada producto apunta a un archivo en `img/` (por ejemplo `img/rolex-submariner.png`). Si el archivo no existe, se muestra la ilustración provisoria. Conviene usar PNG/WebP con fondo transparente.

## Cómo se calcula el perfil

- **Perfil de la selección**: para cada indicador, el promedio de los objetos seleccionados, redondeado y limitado entre 1 y 5. Sin objetos, todo vale 1.
- **Ficha del objeto**: las barras muestran el valor del objeto; la columna "En tu selección" anticipa si cada indicador de tu selección sube, baja o queda igual si lo agregás.
- **Tu selección**: después de cada cambio, cada indicador muestra si subió, bajó o quedó igual.
- **Confirmación y pantalla final**: comparan la selección con tu perfil actual (la última compra confirmada; al principio, todo en 1). La frase final nombra el indicador que más cambió: puede decir "ha aumentado" o "ha disminuido".
