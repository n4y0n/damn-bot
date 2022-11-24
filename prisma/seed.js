const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const seed = [
    { slag: "/bocc", name: 'Bocc', rarity: 1 },
    { slag: "/m-bocc", name: 'Mbocc', rarity: 1 },
    { slag: "/s-bocc", name: 'Sbocc', rarity: 2 },
    { slag: "/el-boccios", name: 'El Boccios', rarity: 3 },
    { slag: "/bocci-la-roccia", name: 'Bocci la roccia', rarity: 3 },
    { slag: "/bocc-sssrplus", name: 'Bocc SSSR+', rarity: 4 },
    { slag: "/bocci-mage", name: 'Bocci mage', rarity: 4 },
    { slag: "/bocc-il-signore-dei-pandori", name: 'Bocc il signore dei pandori', rarity: 5 },
    { slag: "/bocc-engine", name: 'The Bocc Engine', rarity: 5 },
    { slag: "/the-boccinator", name: 'Boccinator', rarity: 5 },
]

// Bocci mage : https://cdn.discordapp.com/avatars/224977582846640128/5ab1c937b374310da6b2bedc57f0a880.png?size=1024
// Bocc : https://cdn.discordapp.com/attachments/351091696219586572/1045451536387538984/BoccSleep.png
// Mbocc : https://cdn.discordapp.com/attachments/351091696219586572/1045453311756746783/Mbocc.png

async function main() {
    await prisma.$connect()
    for (const bocc of seed) {
        await prisma.bocc.create({
            data: bocc
        })
    }
}

main()