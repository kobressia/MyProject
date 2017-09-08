const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const utils = require('util');
const app = express();


const databaseFile = path.join(__dirname, 'database.json');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/static', express.static(path.join(__dirname, 'static')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



const getDb = () => new Promise((resolve, reject) => 
	fs.readFile(databaseFile, 'utf8', (err, data) => {
		if (err) {
			reject(err);
		} else {
			resolve(data);
		}
	})).then(data => JSON.parse(data));

const writeDbFile = utils.promisify(fs.writeFile);
const writeDb = data => {
	const str = JSON.stringify(data);
	return writeDbFile(databaseFile, str);
};



app.get('/index.html', (req, res) => {
    res.render('index');
});

app.get('/users/:id', (request, response) => {
	getDb().then(database => {
		const {users} = database;
		const userId = parseInt(request.params.id);
		const user = users.find(user => user.id === userId);

		response.json(user);
	});
});


app.post('/users', (request, response) => {
	// desctructuring
	const {firstName, lastName} = request.body;
	
	getDb().then(database => {
		const {users} = database;
		const maxId = Math.max.apply(null, users.map(user => user.id));
    	const id = maxId + 1;
    	const user = {id, fullName: firstName + ' ' + lastName};
		users.push(user);

		return writeDb(database).then(() => {
			response.json(user);
		})
	});
});

// app.post('/submitUser', (request, response) => {
//     const maxId = Math.max.apply(null, app.locals.users.map(user => user.id));
//     const id = maxId + 1;
//     const {firstName, lastName} = request.body;

//     app.locals.users.push({id, fullName: firstName + ' ' + lastName});

//     response.render('index');
// });


app.locals = {
	title: 'My title',
    users: [{id: 1, fullName: 'Jopa Mira'}]
};


app.listen(3000, () => {
	console.log("Server works on 3000");
});
