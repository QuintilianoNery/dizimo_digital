import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pastoraisMovimentos = [
  { nome: 'Coordenador Comunitário', tipo: 'movimento' },
  { nome: 'Tesoureiro', tipo: 'movimento' },
  { nome: 'Secretário', tipo: 'movimento' },
  { nome: 'Pastoral do Dízimo', tipo: 'pastoral' },
  { nome: 'Pastoral da Liturgia', tipo: 'pastoral' },
  { nome: 'Pastoral do Canto/Litúrgica Musical', tipo: 'pastoral' },
  { nome: 'Pastoral dos Coroinhas', tipo: 'pastoral' },
  { nome: 'Pastoral dos Acólitos', tipo: 'pastoral' },
  { nome: 'Pastoral dos Leitores', tipo: 'pastoral' },
  { nome: 'Pastoral da Acolhida', tipo: 'pastoral' },
  { nome: 'Pastoral da Comunicação (PASCOM)', tipo: 'pastoral' },
  { nome: 'Pastoral do Batismo', tipo: 'pastoral' },
  { nome: 'Pastoral da Crisma', tipo: 'pastoral' },
  { nome: 'Pastoral da Catequese', tipo: 'pastoral' },
  { nome: 'Pastoral Familiar', tipo: 'pastoral' },
  { nome: 'Pastoral Matrimonial', tipo: 'pastoral' },
]

async function main() {
  console.log('Seeding pastorais/movimentos...')
  for (const item of pastoraisMovimentos) {
    await prisma.pastoralMovimento.upsert({
      where: { id: item.nome },
      update: {},
      create: item,
    })
  }
  console.log('Seed concluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
