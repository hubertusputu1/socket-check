const express = require('express')
const Slack = require('../utils/slack')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.send('ok')
})

app.post('/alerts/slack', (req, res) => {
    const body = JSON.stringify(req.body)
    Slack.sendServerAlert(body)
    return res.send('ok')
})

app.listen(process.env.PORT, () => {
    console.log('running on port ', + process.env.PORT)
})