'use strict'
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = module.exports.io = require('socket.io')(server)

const userRoute = require('./Routes/Users')
const quizzesRoute = require('./Routes/Quizzes')
let students = require('./data/students')

const PORT = process.env.PORT || 3231

app.use(express.json())
app.use('/API/users', userRoute)
app.use('/API/quizzes', quizzesRoute)

app.use(express.static(__dirname + '/../../build'))

io.on('connect', client => {
	client.on('login', body => {
		students.push({ name: body.username, id: client.id, quizCode: body.quizCode, mark: 0 })
		console.log(students)
	})
	client.on('mark', body => {
		let index = students.findIndex(std => std.id === client.id)
		students[index].mark = body.currentScore
		client.emit('mark', students.filter(std => std.quizCode === students[index].quizCode).sort((a, b) => a.mark > b.mark))
	})
	client.on('disconnect', () => {
		console.log('client disconnected:', client.id)
		const index = students.findIndex(std => std.id === client.id)
		students.splice(index, 1)
		console.log(students)
	});
});

app.use('*', (req, res) => {
	res.sendFile(__dirname, '../../build/index.html')
})


server.listen(PORT, ()=>{
	console.log("Connected to port:" + PORT);
})