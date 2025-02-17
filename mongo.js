const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://popovicmilos:${password}@cluster0.wtx8e.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

if (person.name) {
  person.save().then((result) => {
    const { name, number } = result
    console.log(`added ${name} ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then((result, response) => {
    console.log('Phonebook:')
    result.forEach((person) => {
      response.send(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
