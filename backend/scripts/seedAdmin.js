require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("../src/config/db");

const ejecutar = async () => {
  const nombre = process.env.SEED_ADMIN_NAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!nombre || !email || !password || password.length < 12) {
    throw new Error("Define SEED_ADMIN_NAME, SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD (mínimo 12 caracteres)");
  }

  const pool = await poolPromise;
  const passwordHash = await bcrypt.hash(password, 12);

  await pool.request()
    .input("Nombre", sql.NVarChar(150), nombre)
    .input("Email", sql.NVarChar(255), email)
    .input("PasswordHash", sql.NVarChar(255), passwordHash)
    .query(`
      IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = @Email)
      BEGIN
        UPDATE dbo.Usuarios
        SET Nombre = @Nombre, PasswordHash = @PasswordHash, Rol = N'ADMINISTRADOR', Estado = N'ACTIVO'
        WHERE Email = @Email;
      END
      ELSE
      BEGIN
        INSERT INTO dbo.Usuarios (Nombre, Email, PasswordHash, Rol)
        VALUES (@Nombre, @Email, @PasswordHash, N'ADMINISTRADOR');
      END
    `);

  console.log(`Administrador preparado: ${email}`);
  await pool.close();
};

ejecutar().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
