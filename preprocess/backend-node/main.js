const express = require('express'),
    app = express(),
    bodyparser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    ip = 'localhost',
    port = 8089

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/', bodyparser.json({
    limit: '50mb'
}))
app.use('/', bodyparser.urlencoded({
    extended: true,
    limit: '50mb'
}))

app.use('/img', require('./img'))
app.use('/data', require('./data'))
app.use('/categories', require('./categories'))
fs.readdirSync('./couch').map((dir) => {
    app.use('/' + dir, express.static(path.join(__dirname, './couch/' + dir)))
})
app.use('/', express.static(path.join(__dirname, './final')))

app.listen(port, () => {
    console.log('Server on ' + port)
})