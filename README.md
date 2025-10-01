# FleetCore Suite (MERN)

## 📂 Estructura del Proyecto
```
fleetcore/
│── back/    # Backend (Node.js + Express + MongoDB)
│── front/   # Frontend (React + Vite + TailwindCSS)
│── .gitignore
│── README.md
```

---

## 🚀 Requisitos
- Node.js LTS (v20.x)
- Git
- MongoDB (local o en Atlas)

---

## ⚙️ Backend (`/back`)
API REST en Node.js + Express + Mongoose.

### Instalación
```bash
cd back
npm i
cp .env.example .env
npm run dev
```

### Variables de entorno (`.env`)
```env
MONGO_URI=mongodb://localhost:27017/fleetcore_dev
PORT=5000
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

### Endpoints iniciales
- `GET /api/health` → Prueba de vida de la API  
- `GET /api/v1/vehicles` → Listado de vehículos (mock/demo)

---

## 💻 Frontend (`/front`)
Aplicación React con Vite + TailwindCSS.

### Instalación
```bash
cd front
npm i
npm run dev
```

### Variables de entorno (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Rutas iniciales
- `/` → Dashboard con menú lateral y barra superior.  
- Sidebar con menús: **Dashboard, Sucursales, Vehículos, Tareas, Gestión, Configuración**.

---

## 🔗 GitHub
### Crear repositorio y hacer el primer push
```bash
git init
git branch -M main
git remote add origin git@github.com:TU_USUARIO/fleetcore.git
git add .
git commit -m "chore: bootstrap FleetCore (back/front)"
git push -u origin main
```

### En otro PC (clonar)
```bash
git clone git@github.com:TU_USUARIO/fleetcore.git
cd fleetcore/back && npm i && cp .env.example .env && npm run dev
cd ../front && npm i && npm run dev
```

---

## 🌱 Flujo de trabajo (Git Flow recomendado)
- `main` → estable (producción).
- `develop` → integración.
- `feature/<modulo>` → trabajo de nuevas funciones.

Ejemplo:
```bash
git checkout -b feature/ot-asignacion
# ...cambios...
git commit -m "feat(ot): asignación de mecánicos"
git push -u origin feature/ot-asignacion
```

---

## ✅ Notas
- **Nunca** subas `.env` a GitHub → usa `.env.example`.
- En Windows: `git config --global core.autocrlf true` para evitar problemas de saltos de línea.
- Para usar en dos PCs, configura tus **llaves SSH** en GitHub (una por PC).
- Recomendado usar **MongoDB Atlas** si necesitas acceso desde distintas redes (casa/oficina).

---

📌 Este README es tu **guía rápida**: resume instalación, arranque y flujo de trabajo del proyecto.
