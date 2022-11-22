const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const baseRates = [33, 27, 20, 13, 7];
const weight = [1, 1, 1, 2, 3];

let boccis = null

module.exports.pull = async function (user) {
    if (!boccis) {
        boccis = await prisma.bocc.findMany()
        for (const bocc of boccis) {
            bocc.stars = '';
            for (j = 0; j < bocc.rarity; j++) {
                bocc.stars += '★';
            }
        }
    }
    const u = await prisma.user.findFirst({ where: { id: user.id } })
    if (!u) {
        await prisma.user.create({ data: { id: user.id, name: user.tag } })
    }

    let maxRarity = 0;
    let highestId = 0;
    let fiveStar = false;

    let totalWeight = 0;
    for (i = 0; i < 5; i++) {
        totalWeight += baseRates[i] * weight[i];
    }

    // for (i = 0; i < pullCount; i++) {
    let r = Math.floor(Math.random() * totalWeight); // The roll

    let rarity = 0;
    while (r >= 0) {
        r -= baseRates[rarity] * weight[rarity];
        rarity++;
    }

    if (rarity > maxRarity) {
        maxRarity = rarity;
        highestId = i;
    }

    if (rarity == 5) {
        if (fiveStar) {
            rarity = Math.ceil(Math.random() * 4);
        }
        fiveStar = true;
    }

    if (maxRarity <= 2 && i == 2) {
        rarity = 3;
    }

    // We have our rarity, roll a random regain
    let availableBoccis = boccis.filter(function (regain) {
        return regain.rarity == rarity;
    });

    let regain = availableBoccis[Math.floor(Math.random() * availableBoccis.length)];
    //     while (results.find(function (r) {
    //         return r.id == regain.id
    //     })) {
    //         regain = availableBoccis[Math.floor(Math.random() * availableBoccis.length)];
    //     }

    //     results.push(regain);
    // }

    await prisma.pull.create({
        data: {
            userId: user.id,
            boccId: regain.id,
        }
    })

    return regain;
}

module.exports.getCollection = async function (user) {
    const pulls = await prisma.pull.groupBy({
        by: ['boccId', 'userId'],
        having: {
            userId: user.id,
        }
    })

    const collection = await prisma.bocc.findMany({
        where: {
            id: {
                in: pulls.map(p => p.boccId)
            }
        }
    })

    for (const bocc of collection) {
        bocc.stars = '';
        for (j = 0; j < bocc.rarity; j++) {
            bocc.stars += '★';
        }
    }

    return collection
}

module.exports.getCollectionCount = async function () {
    return prisma.bocc.count()
}