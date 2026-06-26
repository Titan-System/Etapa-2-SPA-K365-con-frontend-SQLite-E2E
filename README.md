# 🛒 K365 - Etapa 2: SPA + Base de Datos + Pruebas E2E

**K365** es una aplicación web **Single Page Application (SPA)** desarrollada para la segunda etapa del TP de **Desarrollo de Aplicación Web SPA**.

La aplicación está inspirada en un kiosco online. El usuario puede visualizar productos, buscar por nombre, filtrar por categoría, marcar favoritos, agregar productos al carrito, modificar cantidades, eliminar productos y confirmar una compra simulada.

En esta etapa se incorporó **frontend**, **persistencia con SQLite**, **consumo de APIs REST** y **pruebas E2E con Playwright**.

---

## 📌 Objetivo de la etapa

El objetivo de esta etapa fue construir un frontend SPA que consuma las APIs del backend y agregar persistencia con base de datos.

La aplicación permite:

- visualizar productos disponibles;
- buscar productos desde la barra superior;
- filtrar por categorías;
- marcar y desmarcar productos favoritos;
- agregar productos al carrito;
- incrementar o decrementar cantidades;
- eliminar productos del carrito;
- mostrar subtotal y puntos ganados;
- confirmar una compra simulada;
- persistir productos, favoritos, carrito y órdenes en SQLite;
- validar el flujo completo mediante pruebas E2E.

---

## 🧱 Arquitectura de la SPA

La arquitectura implementada sigue un flujo simple: el usuario interactúa con el frontend, el frontend realiza peticiones `fetch` a la API Flask, el backend procesa la solicitud, consulta o actualiza SQLite y devuelve una respuesta JSON para actualizar la interfaz.

![Arquitectura y flujo de la SPA K365](arquitectura-y-flujo-spa-k365.png)

El frontend no accede directamente a la base de datos. Toda modificación de productos, favoritos, carrito u órdenes pasa primero por el backend Flask.

---

## 📂 Estructura del proyecto

```txt
k365-etapa2-spa/
├── app/
│   ├── data/
│   │   └── products_seed.py
│   ├── repositories/
│   │   └── products_repository.py
│   ├── routes/
│   │   ├── cart.py
│   │   ├── health.py
│   │   └── products.py
│   ├── services/
│   │   └── cart_service.py
│   ├── __init__.py
│   └── db.py
│
├── database/
│   └── k365.sqlite
│
├── docs/
│   └── openapi.yaml
│
├── frontend/
│   ├── assets/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── tests/
│   └── e2e/
│       └── k365.spec.js
│
├── README.md
├── requirements.txt
├── package.json
├── playwright.config.js
├── render.yaml
├── Procfile
└── run.py
```

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnologías |
| --- | --- |
| Frontend | HTML, CSS y JavaScript vanilla |
| Backend/API | Python + Flask |
| Base de datos | SQLite |
| Documentación API | Swagger / OpenAPI |
| Pruebas E2E | Playwright |
| Deploy | Render |

---

## ⚙️ Funcionamiento general

Al ingresar a la aplicación, Flask sirve el archivo principal del frontend desde `frontend/index.html`.

La interfaz se renderiza con HTML, CSS y JavaScript. La lógica dinámica está concentrada principalmente en `frontend/app.js`, donde se cargan los productos, se aplican filtros, se manejan favoritos, se actualiza el carrito y se envían solicitudes al backend mediante `fetch`.

Cuando el usuario agrega un producto al carrito, el frontend envía una petición a la API. El backend valida el producto, actualiza la tabla correspondiente en SQLite y devuelve el carrito actualizado en formato JSON. Luego el frontend vuelve a renderizar la vista con el nuevo estado.

El mismo criterio se aplica para favoritos, eliminación de productos, modificación de cantidades y confirmación de compra.

---

## 🗄️ Base de datos

