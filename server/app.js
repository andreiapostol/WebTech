var createError = require('http-errors');
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var Promise = require('bluebird');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// var memorydb = new sqlite3.Database(':memory:');
var newdb = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
}); 

const port = process.env.PORT || 3001;

newdb.serialize(function() {
  // db.run("CREATE TABLE lorem (info TEXT)");
 
  // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  // for (var i = 0; i < 10; i++) {
  //     stmt.run("Ipsum " + i);
  // }
  // stmt.finalize();
 
  newdb.each("SELECT * FROM RANKINGS", function(err, row) {
      console.log(row);
  });
});
 

app.get('/rankings/id/:id', async (req, res, next) => {
  try {
    newdb.serialize(function() {  
      let statement = newdb.prepare("SELECT * FROM RANKINGS WHERE ID = (?)");   
      statement.all(req.params.id, function(err, rows) {
        res.json(rows);
        return res;
      })
    });
  } catch (err) {
    console.log('ERROR IN ID RANKING RETRIEVAL');
    next(err);
  }
});

app.get('/rankings/score_range/:beginAt/:endAt', async (req, res, next) => {
  try {
    newdb.serialize(function() {
      let statement = newdb.prepare(`WITH temp AS (
        SELECT id, name, score, row_number() OVER (ORDER BY id) AS rownum
        FROM RANKINGS
    )
    SELECT ID, NAME, SCORE FROM temp WHERE rownum >= ` + req.params.beginAt + ` AND rownum <= ` + req.params.endAt + `;`);

    // TODO: PREPARED STATEMENTS
    
      statement.all(function(err, rows){
        console.log(JSON.stringify(statement));
        res.json(rows);
      });
    });
  } catch (err) {
    console.log('ERROR IN BEGIN - END IDS RETRIEVAL');
    next(err);
  }
});



 
app.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
