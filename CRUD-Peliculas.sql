/* Crear la base de datos */
CREATE DATABASE CRUDPeliculas;
GO

/* Seleccionar la base de datos */
USE CRUDPeliculas;
GO

/* ==========================
   Tabla: Actores
   ==========================
   Almacena la información
   básica de los actores.
   
   NombreArtistico: nombre
   por el que el público los
   conoce (opcional).

   EstaVivo:
   1 = Vivo
   0 = Fallecido

   FechaFallecimiento:
   Solo aplica si el actor
   ha fallecido.
   ========================== */
CREATE TABLE Actores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto NVARCHAR(150) NOT NULL,
    NombreArtistico NVARCHAR(150) NULL,
    FechaNacimiento DATE NOT NULL,
    Sexo NVARCHAR(20) NOT NULL,
    EstaVivo BIT NOT NULL
        CONSTRAINT DF_Actores_EstaVivo DEFAULT 1,
    FechaFallecimiento DATE NULL,
    Foto NVARCHAR(255) NULL
);
GO

/* ==========================
   Tabla: Peliculas
   ==========================
   Almacena la información
   básica de las películas.

   Director:
   Nombre del director de la
   película (opcional).

   No se permiten títulos
   repetidos.
   ========================== */
CREATE TABLE Peliculas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(150) NOT NULL,
    Genero NVARCHAR(80) NOT NULL,
    Director NVARCHAR(150) NULL,
    Productora NVARCHAR(150) NULL,
    FechaEstreno DATE NOT NULL,
    Foto NVARCHAR(255) NULL,

    /* No permitir títulos repetidos */
    CONSTRAINT UQ_Peliculas_Titulo UNIQUE (Titulo)
);
GO
/* ==========================
   Tabla: ActoresPeliculas
   ==========================
   Relación muchos a muchos
   entre actores y películas.

   Un actor puede participar
   en muchas películas.

   Una película puede tener
   muchos actores.
   ========================== */
CREATE TABLE ActoresPeliculas (
    PeliculaId INT NOT NULL,
    ActorId INT NOT NULL,
    Personaje NVARCHAR(150) NULL,
    EsPrincipal BIT NOT NULL DEFAULT 0,

    CONSTRAINT PK_ActoresPeliculas
        PRIMARY KEY (PeliculaId, ActorId),

    CONSTRAINT FK_ActoresPeliculas_Peliculas
        FOREIGN KEY (PeliculaId) REFERENCES Peliculas(Id),

    CONSTRAINT FK_ActoresPeliculas_Actores
        FOREIGN KEY (ActorId) REFERENCES Actores(Id)
);
GO

/* ==========================
   Tabla: Directores
   ==========================
   Reservada para una futura
   expansión del sistema.

   Permitirá gestionar los
   directores mediante un
   CRUD independiente y
   relacionarlos con las
   películas mediante llaves
   foráneas.

   Actualmente no está en uso.
   ========================== */
CREATE TABLE Directores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto NVARCHAR(150) NOT NULL,
    NombreArtistico NVARCHAR(150) NULL,
    FechaNacimiento DATE NULL,
    Sexo NVARCHAR(20) NULL,
    EstaVivo BIT NOT NULL
        DEFAULT 1,
    FechaFallecimiento DATE NULL,
    Foto NVARCHAR(255) NULL
);
GO

/* ==========================
   Consultas de verificación
   ========================== */

/* Mostrar todos los actores */
SELECT *
FROM Actores;



/* Mostrar todas las películas */
SELECT *
FROM Peliculas;


SELECT *
FROM ActoresPeliculas;
/* Mostrar todos los directores */
SELECT *
FROM Directores;
GO


USE CRUDPeliculas;
GO


USE CRUDPeliculas;
GO

DELETE FROM Actores
WHERE Id IN (5, 6);
GO


USE CRUDPeliculas;
GO

ALTER TABLE ActoresPeliculas
ADD Personaje NVARCHAR(150) NULL;
GO

ALTER TABLE ActoresPeliculas
ADD EsPrincipal BIT NOT NULL
    CONSTRAINT DF_ActoresPeliculas_EsPrincipal DEFAULT 0;
GO