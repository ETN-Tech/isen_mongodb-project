const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

const api = require('./api')

app.get('/', (req, res) => {
    res.send('VeloLand up & running')
})

app.use('/api', api);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})