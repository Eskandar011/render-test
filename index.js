require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();

//Model
const Person = require("./models/person");

//Functions
const errorHandler = (error, request, response, next) => {
 console.log(error);
 if (error.name === "CastError") {
  return response.status(400).send({ error: "malformatted id" });
 } else if (error.name === "ValidationError") {
  return response.status(400).json({ error: error.message });
 }
 next(error);
};

//Middlewares
app.use(express.json());
morgan.token("body", (req, res) => {
 return JSON.stringify(req.body);
});
app.use(
 morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(express.static("dist"));

//REST API
app.get("/", (request, response) => {
 response.send("<h1>PhoneBook</h1>");
 morgan(":method :url :status :res[content-length] - :response-time ms");
});

app.get("/api/persons", (request, response) => {
 Person.find({}).then((persons) => {
  response.json(persons);
 });
});

app.get("/api/info", (request, response) => {
 Person.find({}).then((persons) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
    `);
 });
});

app.get("/api/persons/:id", (request, response, next) => {
 const id = request.params.id;
 Person.findById(id)
  .then((person) => {
   if (person) {
    response.json(person);
   } else {
    response.status(404).end();
   }
  })
  .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
 const id = request.params.id;
 Person.findByIdAndRemove(id)
  .then((result) => response.status(204).end())
  .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
 const body = request.body;

 if (!body.name || !body.number) {
  return response.status(400).json({
   error: "content missing",
  });
 }

 const person = new Person({
  name: body.name,
  number: body.number,
 });

 person
  .save()
  .then((savedPerson) => {
   response.json(savedPerson);
  })
  .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
 const id = request.params.id;
 const body = request.body;
 const person = {
  name: body.name,
  number: body.number,
 };

 Person.findByIdAndUpdate(id, person, {
  new: true,
  runValidators: true,
  context: "query",
 })
  .then((updatedNote) => {
   response.json(updatedNote);
  })
  .catch((error) => next(error));
});
//Middleware for errorhandler
app.use(errorHandler);

//Port
const PORT = process.env.PORT;
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
