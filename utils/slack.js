'use-strict'
const Slack = require('slack-node');
let slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK)

/**
 * 
 * @param {*} data 
 */
const sendServerAlert = (data) => {
	slack.webhook({
		channel: process.env.SLACK_CHANNEL,
		username: "server-bot",
		text: data
	}, function(err, response) {
        console.log('alert is sent to slack')
	})
}

module.exports = {
    sendServerAlert
}