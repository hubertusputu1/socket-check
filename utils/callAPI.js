'use strict'

const request = require('request')

/**
 * 
 * @param {{apiHost: String, customerId: String, merchantId: String, conversationSecret: String, conversationId: String}} data
 * @param {Function} callback
 */
const sendMessage = (data, callback) => {
    const options = {
        url: data.apiHost + '/api/v1/widget/message/send',
        headers: {
            'Content-Type': 'application/json',
            'x-customer-id': data.customerId,
            'x-conversation-id': data.conversationId,
            'x-merchant-id': data.merchantId,
            'x-conversation-secret': data.conversationSecret,
        },
        json: {
            "type": "text",
            "msgType": "text", 
            "text": "test_socket", 
            "payload": null 
        }
    }

	request.post(options, (err, res) => {
        if(err) return callback(err)
        return callback(null, res.body)
    })
}

/**
 * 
 * @param {{apiHost: String, customerId: String, merchantId: String, conversationSecret: String, conversationId: String}} data
 * @param {Function} callback 
 */
const wsTicket = (data, callback) => {
    const options = {
        url: data.apiHost + '/api/v1/widget/websocket/ticket',
        headers: {
            'Content-Type': 'application/json',
            'x-customer-id': data.customerId,
            'x-conversation-id': data.conversationId,
            'x-merchant-id': data.merchantId,
            'x-conversation-secret': data.conversationSecret,
            'x-timezone': (new Date()).getTimezoneOffset() / 60,
        }
    }

	request.post(options, (err, res) => {
        if(err) return callback(err)
        return callback(null, JSON.parse(res.body))
    })
}

module.exports = {
    sendMessage,
    wsTicket
}