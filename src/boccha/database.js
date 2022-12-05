const { getSetting } = require("../config")

const { PrismaClient } = require('@prisma/client')
const { generateStars } = require("./utils")

const prisma = new PrismaClient()

const findOrCreateUser = async discordUser => {
    let u = await prisma.user.findFirst({ where: { id: discordUser.id } })
    if (!u) {
        const boccID = await getSetting("boccID")
        let balance = 0
        if (discordUser.id === boccID) {
            balance = 1000000
        }
        u = await prisma.user.create({ data: { id: discordUser.id, name: discordUser.tag, balance: balance } })
    }
    return u
}

const getCollection = async discordUser => {
    const pulls = await prisma.pull.groupBy({
        by: ['boccId', 'userId'],
        having: {
            userId: discordUser.id,
        }
    })

    const collection = await prisma.bocc.findMany({
        where: {
            id: {
                in: pulls.map(p => p.boccId)
            }
        }
    })

    generateStars(collection)

    return collection.sort((a, b) => a.rarity - b.rarity)
}

const getPullCount = async discordUser => {
    const result = await prisma.$queryRaw`select Bocc.rarity as Rarity, Bocc.id as ID, Bocc.name as Bocc, PullCount as Count from Bocc, (select boccId, count(*) as PullCount from pull where pull.userId = ${discordUser.id} GROUP by boccId) as BCT where BCT.boccId = Bocc.id`
    const counts = { total: 0 }
    for (const row of result) {
        const count = parseInt(row.Count)
        counts.total += count
        counts[row.ID] = {
            id: row.ID,
            count: count,
            name: row.Bocc,
            rarity: row.Rarity,
        }
    }
    return counts
}

const getCollectionCount = async function () {
    return prisma.bocc.count()
}

const getBalance = async function (discordUser) {
    const u = await findOrCreateUser(discordUser)
    return u.balance
}

const addBalance = async function (discordUser, amount) {
    await findOrCreateUser(discordUser)
    return prisma.user.update({
        where: {
            id: discordUser.id
        },
        data: {
            balance: {
                increment: amount
            }
        }
    })
}

const initBalance = async function (clear = true) {
    const users = await prisma.user.findMany()
    const data = {
        lastDaily: new Date(0)
    }

    if (clear) {
        data.balance = 0
    }

    for (const user of users) {
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: data
        })
    }
}

const incrementBalance = async function (discordUser, amount = 1, daily = false) {
    await findOrCreateUser(discordUser)

    const data = {
        balance: {
            increment: amount
        }
    }

    if (daily) {
        data.lastDaily = new Date()
    }

    await prisma.user.update({
        where: {
            id: discordUser.id
        },
        data: data
    })
}

const fetchUsers = async function () {
    const users = await prisma.user.findMany()
    return users
}

const fetchBoccs = async function () {
    const boccs = await prisma.bocc.findMany()
    return boccs
}

const newPull = async function (discordUser, bocc) {
    return prisma.pull.create({
        data: {
            userId: discordUser.id,
            boccId: bocc.id,
        }
    })
}

const decrementBalance = async function (discordUser, amount = 1) {
    await findOrCreateUser(discordUser)
    return prisma.user.update({
        where: {
            id: discordUser.id
        },
        data: {
            balance: {
                decrement: amount
            }
        }
    })
}

module.exports = {
    findOrCreateUser,
    getCollection,
    getPullCount,
    getCollectionCount,
    getBalance,
    addBalance,
    initBalance,
    incrementBalance,
    fetchUsers,
    newPull,
    decrementBalance,
    fetchBoccs,
}