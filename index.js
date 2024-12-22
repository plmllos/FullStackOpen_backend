const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :person"
  )
);

morgan.token("person", (request) => {
  if (request.method === "POST") {
    const { name, number } = request.body;
    return JSON.stringify({ name, number });
  }
});

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.send(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.send(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  const duplicatePerson = persons.find(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );

  if (!body.name) {
    return response.status(400).json({ error: "Name is missing" });
  }
  if (!body.number) {
    return response.status(400).json({ error: "Number is missing" });
  }
  if (duplicatePerson) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.random(100000),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get("/info", (request, response) => {
  response.send(
    `<p> Phonebook has info for ${
      persons.length
    } people <br /> ${new Date()} </p>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
