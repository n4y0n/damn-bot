const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const settings = {
    baseRates: [33, 25, 15, 10, 2],
    weight: [1, 1, 1, 2, 3],
    pullCost: 10,
    dailyBalance: 50,
    boccID: '224977582846640128'
}

const seed = [
    { slag: "/bocc", name: 'Bocc', rarity: 1 },
    { slag: "/m-bocc", name: 'Mbocc', rarity: 1 },
    { slag: "/s-bocc", name: 'Sbocc', rarity: 2 },
    { slag: "/el-boccios", name: 'El Boccios', rarity: 3 },
    { slag: "/bocci-la-roccia", name: 'Bocci la roccia', rarity: 3 },
    { slag: "/boccimaster", name: 'Boccimaster', rarity: 3 },
    { slag: "/bocc-sssrplus", name: 'Bocc SSSR+', rarity: 4 },
    { slag: "/bocci-mage", name: 'Bocci mage', rarity: 4 },
    { slag: "/bocc-il-signore-dei-pandori", name: 'Bocc il signore dei pandori', rarity: 5 },
    { slag: "/bocc-engine", name: 'The Bocc Engine', rarity: 5 },
    { slag: "/the-boccinator", name: 'Boccinator', rarity: 5 },
    { slag: "/water-boccificator", name: 'Il Boccificatore dell\'acqua', rarity: 5 },
]

async function main() {
    await prisma.$connect()
    for (const bocc of seed) {
        await prisma.bocc.upsert({
            create: bocc,
            update: bocc,
            where: {
                slag: bocc.slag
            }
        })
    }
    for (const setting of Object.keys(settings)) {
        await prisma.setting.upsert({
            create: {
                type: "json",
                name: setting,
                value: JSON.stringify(settings[setting]),
            },
            update: {
                value: JSON.stringify(settings[setting]),
            },
            where: {
                name: setting
            }
        })
    }
    await prisma.$disconnect()
}

main()