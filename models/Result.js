const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  Input : {
  	type: Number,
  	default: 0
  },
  Output : {
  	type: Number,
  	default: 0
  },
  Progress : {
  	type: Number,
  	default: 0
  }
});

const Result = mongoose.model('Result', ResultSchema);

module.exports.Result = Result;
module.exports.ResultSchema = ResultSchema;