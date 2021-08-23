'use strict'
const express = require('express')
const app = express()
const path = require('path')
const userRoute = require('./Routes/Users')
const quizzesRoute = require('./Routes/Quizzes')
const cors = require('cors')
const server = require('http').createServer();
const io = require('socket.io')(server, {
	origins: ['http://localhost:8000', 'https://arcane-atoll-82454.herokuapp.com'],
	cors: { origin: '*' }
});
let students = require('./data/students')
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

// Hosting Frontend
// Create a production build of the frontend and paste the files in the public folder
app.use(express.json())
app.use('/API/users', userRoute)
app.use('/API/quizzes', quizzesRoute)

app.use(express.static(path.join(__dirname, '../../build')))
app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../build/index.html'))
})

// Middleware


// app.use(express.static(path.join(__dirname, 'build')));
// app.use('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, '/public/index.html'))
// })
// Listening to APIs

app.listen(process.env.PORT || 8000, () =>
	console.log('Listening on Port ' + process.env.PORT || 8000)
)

server.listen(4000)