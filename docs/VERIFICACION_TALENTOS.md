# Verificación de talentos en CineRD

CineRD utiliza tres niveles de acceso:

- **USUARIO:** consulta pública y solicitud de reclamación de perfiles.
- **TALENTO_VERIFICADO:** cuenta cuya identidad fue aprobada y vinculada a un talento del catálogo.
- **ADMINISTRADOR:** gestión editorial, importaciones y revisión de verificaciones.

## Flujo

1. El visitante crea una cuenta.
2. Inicia sesión y abre **Verificar mi perfil**.
3. Busca su nombre completo o artístico.
4. Selecciona **Este soy yo**.
5. Elige un método de verificación.
6. La solicitud queda `PENDIENTE`.
7. Un administrador revisa la evidencia.
8. Al aprobarse, se crea la relación `TalentosUsuarios` y el usuario recibe el rol `TALENTO_VERIFICADO`.

## Métodos admitidos en la primera versión

- `RED_SOCIAL`: cuenta oficial o profesional. CineRD genera un código temporal `CINERD-XXXXXX`.
- `CORREO_PROFESIONAL`: evidencia basada en un correo profesional verificable.
- `REPRESENTANTE`: agencia, manager, productora o representante verificable.
- `DOCUMENTACION_PROFESIONAL`: contratos, acreditaciones, press kits u otros documentos profesionales cuya información sensible pueda ocultarse.

## Privacidad

La primera versión **no solicita ni almacena cédulas o pasaportes**. Si en el futuro se incorpora identificación oficial, deberá utilizar almacenamiento privado, cifrado, acceso restringido, política de retención y eliminación automática después de la revisión.

## Preparar el administrador inicial

Después de ejecutar `database/migrations/003_usuarios_roles_verificacion.sql`, define en `backend/.env`:

```env
JWT_ACCESS_SECRET=un_secreto_largo_y_aleatorio
SEED_ADMIN_NAME=Administrador CineRD
SEED_ADMIN_EMAIL=tu_correo
SEED_ADMIN_PASSWORD=una_contrasena_de_al_menos_12_caracteres
```

Luego:

```bash
cd backend
npm install
npm run seed:admin
```

## Seguridad

Los endpoints de escritura de películas, talentos y repartos requieren `ADMINISTRADOR`. Ocultar botones en React es únicamente UX; la autorización real se valida en Express.
