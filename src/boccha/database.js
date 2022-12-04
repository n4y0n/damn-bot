const { getSetting } = require("../config")

const { PrismaClient } = require('@prisma/client')
const { generateStars } = require("./utils")

const prisma = new PrismaClient()

const findOrCreateUser = async (user) => {
    let u = await prisma.user.findFirst({ where: { id: user.id } })
    if (!u) {
        const boccID = await getSetting("boccID")
        let balance = 0
        if (user.id === boccID) {
            balance = 1000000
        }
        u = await prisma.user.create({ data: { id: user.id, name: user.tag, balance: balance } })
    }
    return u
}

const getCollection = async user => {
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

    generateStars(collection)

    return collection.sort((a, b) => a.rarity - b.rarity)
}

const getPullCount = async user => {
    const result = await prisma.$queryRaw`select Bocc.rarity as Rarity, Bocc.id as ID, Bocc.name as Bocc, PullCount as Count from Bocc, (select boccId, count(*) as PullCount from pull where pull.userId = ${user.id} GROUP by boccId) as BCT where BCT.boccId = Bocc.id`
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

const getBalance = async function (user) {
    const u = await findOrCreateUser(user)
    return u.balance
}

const addBalance = async function (user, amount) {
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

const incrementBalance = async function () {
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

module.exports = {
    findOrCreateUser,
    getCollection,
    getPullCount,
    getCollectionCount,
    getBalance,
    addBalance,
    initBalance,
    incrementBalance,
}