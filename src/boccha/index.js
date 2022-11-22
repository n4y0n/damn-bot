const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const baseRates = [33, 27, 20, 13, 7];
const weight = [1, 1, 1, 2, 3];

const pullCost = 10;
const dailyBalance = 50;
const boccID = '224977582846640128'

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
    const u = await findOrCreateUser(user)

    if (u.balance < pullCost) {
        throw new Error('You don\'t have enough bocc coins to pull a bocc')
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

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            balance: {
                decrement: pullCost
            }
        }
    })

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

module.exports.getBalance = async function (user) {
    const u = await findOrCreateUser(user)
    return u.balance
}

module.exports.addBalance = async function (user, amount) {
    await findOrCreateUser(user)
    return prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            balance: {
                increment: amount
            }
        }
    })
}

module.exports.initBalance = async function () {
    const users = await prisma.user.findMany()
    for (const user of users) {
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                balance: 0,
                lastDaily: new Date(0)
            }
        })
    }
}

module.exports.incrementBalance = async function () {
    const users = await prisma.user.findMany()
    for (const user of users) {
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                balance: {
                    increment: 1
                }
            }
        })
    }
}

module.exports.claimDaily = async function (user) {
    const u = await findOrCreateUser(user)
    if (u.lastDaily) {
        const lastDaily = new Date(u.lastDaily)
        const now = new Date()
        if (lastDaily.getDate() == now.getDate() && lastDaily.getMonth() == now.getMonth() && lastDaily.getFullYear() == now.getFullYear() && user.id !== boccID) {
            throw new Error('You already claimed your daily bocc coins')
        }
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            balance: {
                increment: dailyBalance
            },
            lastDaily: new Date()
        }
    })

    return dailyBalance
}


async function findOrCreateUser(user) {
    let u = await prisma.user.findFirst({ where: { id: user.id } })
    if (!u) {
        let balance = 0
        if (user.id === boccID) {
            balance = 1000000
        }
        u = await prisma.user.create({ data: { id: user.id, name: user.tag, balance: balance } })
    }
    return u
}