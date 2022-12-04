const generateStars = results => {
    for (const bocc of results) {
        bocc.stars = ''
        for (j = 0; j < bocc.rarity; j++) {
            bocc.stars += '★'
        }
    }
}

function getTimeRemaining(e) {
    const total = e - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor((total / 1000 / 60 / 60 / 24));
    return { total, days, hours, minutes, seconds };
}


module.exports = {
    generateStars,
    getTimeRemaining,
}