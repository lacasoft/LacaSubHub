export const ErrorMessages = {
  USER: {
    NOT_FOUND: 'Usuario no encontrado',
    ALREADY_EXISTS: 'El usuario ya existe',
    DOES_NOT_EXISTS: 'El usuario no existe',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    ID_NOT_PROVIDED: 'ID no proporcionado',
    CREATED_USER_NOT_FOUND: 'Usuario no encontrado después de creación',
  },
  SUBSCRIPTION: {
    NOT_FOUND: 'Suscripción no encontrada',
    DOES_NOT_EXISTS: 'La suscripción no existe',
    EXPIRED: 'La suscripción ha expirado. Se requiere pago para continuar.',
    ID_NOT_PROVIDED: 'ID no proporcionado',
    CREATED_SUBSCRIPTION_NOT_FOUND:
      'Suscripción no encontrada después de creación',
    TRIAL_EXPIRED: 'La prueba ha expirado. Se requiere pago para continuar.',
    TRIAL_ALREADY_USED: 'La prueba ya ha sido utilizada',
  },
  AUTH: {
    UNAUTHORIZED: 'Acceso no autorizado',
    TOKEN_EXPIRED: 'Token expirado',
    UNAUTHORIZED_ATTEMPT: 'Intento de acceso no autorizado: ',
    INVALID_API_CREDENTIALS: 'Credenciales de API inválidas',
    API_CREDENTIALS_NOT_CONFIGURED:
      'Credenciales de API no configuradas en el servidor',
    SUBSCRIPTION_REQUIRED:
      'Se requiere una suscripción activa o un período de prueba vigente',
    WHATSAPPID_REQUIRED: 'WhatsappId es requerido',
    ROLE_ACCESS_DENIED: 'Acceso denegado. Roles permitidos: ',
  },
} as const;
