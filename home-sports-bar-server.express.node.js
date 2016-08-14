var Express = require('express');
var app = Express();

//static files directory
app.use(Express.static('public'));

//routing
//GET
app.get('/', function(request, response) {
    console.log('Connection received.');
    response.send('Hello World!');
});

//POST
app.post('/', function(request, response) {
    console.log('Connection received.');
    response.send('Hello World!');
});

//PUT
app.put('/', function(request, response) {
    console.log('Connection received.');
    response.send('Hello World!');
});

//DELETE
app.delete('/', function(request, response) {
    console.log('Connection received.');
    response.send('Hello World!');
});

//404 error
app.use(function(request, response, next) {
    console.log('404 error');
    response.status(404).send('Unable to return a response for the given request.');
})

//internal 500 error
app.use(function(error, request, response, next) {
    console.error(error.stack);
    response.status(500).send('Internal error');
});

app.listen(3000, function() {
    console.log('Example application listening on port 3000 for connections...');
});