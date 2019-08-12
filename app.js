var ent = require('ent');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, { wsEngine: 'ws' });
var todolist = [{"id":"task1","text":"task1"}];


app.get('/todo', function (req, res) {
    res.render('todo.ejs', { "todolist": todolist });
})


app.use(function (req, res, next) {
    res.redirect('/todo');
})


io.sockets.on('connection', function (socket) {

    //get request to add new item , brodcast the new item
    socket.on('addItem', function (item) {
        //Math.random().toString(36).substr(2, 9) generate almost a random alphanumerique string
        var newItem = { id: Math.random().toString(36).substr(2, 9), text: item };
        //var newItem = { id: Math.random().toString(36).substr(2, 9), text: ent.encode(item) }; we can add ent.encore to ensure securite
        socket.emit('addItem', newItem); //emit to user who send the request
        socket.broadcast.emit('addItem', newItem); //emit to others connected users
        todolist.push(newItem); //add the new item to our array
    });
    //get request to remove item , prodcast the deleted item
    socket.on('removeItem', function (itemId) {
        let indexOfTheItem = todolist.findIndex((item) => {
            return item.id == itemId;
        });
        let removedItem = todolist.splice(indexOfTheItem, 1); //get the item & remove it (2 in 1)
        socket.emit('removeItem', removedItem[0]);//emit to user who send the request
        socket.broadcast.emit('removeItem', removedItem[0]);//emit to others connected users
    });
});

server.listen(8080);   