Se utilizó **SQLite** para persistir los datos de la aplicación.

La base se genera automáticamente al ejecutar el proyecto y queda ubicada en:

```txt
database/k365.sqlite
```

Tablas principales:

| Tabla | Descripción |
| --- | --- |
| `products` | Guarda productos disponibles, stock, imagen, categoría y favorito |
| `cart_items` | Guarda los productos agregados al carrito y sus cantidades |
| `orders` | Guarda las compras confirmadas |
| `order_items` | Guarda el detalle de productos de cada compra |

Los productos iniciales se cargan desde:

```txt
app/data/products_seed.py
```

---

## 🔗 Endpoints consumidos

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products/{id}` | Devuelve un producto por ID |
| PATCH | `/api/products/{id}/favorite` | Marca o desmarca un producto como favorito |
| GET | `/api/cart` | Devuelve el carrito actual |
| POST | `/api/cart/items` | Agrega un producto o incrementa su cantidad |
| DELETE | `/api/cart/items/{id}` | Elimina un producto del carrito |
| DELETE | `/api/cart` | Vacía el carrito completo |
| GET | `/api/cart/total` | Devuelve el total actual del carrito |
| POST | `/api/cart/checkout` | Confirma la compra, registra la orden y vacía el carrito |

Las llamadas a estos endpoints se realizan desde:

```txt
frontend/app.js
```

---

## 💻 Ejecución local

Clonar el repositorio y entrar a la carpeta:

```bash
git clone URL_DEL_REPOSITORIO
cd k365-etapa2-spa
```

Crear entorno virtual:

```bash
python -m venv .venv
```

Activar entorno virtual en Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias de Python:

```bash
pip install -r requirements.txt
```

Ejecutar la aplicación:

```bash
python run.py
```

Abrir en el navegador:

```txt
http://127.0.0.1:5000
```

Documentación Swagger:

```txt
http://127.0.0.1:5000/docs
```

API de salud:

```txt
http://127.0.0.1:5000/api/health
```

---

## 🧪 Pruebas E2E

Las pruebas E2E se realizaron con **Playwright**.

Instalar dependencias de Node:

```bash
npm install
```

Instalar navegadores de Playwright:

```bash
npx playwright install
```

Ejecutar pruebas:

```bash
npm run test:e2e
```

Las pruebas se encuentran en:

```txt
tests/e2e/k365.spec.js
```

Validan los siguientes puntos:

- carga del catálogo desde la API;
- agregado de productos al carrito;
- persistencia del carrito al recargar la página;
- eliminación de productos;
- marcado de favoritos persistido en SQLite;
- flujo completo de compra con checkout.

---

## 🚀 Deploy

El proyecto está preparado para desplegarse en **Render**.

Configuración sugerida:

```txt
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app
```

También se incluye el archivo:

```txt
render.yaml
```

---

## 🧩 Dificultades encontradas

Durante el desarrollo se resolvieron varios puntos importantes:

- adaptar la persistencia de memoria a SQLite;
- mantener sincronizado el carrito entre frontend, backend y base de datos;
- guardar favoritos de forma persistente en la tabla `products`;
- actualizar la interfaz después de cada respuesta JSON del backend;
- validar con Playwright que el flujo completo funcione correctamente;
- preparar la estructura para deploy en Render.

---

## ✅ Criterios cubiertos

| Criterio | Cumplimiento |
| --- | --- |
| Frontend SPA | Interfaz HTML/CSS/JS con búsqueda, filtros, favoritos y carrito |
| Consumo de APIs | Comunicación con backend Flask mediante `fetch` |
| Base de datos | Persistencia con SQLite |
| Pruebas E2E | Playwright valida catálogo, carrito, favoritos y checkout |
| Deploy | Proyecto preparado para Render |
| Documentación | README + Swagger/OpenAPI |
| Creatividad | Interfaz inspirada en K365 con productos reales de kiosco |

---

