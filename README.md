# SUBCRIPTION SYSTEM by LACA-SOFT

Una API construida con NestJS para gestionar usuarios y suscripciones con pagos vía Stripe, PayPal (con links de pago) y transferencia bancaria. Ofrece:

- Registro y gestión de usuarios
- Suscripciones con **7 días de prueba**
- Renovación automática mensual
- Vistas del estado de suscripción
- Webhooks para recibir notificaciones de pago de Stripe y PayPal
- Seguridad de cabeceras (Helmet)
- Límite de peticiones (Throttler)
- Autenticación por API Key y JWT

## 📋 Características principales

- **Usuarios**: creación
- **Suscripciones**: planes mensuales, estado, actualizaciones
- **Pagos**:
  - Stripe (API + webhooks)
  - PayPal (links de pago + webhooks)
  - Transferencia bancaria (adapter)
- **Prueba gratuita** de 7 días antes de la suscripción activa
- **Renovación automática** cada mes
- **Seguridad**:
  - Helmet para cabeceras seguras
  - Rate limiting con NestJS Throttler
  - API Key Guard y JWT Guard
- **Webhooks** configurados en `/api/v1/webhooks/stripe` y `/api/v1/webhooks/paypal`

## 🚀 Requisitos

- Node.js ≥ 16.x
- npm o yarn
- PostgreSQL (u otro RDBMS compatible con TypeORM)
- Claves de Stripe y PayPal
- API Key para llamadas protegidas

## ⚙️ Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con estas claves:

```ini
# APP
ENVIRONMENT_NAME=           # (p. ej. development, production)
APP_NAME=SUBCRIPTION SYSTEM by LACA-SOFT
APP_AUTHOR=LACA-SOFT
APP_PORT=3000
APP_PROD=false              # true en producción

APP_TRIAL_DAYS=7            # Días de prueba gratuita

CORS_ORIGIN=*               # Orígenes permitidos para CORS

# DATABASE
DB_USER=                   # Usuario de la base de datos
DB_PASS=                   # Contraseña de la base de datos
DB_NAME=                   # Nombre de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_SYNC=false               # true para sincronizar entidades en dev
DB_LOGGIN=false             # Habilitar logging de TypeORM
DB_LOAD_ENTITIES=true       # Cargar entidades automáticamente
DB_MIGRATIONS=src/database/migrations/*.ts
DB_SSL=false                # true si la BD requiere SSL

# BOT (API Key Guard)
BOT_API_KEY=                # Clave pública para llamadas al bot
BOT_API_SECRET=             # Secreto para validar el bot

# Stripe
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…

# PayPal
PAYPAL_CLIENT_ID=AbCdEf…
PAYPAL_SECRET=XyZ123…
PAYPAL_ENVIRONMENT=sandbox  # sandbox o live
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_BRAND_NAME="SUBCRIPTION SYSTEM"
PAYPAL_WEBHOOK_ID=…

# BANK ACCOUNT
BANK_ACCOUNT_NAME=LACA-SOFT
BANK_ACCOUNT_NUMBER=0123-456-7890123456

Importante:

    Ajusta APP_PROD, DB_SYNC, DB_LOGGIN y DB_SSL según tu entorno.
    Asegúrate de proteger bien los secretos (SECRET_KEY, CLIENT_ID, etc.) y no subir tu .env al repositorio.
```

## 📂 Estructura del proyecto

```
├── app.module.ts
├── main.ts
├── common
│   ├── config
│   ├── decorators
│   ├── enums
│   ├── events
│   ├── exceptions
│   ├── filters
│   ├── guards
│   ├── health
│   ├── http
│   ├── interceptors
│   ├── interfaces
│   └── utils
├── database
│   ├── migrations
│   └── ormconfig.ts
├── modules
│   ├── users
│   ├── subscriptions
│   ├── payments
│   └── user‐subscription
└── tests
    └── … (specs)
```

## 🛠️ Endpoints Destacados (v1)
**Health Check**

    GET /api/v1/health

**Usuarios**

    POST /api/v1/users
    GET /api/v1/users

**Suscripciones**

    GET /api/v1/subscriptions

**Pagos**

    POST /api/v1/payments/links
    Genera links de pago (Stripe, PayPal, transferencia)
    POST /api/v1/payments/orders/{orderId}/capture
    Captura un pago de orden (Stripe)
    POST /api/v1/payments/refund/{paymentId}
    Reembolso de un pago

**Webhooks**

    POST /api/v1/webhooks/stripe
    POST /api/v1/webhooks/paypal

## 🔒 Seguridad

    Helmet aplicado globalmente para cabeceras seguras.
    ThrottlerModule con rate limiting configurable.
    API Key Guard: revisa x-api-key en cabeceras.
    JWT Guard para rutas protegidas.

## 📜 Documentación Swagger

    Accede a http://localhost:3000/api/docs.

## 🧪 Tests

    npm run test
    o
    yarn test

## 🤝 Contribuciones

    Haz un fork del repositorio
    Crea una rama feature: git checkout -b feature/nueva-funcionalidad
    Realiza tus cambios y commitea: git commit -m "Agrega XYZ"
    Push a tu rama: git push origin feature/nueva-funcionalidad
    Abre un Pull Request

## 📄 Licencia

MIT © ***LACA-SOFT***