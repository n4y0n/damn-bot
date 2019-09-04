const RestClient = require('../src/lib/RestClient')

const d = new RestClient("https://api.mcsrvstat.us/2")

d.Get('nayon.club').then(r => r.data).then(console.log)
