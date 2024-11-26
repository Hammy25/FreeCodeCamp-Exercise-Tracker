const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

try{
  mongoose.connect(process.env.DB_URI);
}catch(err){
  console.log(err);
} 

const { Schema } = mongoose;
const userSchema = new Schema({
  username: { type: String, required: true }
});
const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  try{
    res.json(users.map(user => ({ username: user.username, _id: user._id })));
  }catch(err){
    res.json({ error: 'Username already taken' });
  }
});

app.post('/api/users', async (req, res) => {
  const username = req.body.username;
  const newUser = new User({ username });
  try {
    await newUser.save();
    res.json({ username, _id: newUser._id });
  }catch(err){
    res.json({ error: 'Username already taken' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  try{
    const user = await User.findById(userId);
    if(!user){
      return res.json({ error: 'User not found' });
    }
    const exerciseObject = new Exercise({
      userId,
      description,
      duration,
      date: date ? new Date(date) : new Date()
    });
    const exercise = await exerciseObject.save();
    res.json({
      _id: userId,
      username: user.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description
    });
  }catch(err){
    res.json({ error: 'Username already taken' });
  }
}
);

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  try{
    const user = await User.findById(userId);
    if(!user){
      return res.json({ error: 'User not found' });
    }
    const exercises = await Exercise.find({ userId });
    const logs = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));
    let filteredLogs = logs;
    if(from){
      filteredLogs = filteredLogs.filter(log => new Date(log.date) >= new Date(from));
    }
    if(to){
      filteredLogs = filteredLogs.filter(log => new Date(log.date) <= new Date(to));
    }
    if(limit){
      filteredLogs = filteredLogs.slice(0, limit);
    }
    res.json({
      _id: userId,
      username: user.username,
      count: filteredLogs.length,
      log: filteredLogs
    });
  }catch(err){
    res.json({ error: 'Username already taken' });
  }
}
);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
