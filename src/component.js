/*
 * +===============================================
 * | Author:        Parham Alvani (parham.alvani@gmail.com)
 * |
 * | Creation Date: 04-06-2017
 * |
 * | File Name:     component.js
 * +===============================================
 */
const mqtt = require('mqtt')
const winston = require('winston')
const crypto = require('crypto')
const EventEmitter = require('events')

class I1820Component extends EventEmitter {
  constructor (options) {
    super()

    this.mqttClient = mqtt.connect(`mqtt://${options.mqttHost}:${options.mqttPort}`, {
      clientId: `I1820/${options.name}/component/${crypto.randomBytes(34).toString('hex')}`
    })

    this.mqttClient.on('connect', () => {
      options.subscribes.forEach((s) => {
        this.mqttClient.subscribe(`I1820/${s}`)
      })
      this.emit('ready')
    })

    this.mqttClient.on('error', (err) => {
      winston.error(err)
    })

    this.mqttClient.on('message', (topic, message) => {
      let result = topic.match(/^I1820\/(\w+)/i)
      if (result && result.length === 2) {
        let action = result[1]
        this.emit(action, JSON.parse(message))
      }
    })
  }
}

module.exports = I1820Component
