const { claimDailyBalance, advancedPull } = require('./gacha')
const { getCollection, getPullCount, getCollectionCount, getBalance, initBalance, incrementBalance } = require('./database')

module.exports = {
    claimDaily: claimDailyBalance,
    pull: advancedPull,
    getCollection,
    getPullCount,
    getCollectionCount,
    getBalance,
    initBalance,
    incrementBalance
}