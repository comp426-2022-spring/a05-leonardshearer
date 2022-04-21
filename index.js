import * as coin from './modules/coin.mjs'
import express from 'express'
import minimist from 'minimist'
import { getDb } from './src/services/database.js'

const app = express()
const args = minimist(process.argv.slice(2))
const db = getDb()

console.log(args)

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

const HTTP_PORT = (1 <= args.port && args.port <= 65535) ? args.port : 5555
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
})

const logging = (req, res, next) => {
    const query = db.prepare(`
        INSERT INTO accesslog (remoteaddr, remoteuser, time, method, 
        url, protocol, httpversion, status, referer, useragent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
    )
    const json = query.run(req.ip, req.user, Date.now(), req.method, req.url, req.httpVersion,
        req.protocol, req.statusCode, req.headers['referers'], req.headers['user-agent']
    )
    next()
}

app.use(express.json())

app.use(logging)

app.use(express.static('./public'))

app.get('/app', (req, res, next) => {
    res.type('text/plain')
    res.status(200).end('OK')
})

app.get('/app/flip', (req, res, next) => {
    res.type('application/json')
    res.status(200).json({ 'flip': coin.coinFlip() })
})

app.get('/app/flips/:number', (req, res) => {
    const raw = coin.coinFlips(parseInt(req.params.number))
    const summary = coin.countFlips(raw)
    res.type('application/json')
    res.status(200).json({ 'raw': raw, 'summary': summary })
})

app.post('/app/flip/coins', (req, res, next) => {
    const raw = coin.coinFlips(req.body.number)
    const summary = coin.countFlips(raw)
    res.type('application/json')
    res.status(200).json({ 'raw': raw, 'summary': summary })
})

app.get('/app/flip/call/:guess', (req, res) => {
    res.type('application/json')
    res.status(200).json(coin.flipACoin(req.params))
})

app.post('/app/flip/call', (req, res, next) => {
    res.type('application/json')
    res.status(200).json(coin.flipACoin(req.body.guess))
})

app.get('/app/log/access', (req, res, next) => {
    try {
        const query = db.prepare('SELECT * from accesslog').all()
        res.status(200).json(query)
    } catch {
        console.error(e)
    }
})

app.get('/app/error', (req, res, next) => {
    throw new Error('Error test successful.')
})

app.use(function (req, res, next) {
    res.type('text/plain')
    res.status(404).end('404 NOT FOUND')
})

