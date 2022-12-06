const { getSetting } = require("../config")
const { generateStars } = require("./utils")

const { PrismaClient, User: PrismaUser, Bocc: PrismaBocc } = require('@prisma/client')

const { User: DiscordUser } = require("discord.js")

const prisma = new PrismaClient()

/**
 * @param {DiscordUser|PrismaUser} user 
 * @returns {Promise<PrismaUser>}
 */
const findOrCreateUser = async user => {
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

/**
 * 
 * @param {DiscordUser|PrismaUser} user 
 * @returns {Promise<PrismaBocc[]>} 
 */
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

/**
* @param {DiscordUser|PrismaUser} user
* @returns {Promise<{total: number, [id: number]: {id: number, count: number, name: string, rarity: number}}>}
* @example
* {
*  total: 10,
*   1: {
*       id: 1,
*       count: 5,
*       name: "Bocc",
*       rarity: 1
*   },
*   2: {
*       id: 2,
*       count: 5,
*       name: "Bocc",
*       rarity: 1
*   }
* }
*
*/
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

/**
 * @returns {Promise<number>}
 */
const getCollectionCount = async function () {
    return prisma.bocc.count()
}

/**
 * @param {DiscordUser|PrismaUser} user
 * @returns {Promise<number>}
 */
const getBalance = async function (user) {
    const u = await findOrCreateUser(user)
    return u.balance
}

/**
 * @param {DiscordUser|PrismaUser} discordUser
 * @param {number} amount
 * @returns {Promise<PrismaUser>}
 */
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

/**
 * @param {DiscordUser|PrismaUser} discordUser
 * @param {number} amount
 * @returns {Promise<PrismaUser>}
 */
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

/**
 * 
 * @param {PrismaUser|DiscordUser} user 
 * @param {number} amount 
 * @param {boolean} daily 
 */
const incrementBalance = async function (user, amount = 1, daily = false) {
    await findOrCreateUser(user)

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
            id: user.id
        },
        data: data
    })
}

/**
 * 
 * @returns {Promise<PrismaUser[]>}
 */
const fetchUsers = async function () {
    const users = await prisma.user.findMany()
    return users
}

/**
 * @returns {Promise<PrismaBocc[]>}
 */
const fetchBoccs = async function () {
    const boccs = await prisma.bocc.findMany()
    return boccs
}

/**
 * @param {DiscordUser|PrismaUser} user
 * @param {PrismaBocc} bocc
 * @returns {Promise<PrismaPull>}
 */
const newPull = async function (user, bocc) {
    return prisma.pull.create({
        data: {
            userId: user.id,
            boccId: bocc.id,
        }
    })
}

/**
 * @param {DiscordUser|PrismaUser} user  
 * @param {number} amount
 * @returns {Promise<PrismaUser>}   
 */
const decrementBalance = async function (user, amount = 1) {
    await findOrCreateUser(user)
    return prisma.user.update({
        where: {
            id: user.id
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