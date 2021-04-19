const express = require('express');
const WebSocket = require("ws");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const reslt = require('../models/Result');
const User = require('../models/User');
const serverQue = [];
const used = [null, null];
const socketServer = new WebSocket.Server({ port: 8077 });

function evaluate()
{
  var best = -1;
  for (var i = 0; i < 2; i++) 
  {
    if (used[i] === null)
    {
      best = i;
      break;
    }
  }
  if (best === -1)
  {
    return;
  }
  used[best] = true;
  ws[best].send(JSON.stringify({object : serverQue[0]}));
  serverQue.shift();
}

function updateProgress(serverId, userId, taskId, result)
{
  used[serverId] = null;
  User.findOneAndUpdate({_id : userId, "results._id" : taskId}, 
    {$set : {"results.$.Progress" : 100, "results.$.Output" : result}}, 
    function(err, user) {
  });

  if (serverQue.length > 0)
  {
    evaluate();
  } 
}

socketServer.on('connection', function connection(webs) {
  webs.on('message', function (event)
  {
    var ids = JSON.parse(event);
    for (id of ids)
    {
      User.findOne({"results._id" : id}, 'results.$', function(err, result)
      {
        if (err)
        {
          throw err;
        }
        res = result.results[0];
        if (res.Output > 0)
        {
          webs.send(JSON.stringify({taskId : res._id, progress : res.Progress, result : res.Output}));
        }
        else
        {
          webs.send(JSON.stringify({taskId : res._id, progress : res.Progress}));          
        }

      });
    }
  });
});

var ws = [new WebSocket('ws://127.0.0.1:8080'), new WebSocket('ws://127.0.0.1:8081')];
for (let i = 0; i < ws.length; ++i)
{
    ws[i].on('message', function(event)
    {
      var msg = JSON.parse(event);
      var userId = msg.userId;
      var taskId = msg.taskId;
      User.findOneAndUpdate({_id : userId, "results._id" : taskId}, 
        {$set : {"results.$.Progress" : msg.progress}}, 
        function(err, user) {
        if (msg.status === "result")
        {
          updateProgress(i, msg.userId, msg.taskId, msg.result);
        }             
      });
    });
}

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

router.get('/new_calculation', ensureAuthenticated, (req, res) => res.render('new_calculation'));

router.post('/new_calculation', (req, res) => {
  const { number } = req.body;
  let errors = [];

  if (!number || number <= 1 || number > 1000000000) {
    errors.push({ msg: 'Please enter number in range [2, 10^9]' });
  }
  if (serverQue.length > 7)
  {
    errors.push({msg: 'The maximum number of tasks running on the server has been exceeded. Please wait!'})
  }

  if (errors.length > 0) {
    res.render('new_calculation', {
      errors,
      number
    });
  } else {
    const newResult = new reslt.Result({
      Input : number,
      Output : 0,
      Progress : -1
    });

    req.user.results.push(newResult);
    req.user.save();
    var task = {
      userId : req.user._id,
      taskId : newResult._id,
      N : number,
      Progress : 0  
    }
    serverQue.push(task);
    evaluate();
    res.redirect('calculations');
  }
});

router.get('/calculations', ensureAuthenticated, (req, res) => {  
  var results = req.user.results;
  var arr = []
  for (var i = 0; i < 10; ++i)
  {
    if (results.length - 1 - i >= 0)
    {
      arr.push(results[results.length - i - 1]);
    }
  }
  res.render('calculations', {
    results : arr
  })
});


module.exports = router;
