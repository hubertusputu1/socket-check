'use strict'

const request = require('request')
const io = require('socket.io-client')
const Slack = require('../utils/slack')

const customerId = process.env.CUSTOMER_ID, 
    conversationId = process.env.CONVERSATION_ID,
    conversationSecret = process.env.CONVERSATION_SECRET,
    merchantId = process.env.MERCHANT_ID, 
    apiHost = process.env.API_HOST,
    transportOptions = { 
        transportOptions: {
            polling: {
                extraHeaders: {
                    conversationId: conversationId,
                    customerId: customerId,
                    conversationSecret: conversationSecret,
                    merchantId: merchantId,
                    channel: 'widget'
                }
            },
            }
        }
let isReceived = false, isConnected = false
let currentTime = new Date()

const socket = io.connect(apiHost, transportOptions)

const options = {
    url: apiHost + '/api/v1/widget/message/send',
    headers: {
        'Content-Type': 'application/json',
        'x-customer-id': customerId,
        'x-conversation-id': conversationId,
        'x-merchant-id': merchantId,
        'x-conversation-secret':conversationSecret
    },
    json: {
        "type": "text",
        "msgType": "text", 
        "text": "test_socket", 
        "payload": null 
    }
}

const sendMessageResponse = (error, response, body) => {
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
    request.post(options, sendMessageResponse)
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

checkSocket()

