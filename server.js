import express from "express";
import fs from "fs";

import mongoose from "mongoose";
//make connection string to db (is doesn't exit, it creates)
mongoose.connect("mongodb://localhost:27017/ntdl-july-db").then(() => {
  console.log("Connected");
  // app.listen(PORT, (error) => {
  //     if (error) {
  //       console.log("Error while starting");
  //     } else {
  //       console.log("server started at port" + PORT);
  //     }
  //   });
});

const app = express();
const PORT = 4000;

//Task Schema
const taskSchema = new mongoose.Schema({
  task: String,
  hour: Number,
  type: String,
});

//Task Model: create collection Task with taskSchema
const Task = mongoose.model("Task", taskSchema);

const getUniqueId = () => {
  let idLength = 6;
  const str = "qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567890";

  let uniqueString = "";

  for (let i = 0; i < idLength; i++) {
    let randomPosition = Math.floor(Math.random() * str.length);

    uniqueString += str[randomPosition];
  }

  return uniqueString;
};

//use middleware to get the body
//always require, populates the request.body
app.use(express.json());

//Get request in baseurl
app.get("/", (req, res) => {
  res.send("Hi this is ntdl endpoint");
});

//create endpoint=/api/v1/task
//{{id,task,hour,type}}

//CREATE
app.post("/api/v1/tasks", async (req, res) => {
  //get the data
  let taskObj = req.body;

  const newTask = new Task(taskObj);

  await newTask.save(); //Or await Task.insertOne(taskObj);

  //read taskData
  //   let taskData = JSON.parse(fs.readFileSync("data/tasks.json")) || [];

  //   //   taskObj.id = taskData[taskData.length - 1].id + 1;

  //   //push new task to task database
  //   taskData.push(taskObj);
  //   fs.writeFileSync("data/tasks.json", JSON.stringify(taskData));

  res.status(201).send({
    status: "success",
    message: "resuqested",
  });
});

//read resource (all)
app.get("/api/v1/tasks", async (req, res) => {
  let query = {};
  if (req.query?.type) {
    query.type = req.query.type;
  }

  let tasks = await Task.find();

  res.status(200).send({
    status: "success",
    message: "Tasks found",
    tasks,
  });
});

//read specific task (findOne) witn id
app.get("/api/v1/tasks/:id", async (req, res) => {
  let taskId = req.params.id;

  let task = await Task.findOne({ _id: taskId });

  res.status(200).send({
    status: "success",
    message: "Task found",
    task,
  });
});

//update type
// app.patch("/api/v1/tasks/:taskid", (req, res) => {
//   let updatedType = req.body.type;

//   let id = req.params.taskid;

//   let taskData = JSON.parse(fs.readFileSync("data/tasks.json")) || [];

//   //find task with id
//   let task = taskData.find((item) => item.id == id);

//   //update the type:
//   task.type = updatedType;

//   //write the data
//   fs.writeFileSync("data/tasks.json", JSON.stringify(taskData));

//   res.send("Task updated");
// });

//update any property: type? hour? task?
app.patch("/api/v1/tasks/:id", async (req, res) => {
  try {
    let id = req.params.id;

    let updatedProp = req.body;

    //finde the tas with id (type? hour? task?)
    let task = await Task.findByIdAndUpdate(id, updatedProp, { new: true });

    //or, if any diff than ID
    task = await Task.findOneAndUpdate({ _id: id }, updatedProp, { new: true });

    //return respondse
    res.send({
      status: "success",
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "Error",
      message: "Server Error",
    });
  }
});

//delete
app.delete("/api/v1/tasks/:taskid", async (req, res) => {
  let id = req.params.taskid;

  let tasks = await Task.findByIdAndDelete(id);

  //return response
  res.send({
    status: "success",
    message: "Task deleted",
    tasks,
  });
});

//delete all task with hour hours 10
app.delete("/api/v1/tasks", async (req, res) => {
  let hour = req.query?.hour;
  let tasks = await Task.deleteMany({ hour: hour });

  //return response
  res.send({
    status: "success",
    message: "Task deleted",
    tasks,
  });
});

//put this ath the end:
app.listen(PORT, (error) => {
  if (error) {
    console.log("Error while starting");
  } else {
    console.log("server started at port" + PORT);
  }
});
