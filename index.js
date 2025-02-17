require('dotenv').config()
const Person = require('./models/phonebook')
const express = require('express')
const app = express()

const morgan = require('morgan')
app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person'
  )
)

morgan.token('person', (request) => {
  if (request.method === 'POST') {
    const { name, number } = request.body
    return JSON.stringify({ name, number })
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then((result) => {
    response.send(result)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const updatedPerson = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
  })
    .then((updated) => {
      response.json(updated)
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then((count) => {
    response.send(`
        <p>Phonebook has info for ${count} people <br />
        ${new Date()}</p>
      `)
  })
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
