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

class BambooComponent extends EventEmitter {
  constructor (options) {
    super()
    this.id = crypto.randomBytes(34).toString('hex')

    this.mqttClient = mqtt.connect(`mqtt://${options.mqttHost}:${options.mqttPort}`, {
      clientId: `Bamboo/${options.name}/component/${this.id}`
    })

    this.mqttClient.on('connect', () => {
      options.subscribes.forEach((s) => {
        this.mqttClient.subscribe(`Bamboo/${s}`)
      })
      this.emit('ready')
    })

    this.mqttClient.on('error', (err) => {
      winston.error(err)
    })

    this.mqttClient.on('message', (topic, message) => {
      let result = topic.match(/^Bamboo\/(\w+)/i)
      if (result && result.length === 2) {
        let action = result[1]
        let m = JSON.parse(message)
        if (m && m.id === this.id) {
          this.emit(action, m)
        }
      }
    })
  }
}

module.exports = BambooComponent
