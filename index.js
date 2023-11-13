const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

morgan.token("body", (req, res) => {
 return JSON.stringify(req.body);
});
app.use(
 morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
 {
  id: 1,
  name: "Arto Hellas",
  number: "040-123456",
 },
 {
  id: 2,
  name: "Ada Lovelace",
  number: "39-44-5323523",
 },
 {
  id: 3,
  name: "Dan Abramov",
  number: "12-43-234345",
 },
 {
  id: 4,
  name: "Mary Poppendieck",
  number: "39-23-6423122",
 },
];

app.get("/", (request, response) => {
 response.send("<h1>PhoneBook</h1>");
 morgan(":method :url :status :res[content-length] - :response-time ms");
});

app.get("/api/persons", (request, response) => {
 response.json(persons);
});

app.get("/api/info", (request, response) => {
 response.send(`
 <p>Phonebook has info for ${persons.length} people</p>
 <p>${new Date().toString()}</p>
 `);
});

app.get("/api/persons/:id", (request, response) => {
 const id = Number(request.params.id);
 const person = persons.find((person) => person.id === id);
 if (person) {
  response.json(person);
 } else {
  response.status(404).end();
 }
});

app.delete("/api/persons/:id", (request, response) => {
 const id = Number(request.params.id);
 persons = persons.filter((person) => person.id !== id);

 response.status(204).end();
});
function generateId() {
 return Math.round(Math.random() * 100);
}
app.post("/api/persons", (request, response) => {
 const body = request.body;

 if (!body.name || !body.number) {
  return response.status(400).json({
   error: "content missing",
  });
 }

 const personExists = persons.find(
  (person) => person.name === body.name || person.number === body.number
 );

 if (personExists) {
  return response.status(400).json({
   error: "name must be unique",
  });
 } else {
  const person = {
   id: generateId(),
   name: body.name,
   number: body.number,
  };
  persons = persons.concat(person);

  response.json(person);
 }
});

const PORT = 3001;
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
