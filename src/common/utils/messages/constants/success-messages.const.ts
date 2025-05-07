export const SuccessMessages = {
  USER: {
    CREATED: 'Usuario creado exitosamente',
    CREATED_TRIAL: (days: number) =>
      `Usuario registrado con ${days} días de prueba`,
    UPDATED: 'Usuario actualizado correctamente',
    DELETED: 'Usuario eliminado con éxito',
    RESTORED: 'Usuario restaurado satisfactoriamente',
    PASSWORD_UPDATED: (username: string) =>
      `Contraseña actualizada para el usuario ${username}`,
  },
  AUTH: {
    LOGIN: (name: string) => `¡Bienvenido ${name}!`,
    LOGOUT: 'Sesión cerrada correctamente',
    SESSION_RENEWED: 'Sesión renovada con éxito',
  },
  SUBSCRIPTION: {
    CREATED: 'Suscripción creada exitosamente',
    UPDATED: 'Suscripción actualizada correctamente',
    RENEWED: 'Suscripción renovada con éxito',
    CANCELLED: 'Suscripción cancelada satisfactoriamente',
  },
  OPERATION: {
    COMPLETED: 'Operación completada con éxito',
    SCHEDULED: (date: string) => `Operación programada para ${date}`,
    SYNC_COMPLETED: 'Sincronización completada exitosamente',
  },
} as const;
