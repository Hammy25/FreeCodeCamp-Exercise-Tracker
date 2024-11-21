const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let users = [
  {
    _id: "5fb5853f734231456ccb3b05",
    username: "player1",
  },
  {
    _id: "5fb5853f734231456ccb3b06",
    username: "player2",
  },
  {
    _id: "5fb5853f734231456ccb3b07",
    username: "player3",
  },
  {
    _id: "5fb5853f734231456ccb3b08",
    username: "player4",
  },
];

let activities = [
  {
    _id:"5fb5853f734231456ccb3b05",
    activities: [
      {description: "running", duration: 50, date:"2024-11-10"},
      {description: "lifting", duration: 80, date:"2024-11-11"},
      {description: "swimming", duration: 50, date:"2024-11-12"},
    ]
  },
  {
    _id:"5fb5853f734231456ccb3b06",
    activities: [
      {description: "running", duration: 50, date:"2024-11-10"},
      {description: "lifting", duration: 80, date:"2024-11-11"},
      {description: "swimming", duration: 50, date:"2024-11-12"},
    ]
  },
  {
    _id:"5fb5853f734231456ccb3b07",
    activities: [
      {description: "running", duration: 50, date:"2024-11-10"},
      {description: "lifting", duration: 80, date:"2024-11-11"},
      {description: "swimming", duration: 50, date:"2024-11-12"},
    ]
  },
  {
    _id:"5fb5853f734231456ccb3b08",
    activities: [
      {description: "running", duration: 50, date:"2024-11-10"},
      {description: "lifting", duration: 80, date:"2024-11-11"},
      {description: "swimming", duration: 50, date:"2024-11-12"},
    ]
  },
];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {
  return res.status(200).json({
    username: req.body.username,
    _id: "5fb5853f734231456ccb3b09"
  })
});

app.get("/api/users", (req,res) => {
  return res.status(200).json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const user_id = req.params._id;
  const duration = req.body.duration;
  const description = req.body.description;
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const user = users.find(u => u._id === user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newExercise = {
    description,
    duration: Number(duration),
    date: date.toDateString()
  };

  return res.status(200).json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    _id: user._id,
    date: newExercise.date
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(a => a._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  let acts = activities.find(a=> a._id === userId);
  let logs = acts.activities;
  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  return res.status(200).json({
    _id: userId,
    username: user.username,
    count: logs.length,
    log: logs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
