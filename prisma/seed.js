import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear permisos
  const permisos = [
    { Nombre: "Servicio Financiero", Tipo: "D" },
    { Nombre: "Almacen", Tipo: "D" },
    { Nombre: "Logistica", Tipo: "D" },
    { Nombre: "Analista", Tipo: "P" },
    { Nombre: "Coordinador", Tipo: "P" },
    { Nombre: "Divisa", Tipo: "T" },
    { Nombre: "BS BCV", Tipo: "T" },
    { Nombre: "BS Promedio", Tipo: "T" },
    { Nombre: "Bolivares", Tipo: "M" },
    { Nombre: "Divisa", Tipo: "M" },
  ];

  for (const permiso of permisos) {
    await prisma.permiso.create({ data: permiso });
  }

  // Crear roles
  const roles = [{ Nombre: "Analista" }, { Nombre: "Coordinador" }];

  for (const role of roles) {
    await prisma.role.create({ data: role });
  }

  // Asignar permisos a roles
  const analista = await prisma.role.findFirst({
    where: { Nombre: "Analista" },
  });
  const coordinador = await prisma.role.findFirst({
    where: { Nombre: "Coordinador" },
  });

  const permisosAnalista = await prisma.permiso.findMany({
    where: { Tipo: { in: ["D", "T"] } },
  });

  const permisosCoordinador = await prisma.permiso.findMany({
    where: { Tipo: { in: ["D", "P", "M"] } },
  });

  for (const permiso of permisosAnalista) {
    await prisma.roleOnPermiso.create({
      data: { roleId: analista.id, permisoId: permiso.id },
    });
  }

  for (const permiso of permisosCoordinador) {
    await prisma.roleOnPermiso.create({
      data: { roleId: coordinador.id, permisoId: permiso.id },
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
