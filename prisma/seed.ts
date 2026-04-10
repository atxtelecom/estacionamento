import "dotenv/config";
import { PrismaClient, Perfil, CategoriaVaga, ModalidadeTarifa } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Usuários ───────────────────────────────────────────────────────────────

  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaOperador = await bcrypt.hash("operador123", 10);
  const senhaMensalista = await bcrypt.hash("mensalista123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@estacionamento.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@estacionamento.com",
      senhaHash: senhaAdmin,
      perfil: Perfil.ADMIN,
    },
  });

  const operador = await prisma.usuario.upsert({
    where: { email: "operador@estacionamento.com" },
    update: {},
    create: {
      nome: "João Operador",
      email: "operador@estacionamento.com",
      senhaHash: senhaOperador,
      perfil: Perfil.OPERADOR,
    },
  });

  const usuarioMensalista = await prisma.usuario.upsert({
    where: { email: "joao@email.com" },
    update: {},
    create: {
      nome: "João Silva",
      email: "joao@email.com",
      senhaHash: senhaMensalista,
      perfil: Perfil.MENSALISTA,
    },
  });

  console.log("✅ Usuários criados");

  // ── Mensalista ─────────────────────────────────────────────────────────────

  const mensalista = await prisma.mensalista.upsert({
    where: { cpf: "12345678901" },
    update: {},
    create: {
      nome: "João Silva",
      cpf: "12345678901",
      telefone: "11999990000",
      plano: "Mensal Carro",
      valor: 180.0,
      vencimento: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      usuarioId: usuarioMensalista.id,
    },
  });

  await prisma.veiculo.upsert({
    where: { placa: "ABC1234" },
    update: {},
    create: {
      placa: "ABC1234",
      tipo: "MENSALISTA",
      descricao: "Honda Civic Prata",
      mensalistaId: mensalista.id,
    },
  });

  console.log("✅ Mensalista criado");

  // ── Vagas (50 no total) ────────────────────────────────────────────────────

  const vagasExistentes = await prisma.vaga.count();
  if (vagasExistentes === 0) {
    const vagas = [];

    // 40 vagas de carro (1-40)
    for (let i = 1; i <= 40; i++) {
      vagas.push({ numero: i, categoria: CategoriaVaga.CARRO });
    }
    // 7 vagas de moto (41-47)
    for (let i = 41; i <= 47; i++) {
      vagas.push({ numero: i, categoria: CategoriaVaga.MOTO });
    }
    // 3 vagas PCD (48-50)
    for (let i = 48; i <= 50; i++) {
      vagas.push({ numero: i, categoria: CategoriaVaga.PCD });
    }

    await prisma.vaga.createMany({ data: vagas });
    console.log("✅ 50 vagas criadas");
  } else {
    console.log("⏭️  Vagas já existem, pulando...");
  }

  // ── Tarifa padrão ──────────────────────────────────────────────────────────

  await prisma.tarifa.upsert({
    where: { id: "tarifa-padrao" },
    update: {},
    create: {
      id: "tarifa-padrao",
      nome: "Tabela Padrão",
      modalidade: ModalidadeTarifa.MISTA,
      valor1h: 8.0,
      valorHoraExtra: 4.0,
      valorDiaria: 35.0,
      horasAteDiaria: 12,
      ativa: true,
    },
  });

  console.log("✅ Tarifa padrão criada");
  console.log("\n🎉 Seed concluído!");
  console.log("\nCredenciais de acesso:");
  console.log("  Admin:      admin@estacionamento.com / admin123");
  console.log("  Operador:   operador@estacionamento.com / operador123");
  console.log("  Mensalista: joao@email.com / mensalista123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
