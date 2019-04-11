'use strict'

const request = require('request')
const io = require('socket.io-client')
// const Slack = require('../utils/slack')
const Slack = require('slack-node');
let slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK)

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
            }
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
        console.log('\n\n\n message sent ' + currentTime + '\n\n\n');
    }
    setTimeout(() => {
        console.log('\n\n\n checking message ' + currentTime + '\n\n\n');
        if(!isReceived) {
            console.log('\n\n\n sending alert to slack channel ' + currentTime + '\n\n\n');
            sendServerAlert()
        }
    }, 10000)
}

const sendServerAlert = () => {
	var alertText = 'SOCKET ALERT: Socket does not receive message';
	slack.webhook({
		channel: process.env.SLACK_CHANNEL,
		username: "server-bot",
		text: alertText
	}, function(err, response) {
        console.log('alert is sent to slack')
	})
}

const sendMessage = () => {
    if(!isConnected) return

    currentTime = new Date()
    console.log('\n\n\n sending message ' + currentTime + '\n\n\n');
    isReceived = false
    request.post(options, sendMessageResponse)
}

socket.on('connect', () => {
    isConnected = true
    console.log('connected to socket')
})

let logEvent = name => (args) => {
    console.log('socket event', name, args)
}

socket.on('reconnect', logEvent('reconnect'))
socket.on('reconnect_attempt', logEvent('reconnect_attempt'))
socket.on('reconnecting', logEvent('reconnecting'))
socket.on('error', logEvent('error'))
socket.on('disconnect', logEvent('disconnect'))
// socket.on('reconnect', logEvent('reconnect'))

socket.on('newMsg', (msg) => {
    console.log('\n\n\n message received ' + currentTime + '\n\n\n');
    console.log(msg)
    isReceived = true
})

setInterval(sendMessage, 60000)