const createError = require('http-errors');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());

app.use(bodyParser.json());
// const memorydb = new sqlite3.Database(':memory:');
const newdb = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

const port = process.env.PORT || 3001;

newdb.serialize(function() {
    // db.run("CREATE TABLE lorem (info TEXT)");

    // const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (const i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();

    newdb.each("SELECT * FROM rankings", function(err, row) {
        console.log(row);
    });
});


app.get('/ranksRange', (req, res) => {
    try {
        newdb.serialize(function() {
            let statement = newdb.prepare(`WITH temp AS (
        SELECT id, name, score, row_number() OVER (ORDER BY SCORE DESC) AS rownum
        FROM rankings
    )
    SELECT ID, NAME, SCORE FROM temp WHERE rownum >= ` + req.query.beginAt + ` AND rownum <= ` + req.query.endAt + `;`);

            // TODO: PREPARED STATEMENTS

            statement.all(function(err, rows) {
                res.json(rows);
            });
        });
    } catch (err) {
        console.log('ERROR IN BEGIN - END IDS RETRIEVAL');
    }
});

app.post('/submitScore', (req, res) => {
    console.log(req.body);
    const name = req.body.name;
    const score = req.body.score;
    try {
        newdb.run(`INSERT INTO RANKINGS(USERNAME, SCORE) VALUES (?, ?)`, [name, score]);
    } catch (err) {
        console.log(err);
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