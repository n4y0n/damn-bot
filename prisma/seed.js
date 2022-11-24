const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const seed = [
    { slag: "/bocc", name: 'Bocc', rarity: 1 },
    { slag: "/m-bocc", name: 'Mbocc', rarity: 1 },
    { slag: "/s-bocc", name: 'Sbocc', rarity: 2 },
    { slag: "/el-boccios", name: 'El Boccios', rarity: 3 },
    { slag: "/bocci-la-roccia", name: 'Bocci la roccia', rarity: 3 },
    { slag: "/bocc-il-signore-dei-pandori", name: 'Bocc il signore dei pandori', rarity: 5 },
    { slag: "/bocc-sssrplus", name: 'Bocc SSSR+', rarity: 4 },
    { slag: "/bocc-engine", name: 'The Bocc Engine', rarity: 5 },
    { slag: "/the-boccinator", name: 'Boccinator', rarity: 5 },
]

async function main() {
    await prisma.$connect()
    for (const bocc of seed) {
        await prisma.bocc.create({
            data: bocc
        })
    }
}

main()