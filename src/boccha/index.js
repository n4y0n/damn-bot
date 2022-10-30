// Bocc, Mbocc, Sbocc, El Boccios, Bocci la roccia
// Mi stavo dimenticando il bocc più importante
// Bocc il signore dei pandori
// SSSR+

const boccis = [
    { href: "/bocc", name: 'Bocc', chance: 0.0002 },
    { href: "/m-bocc", name: 'Mbocc', chance: 0.0002 },
    { href: "/s-bocc", name: 'Sbocc', chance: 0.0002 },
    { href: "/el-boccios", name: 'El Boccios', chance: 0.0002 },
    { href: "/bocci-la-roccia", name: 'Bocci la roccia', chance: 0.0002 },
    { href: "/bocc-il-signore-dei-pandori", name: 'Bocc il signore dei pandori', chance: 0.0002 },
    { href: "/bocc-sssrplus", name: 'SSSR+', chance: 0.0002 },
]

const roll = () => {
    const r = Math.random()
    return boccis.find(bocc => r < bocc.chance)
}