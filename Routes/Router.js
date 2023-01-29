const express = require('express')
const Router = express.Router()

const API_KEY = process.env['API_KEY']
const MESSAGE_TIMEOUT = 20 * 1000 // 1 Minute

const commandEmitter = global.CommandEmitter

let actions = []
let length = 0

// Funcionatily
const isAutenticated = (request, response, next) => {
  const body = request.body
  if (!body || body.API_KEY !== API_KEY) {
    return response.status(403).send({
      message: 'Invalid API_KEY',
      success: false
    })
  }

  return next()
}

Router.post('/actions/get', isAutenticated, (_request, response) => {
  return response.send(
    actions.map((value) => {
      return {
        action: value.action,
        target: value.target,
        id: value.id,
        placeId: value.placeId,
        admin: value.interaction.user.tag
      }
    })
  )
})

Router.post('/actions/end', isAutenticated, (request, response) => {
  const body = request.body
  if (!body.success || !body.message || !body.id) {
    return response.status(400)
  }

  const interaction = actions.find(
    (element) => element.id === body.id
  )?.interaction

  actions = actions.filter((element) => element.id !== body.id)

  commandEmitter.emit('ActionCompleted', {
    id: body.id,
    message: body.message,
    success: body.success,
    interaction: interaction
  })

  return response.send({
    message: 'Success',
    success: true
  })
})

commandEmitter.on('RequestAction', (data) => {
  const newId = ++length
  setTimeout(() => {
    actions = actions.filter((element) => element.id !== newId)

    commandEmitter.emit('ActionCompleted', {
      id: newId,
      message: 'Action not received any response from Roblox Servers',
      success: false,
      isTimeout: true,
      interaction: data.interaction,
      place: data.place
    })
  }, MESSAGE_TIMEOUT)

  return actions.push({
    action: data.action,
    target: data.target,
    id: newId,
    interaction: data.interaction,
  })
})

module.exports = Router
