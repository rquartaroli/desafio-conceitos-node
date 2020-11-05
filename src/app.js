const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');
const { json } = require("express");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next){
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  // console.time(logLabel);

  next();

  // console.timeEnd(logLabel);
}

function validateRepositorieId(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({ error: 'Invalid repositorie ID.'});
  }

  return next();

}

app.use(logRequests);
app.use('/repositories/:id', validateRepositorieId);

app.get("/repositories", (request, response) => {
  // const { title } = request.query;
  const { title } = request.body;

  const results = title
  ? repositories.filter(repositorie => repositorie.title.includes(title))
  : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { url, title, techs } = request.body;

  const repositorie = {id: uuid(), url, title, techs, likes: 0};

  repositories.push(repositorie);

  return response.json(repositorie);

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { url, title, techs } = request.body;

  const repositorieIndex = repositories.findIndex(repositorie => repositorie.id == id);

  if(repositorieIndex < 0){
    return response.status(400).json({error: 'Repositorie not found.'})
  }

  let keepLike = repositories[repositorieIndex].likes;

  const repositorie = {
    id,
    url,
    title,    
    techs,
    likes: keepLike
  };

  repositories[repositorieIndex] = repositorie;

  return response.json(repositorie);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositorieIndex = repositories.findIndex(repositorie => repositorie.id == id);

  if(repositorieIndex < 0){
    return response.status(400).json({error: 'Repositorie not found.'})
  }

  repositories.splice(repositorieIndex, 1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositorieIndex = repositories.findIndex(repositorie => repositorie.id == id);

  if(repositorieIndex < 0){
    return response.status(400).json({ error: 'Repositorie not found.'})
  }

  let keepTitle = repositories[repositorieIndex].title;
  let keepUrl   = repositories[repositorieIndex].url;
  let keepTechs = repositories[repositorieIndex].techs;

  let countLike = repositories[repositorieIndex].likes;
  countLike++;  

  const repositorie = {
    id,
    title: keepTitle,
    url: keepUrl,
    techs: keepTechs,
    likes: countLike
  };

  repositories[repositorieIndex] = repositorie;  

  return response.json(repositorie);

});

module.exports = app;
