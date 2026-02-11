# LifeOS - Personal Life Management System

<div align="center">

![LifeOS Banner](https://img.shields.io/badge/LifeOS-AI%20Powered-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-6.0-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Un asistente personal inteligente con IA para gestionar finanzas, tareas, proyectos y diario personal.**

[Características](#características) • [Instalación](#instalación) • [Uso](#uso) • [Arquitectura](#arquitectura)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [API y Tools](#api-y-tools)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## ✨ Características

### 🤖 Asistente IA Integrado
- **OpenRouter (Recomendado)**: Acceso a 400+ modelos IA de todos los proveedores principales
- **Multi-proveedor**: Alternativamente, soporte directo para Groq, OpenAI, Anthropic, Together AI
- **Modelos dinámicos**: Actualización automática de modelos disponibles desde la API de OpenRouter
- **Búsqueda de modelos**: Filtrado inteligente entre cientos de modelos (Claude, GPT, Gemini, Llama, etc.)
- **Ejecución de herramientas**: Llama automáticamente a funciones para gestionar tus datos
- **Conversación natural**: Habla con tu asistente en español o inglés de forma fluida
- **Tool calling iterativo**: Ejecuta múltiples acciones en una sola solicitud
- **Interfaz bilingüe**: Soporte completo para español e inglés

### 💰 Gestión Financiera
- Seguimiento de ingresos y gastos
- Presupuestos mensuales por categoría
- Alertas automáticas cuando superas el 70% del presupuesto
- Metas de ahorro con tracking de progreso
- Visualización de balance mensual

### ✅ Gestión de Tareas
- Sistema TODO/INBOX/DONE
- Tareas con fechas y horarios
- Calendario integrado
- Seguimiento de productividad
- Tareas vinculadas a proyectos

### 📊 Proyectos
- Organización por proyectos
- Objetivos con deadlines
- Vinculación cross-feature (tareas, gastos, entradas de diario)
- Estadísticas por proyecto

### 📝 Diario Personal
- Entradas de diario con categorías
- Tracking de estado de ánimo y energía (1-5)
- Estadísticas de mood y patrones
- Organizado por fechas

---

## 📸 Capturas de Pantalla

> **Nota**: Agrega capturas de pantalla de tu aplicación en la carpeta `docs/screenshots/` y actualiza esta sección.

---

## 🔧 Requisitos Previos

Antes de instalar LifeOS, asegúrate de tener instalado:

- **Python 3.10+** - [Descargar](https://www.python.org/downloads/)
- **Node.js 18+** y **npm** - [Descargar](https://nodejs.org/)
- **Git** - [Descargar](https://git-scm.com/)

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/lifeos.git
cd lifeos
```

### 2. Configurar el Backend (Django)

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
# venv\Scripts\activate

# Instalar dependencias
pip install -r backend/requirements.txt

# Realizar migraciones
cd backend
python manage.py migrate

# (Opcional) Crear superusuario para admin
python manage.py createsuperuser

cd ..
```

### 3. Configurar el Frontend (React + Vite)

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuración

### Configurar Variables de Entorno

**No necesitas crear un archivo `.env`** - LifeOS permite configurar las API keys directamente desde la interfaz de usuario.

Sin embargo, si prefieres configurar las variables de entorno manualmente:

1. Crea un archivo `.env` en la raíz del proyecto
2. Añade las siguientes variables (opcional):

```bash
# Backend
SECRET_KEY=tu-clave-secreta-django
DEBUG=True

# API Keys (opcional - se pueden configurar en la UI)
GROQ_API_KEY=tu-clave-groq
OPENAI_API_KEY=tu-clave-openai
ANTHROPIC_API_KEY=tu-clave-anthropic
```

> ⚠️ **Importante**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

### Configurar API Keys en la Aplicación (Recomendado)

1. Inicia la aplicación (ver siguiente sección)
2. Ve a **Configuración** (Settings) en la navegación  
3. **OpenRouter (Recomendado)**:
   - Obtén tu API key gratuita en [openrouter.ai/keys](https://openrouter.ai/keys)
   - Pega tu clave `sk-or-...` en el campo correspondiente
   - Selecciona entre 400+ modelos actualizados (Claude 4.6, GPT-4.5, Gemini 2.5, etc.)
   - Usa la búsqueda para filtrar modelos por nombre
   - Haz clic en "Actualizar" para obtener los últimos modelos disponibles
4. **Proveedores Directos (Alternativa)**:
   - Expande la sección "Acceso Directo a Proveedores"
   - Selecciona Groq, OpenAI, Anthropic o Together AI
   - Introduce tu API key del proveedor
   - Selecciona uno de los modelos predefinidos
   - **Nota**: Estos proveedores pueden mostrar listas de modelos desactualizadas
5. Los datos se guardan en `localStorage` de tu navegador de forma segura

---

## 🎯 Uso

### Iniciar los Servidores de Desarrollo

#### Opción 1: Script Automático (Recomendado)

```bash
bash start_dev.sh
```

Este script inicia automáticamente:
- Django backend en `http://localhost:8000`
- Vite frontend en `http://localhost:5173`

#### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:5173**

### Usar el Asistente IA

1. Configura tu API key en Settings
2. Usa el chat en cualquier página
3. Ejemplos de comandos:
   - *"¿Cuál es mi resumen del día?"*
   - *"Añade 15€ de gasto por comida"*
   - *"Crea una tarea para mañana a las 10:00 llamada Reunión"*
   - *"Añade 2€ en gastos por café y crea una tarea para hoy"*
   - *"Crea un proyecto llamado Vacaciones"*

---

## 🏗️ Arquitectura

```
lifeos/
├── backend/              # Django REST API
│   ├── core/            # Configuración principal
│   │   └── chat_api.py  # API del asistente con tool calling
│   ├── finance/         # App de finanzas
│   ├── tasks/           # App de tareas
│   ├── journal/         # App de diario
│   ├── projects/        # App de proyectos
│   └── services/        # Servicios compartidos
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── api/         # API clients
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas principales (Settings con UI mejorada)
│   │   ├── config/      # Configuración (AI providers)
│   │   ├── hooks/       # Custom hooks (useModels, useLocalStorage)
│   │   └── context/     # Context providers (LanguageContext)
│   └── package.json
│
├── mcp_server/          # Model Context Protocol server
│   └── server.py        # FastMCP server con tools
│
├── .gitignore
├── README.md
└── start_dev.sh         # Script de inicio
```

### Stack Tecnológico

**Backend:**
- Django 6.0
- Django REST Framework
- SQLite (desarrollo) / PostgreSQL (producción recomendada)
- Python 3.10+

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Lucide React (iconos)
- React Router
- Recharts (gráficos)

**IA Integration:**
- FastMCP (Model Context Protocol)
- Groq API
- OpenAI API
- Anthropic API
- Together AI
- OpenRouter

---

## 🛠️ API y Tools

### Herramientas Disponibles para el Asistente IA

El asistente puede ejecutar las siguientes acciones automáticamente:

#### Finanzas
- `get_financial_summary` - Resumen mensual
- `add_transaction` - Añadir ingreso/gasto
- `get_budget_status` - Estado de presupuestos
- `check_budget_alerts` - Alertas de presupuesto
- `get_savings_goals` - Metas de ahorro
- `create_savings_goal` - Crear meta de ahorro
- `add_funds_to_goal` - Añadir fondos a meta

#### Tareas
- `get_all_tasks` - Listar todas las tareas
- `create_task` - Crear nueva tarea
- `complete_task` - Marcar como completada
- `delete_task` - Eliminar tarea
- `get_overdue_tasks` - Tareas vencidas

#### Proyectos
- `get_all_projects` - Listar proyectos
- `create_project` - Crear proyecto
- `add_project_objective` - Añadir objetivo
- `complete_objective` - Completar objetivo
- `delete_project` - Eliminar proyecto

#### Diario
- `write_journal_entry` - Escribir entrada
- `get_journal_categories` - Listar categorías
- `get_mood_stats` - Estadísticas de ánimo

#### Utilidades
- `get_daily_summary` - Resumen completo del día

### Ejecución Iterativa de Tools

El sistema soporta **ejecución iterativa**: el asistente puede llamar múltiples herramientas en secuencia hasta completar todas las acciones solicitadas (máximo 5 iteraciones).

**Ejemplo:**
```
Usuario: "añade 2€ de gasto por café y crea una tarea para mañana"

Iteración 1: Llama a add_transaction()
Iteración 2: Llama a create_task()
Resultado: Ambas acciones completadas ✅
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- Iconos por [Lucide](https://lucide.dev/)
- UI inspirada en diseño moderno de productividad
- Powered by [FastMCP](https://github.com/jlowin/fastmcp)

---

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

<div align="center">

**Hecho con ❤️ y ☕**

</div>
