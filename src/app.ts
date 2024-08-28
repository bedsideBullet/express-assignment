import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello World!" });
});

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });

  if (!dog) {
    return res.status(204).send();
  }
  res.send(dog);
});

app.post("/dogs", async (req, res) => {
  const errors = [];

  const { name, age, breed, description, ...invalidkeys } =
    req.body;
  const invalidkeysArray = Object.keys(invalidkeys);

  if (invalidkeysArray.length > 0) {
    const errors = invalidkeysArray.map(
      (key) => `'${key}' is not a valid key`
    );
    return res.status(400).json({ errors });
  }

  const ageNumber = +age;
  if (age === null || isNaN(ageNumber)) {
    errors.push("age should be a number");
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newDog = await prisma.dog.create({
      data: {
        name,
        age: ageNumber,
        breed,
        description,
      },
    });
    res.status(201).send(newDog);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ errors: ["An unexpected error occurred"] });
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const { name, age, breed, description, ...invalidkeys } =
    req.body;
  const invalidkeysArray = Object.keys(invalidkeys);

  if (invalidkeysArray.length > 0) {
    const errors = invalidkeysArray.map(
      (key) => `'${key}' is not a valid key`
    );
    return res.status(400).json({ errors });
  }

  try {
    const newDog = await prisma.dog.update({
      where: {
        id,
      },
      data: {
        name,
        age,
        breed,
        description,
      },
    });
    res.status(201).send(newDog);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!dog) {
    return res.status(204).send();
  }

  await prisma.dog.delete({
    where: { id },
  });
  return res.status(200).json(dog);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
