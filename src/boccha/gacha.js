const { generateStars } = require('./utils')
const { findOrCreateUser } = require('./database')
const { getSetting, Settings } = require('../config')

const randomPullFromArray = async (pool, count) => {
    let results = []
    let maxRarity = 0;
    let highestId = 0;
    let fiveStar = false;

    const baseRates = await getSetting(Settings.BASE_RATES)
    const weight = await getSetting(Settings.WEIGHT)

    let totalWeight = 0;
    for (i = 0; i < 5; i++) {
        totalWeight += baseRates[i] * weight[i];
    }

    for (i = 0; i < count; i++) {
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
        let availablePool = pool.filter(function (regain) {
            return regain.rarity == rarity;
        });
    
        let regain = availablePool[Math.floor(Math.random() * availablePool.length)];
        // while (results.find(function (r) {
        //     return r.id === regain.id
        // })) {
        //     regain = availableBoccis[Math.floor(Math.random() * availableBoccis.length)];
        // }
    
        results.push(regain);
    }

    return results
}

const advancedPull = async (discordUser, pullCount) => {
    const gameUser = await findOrCreateUser(discordUser)
    const pullCost = await getSetting(Settings.PULL_COST)

    if (gameUser.balance < pullCost * pullCount && discordUser.id !== boccID) {
        throw new Error('You don\'t have enough bocc coins to pull a bocc')
    }

    const availableBoccis = await prisma.bocc.findMany()

    const results = randomPullFromArray(availableBoccis, pullCount)

    for (const regain of results) {
        await prisma.pull.create({
            data: {
                userId: discordUser.id,
                boccId: regain.id,
            }
        })
    }
    await prisma.user.update({
        where: {
            id: discordUser.id
        },
        data: {
            balance: {
                decrement: pullCost * pullCount
            }
        }
    })

    generateStars(results)
    return results
}

const claimDailyBalance = async discordUser => {
    const gameUser = await findOrCreateUser(discordUser)
    const dailyBalance = await getSetting(Settings.DAILY_BALANCE)

    if (gameUser.lastDaily) {
        const lastDaily = new Date(gameUser.lastDaily)
        const now = new Date()
        if ((lastDaily.getDate() === now.getDate() || (lastDaily.getDate() === now.getDate() && lastDaily.getMonth() === now.getMonth())) && discordUser.id !== boccID) {
            // let { hours, minutes, seconds } = getTimeRemaining(new Date(lastDaily.getTime() + 86400000));
            throw new Error(`You already claimed your daily bocc coins\nTry again in at midnight.`)
        }
    }

    await prisma.user.update({
        where: {
            id: discordUser.id
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


module.exports = {
    claimDailyBalance,
    advancedPull,
}

