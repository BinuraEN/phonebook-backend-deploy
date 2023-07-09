require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const Contact = require("./models/contact");

const app = express();
app.use(cors());
app.use(express.static("build"));

app.use(express.json());

morgan.token("content", (req, res) => JSON.stringify(req.body));
const requestLogger = morgan(
  ":method :url :status :req[content-length] - :response-time[3] ms :content",
  {
    skip: (req, res) => req.method !== "POST",
  }
);
app.use(requestLogger);

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
app.get("/api/info", (request, response) => {
  const date = new Date();
  Contact.count().then((result) => {
    response.send(`<p>Phonebook has info for ${result} people</p>
    <p>${date}</p>`);
  });
});

app.get("/api/persons", (request, response) => {
  Contact.find()
    .then((result) => response.json(result))
    .catch((err) => {
      console.log("error: ", err);
    });
});

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        response.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (request, response, next) => {
  const entry = request.body;

  if (
    entry.name === null ||
    entry.name === "" ||
    entry.name === undefined ||
    entry.number === null ||
    entry.number === "" ||
    entry.number === undefined
  ) {
    response.status(400).json({ error: "name or number cannot be empty" });
  } else if (persons.find((p) => p.name === entry.name)) {
    response.status(400).json({ error: "name must be unique" });
  } else {
    const contact = new Contact({
      name: entry.name,
      number: entry.number,
    });
    contact
      .save()
      .then((result) => {
        response.status(201).send(result);
      })
      .catch((err) => {
        next(err);
      });
  }
});

app.put("/api/persons/:id", (request, response, next) => {
  const entry = request.body;

  if (
    entry.name === null ||
    entry.name === "" ||
    entry.name === undefined ||
    entry.number === null ||
    entry.number === "" ||
    entry.number === undefined
  ) {
    response.status(400).json({ error: "name or number cannot be empty" });
  } else if (persons.find((p) => p.name === entry.name)) {
    response.status(400).json({ error: "name must be unique" });
  } else {
    const contact = {
      name: entry.name,
      number: entry.number,
    };
    Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
      .then((result) => {
        response.status(201).send(result);
      })
      .catch((err) => {
        next(err);
      });
  }
});

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      if (!result) {
        response.status(404).end();
      } else {
        response.status(204).end();
      }
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id!" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`app listening on port: ${PORT}`);
});
