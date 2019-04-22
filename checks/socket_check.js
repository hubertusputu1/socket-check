'use strict'

const request = require('request')
const io = require('socket.io-client')
const Slack = require('../utils/slack')
const callAPI = require('../utils/callAPI')

const customerId = process.env.CUSTOMER_ID, 
    conversationId = process.env.CONVERSATION_ID,
    conversationSecret = process.env.CONVERSATION_SECRET,
    merchantId = process.env.MERCHANT_ID, 
    apiHost = process.env.API_HOST

let isReceived = false, isConnected = false
let currentTime = new Date()
let socket = ''

const sendMessageResponse = (error, response) => {
    console.log(error, response.statusCode, response.body)
    if(!error && response.statusCode === 200) {
        console.log('\nmessage sent ' + currentTime + '\n');
    }
    setTimeout(() => {
        console.log('\nchecking message ' + currentTime + '\n');
        if(!isReceived) {
            console.log('\nsending alert to slack channel ' + currentTime + '\n');
            const alertText = 'SOCKET ALERT: Socket does not receive message!';
            Slack.sendServerAlert(alertText)
        }
    }, 10000)
}

const sendMessage = () => {
    if(!isConnected) return

    currentTime = new Date()
    console.log('\nsending message ' + currentTime + '\n');
    isReceived = false
    callAPI.sendMessage({apiHost, customerId, merchantId, conversationSecret, conversationId}, sendMessageResponse)
}

let logEvent = name => (args) => {
    console.log('\nsocket event', name, args)
}

const checkSocket = () => {
    socket.on('connect', () => {
        isConnected = true
        console.log('\nconnected to socket')
    })
    
    socket.on('reconnect', logEvent('reconnect'))
    socket.on('reconnect_attempt', logEvent('reconnect_attempt'))
    socket.on('reconnecting', logEvent('reconnecting'))
    socket.on('error', logEvent('error'))
    socket.on('disconnect', logEvent('disconnect'))
    
    socket.on('newMsg', (msg) => {
        console.log('\nmessage received ' + currentTime + '\n');
        console.log(msg)
        isReceived = true
    })
    
    setInterval(sendMessage, 60000)
}

const getWebsocket = (callback) => {
    callAPI.wsTicket({apiHost, customerId, merchantId, conversationSecret, conversationId}, (err, res) => {
        if(err) console.log('error creating websocket ticket ', err)
        else callback(res.data.ticket)
    })
}

const connectToSocket = ticket => {
    socket = io(apiHost + '?ticket=' + ticket + '&channel=widget', {
        transports: ['websocket']
    })

    checkSocket()
}

getWebsocket(connectToSocket)

