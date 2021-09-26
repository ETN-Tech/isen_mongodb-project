const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

const api = require('./api');
const workers = require('./workers');

app.get('/', (req, res) => {
    res.send('VeloLand App up & running!')
})

app.use('/api', api);

app.use('/workers', workers);

app.listen(port, () => {
    console.log(`VeloLand App at http://localhost:${port}`)
})
