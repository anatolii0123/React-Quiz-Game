const express = require('express')
const Router = express.Router()
const DB = require('./DB')
const ObjectId = require('mongodb').ObjectId
let { students, clients, tests } = require('../data/students')

// Get Quiz Data
Router.post('/join', (req, res) => {
	const { quizId } = req.body
	if (!quizId)
		return res.status(500).json({ error: 'Incomplete Parameters' })

	DB.withDB(async (db) => {
		try {
			const cursor = db
				.collection('quizzes')
				.find({ _id: new ObjectId(quizId) })
				.project({
					// Excluded Fields
					responses: 0
				})

			const quizData = await cursor.toArray()
			if (!quizData[0].isOpen)
				res.status(500).json({ error: 'ERR:QUIZ_ACCESS_DENIED' })
			else {
				res.status(200).json(quizData[0])
			}
		} catch (error) {
			res.status(500).json({ error: 'ERR:QUIZ_NOT_FOUND' })
		}
	}, res)
})

Router.post('/upload', (req, res) => {
	if (req.files === null) {
		return res.status(400).json({ msg: 'No file uploaded' });
	}
	const file = req.files.file;

	file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
		if (err) {
			console.error(err);
			return res.status(500).send(err);
		}

		res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
	});
})

// Submit the quiz
Router.post('/submit', (req, res) => {
	const quiz = req.body
	if (!quiz) return res.status(500).json({ error: 'Incomplete Parameters' })
	DB.submitQuiz(quiz, res)
})

// Create Quiz
Router.post('/create', (req, res) => {
	const quiz = req.body
	if (!quiz) return res.status(500).json({ error: 'Incomplete Parameters' })

	quiz.questions.forEach((question, i) => {
		question['id'] = i + 1
	})
	DB.createQuiz(quiz, res)
})

Router.delete('/:id', (req, res) => {
	const id = req.params.id
	DB.withDB(async (db) => {
		try {
			await db.collection('quizzes').deleteOne(
				{
					_id: new ObjectId(id)
				},
				(err, result) => {
					if (err) throw err
					res.status(200).json({
						id
					})
				}
			)
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

Router.post('/edit', (req, res) => {
	const { quizId, title, questions, isOpen, type } = req.body

	DB.withDB(async (db) => {
		try {
			await db.collection('quizzes').updateOne(
				{
					$and: [{ _id: ObjectId(quizId) }],
				},
				{
					$set: {
						title,
						questions,
						isOpen,
						type
					},
				},
				(err, result) => {
					if (err) throw err
					res.status(200).json({
						message: 'Success',
					})
				}
			)
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

Router.post('/responses', (req, res) => {
	const reqBody = req.body
	DB.getResponses(reqBody, res)
})

Router.post('/start', (req, res) => {
	console.log('backend starting quiz:', req.body.id, clients, clients.filter(client => client.quizCode === req.body.id).length)
	clients.filter(client => client.quizCode === req.body.id).map(clnt => clnt.client.emit('start'))
	tests.push(req.body.id)
	res.status(200).json({
		message: 'Success'
	})
})

Router.post('/stop', (req, res) => {
	console.log('backend stopping quiz:', req.body.id)
	// clients.filter(client => client.quizCode === req.body.id).map(clnt => clnt.client.emit('start'))
	clients = clients.filter(client => client.quizCode !== req.body.id)
	tests = tests.filter(test => test !== req.body.id)
	students = students.filter(student => student.quizCode !== req.body.id)
	res.status(200).json({
		message: 'Success'
	})
})

Router.get('/all', (req, res) => {
	DB.withDB(async (db) => {
		try {
			const createdCursor = db
				.collection('quizzes')
				.find({
				})
				.project({
					_id: 1,
					isOpen: 1,
					title: 1,
					questions: 1,
					type: 1
				})
			const quizData = await createdCursor.toArray();
			res.status(200).json({
				quizData,
				tests
			})
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

Router.get('/:id', (req, res) => {
	const { id } = req.params
	DB.withDB(async (db) => {
		try {
			const createdCursor = db
				.collection('quizzes')
				.find({ _id: new ObjectId(id) })
				.project({
					isOpen: 1,
					title: 1,
					questions: 1,
					type: 1,
					responses: {
						$size: '$responses',
					},
				})
			const quizData = await createdCursor.toArray();
			res.status(200).json({
				quizData: quizData[0]
			})
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

Router.get('/', (req, res) => {
	DB.withDB(async (db) => {
		try {
			const createdCursor = db
				.collection('quizzes')
				.find({
					isOpen: true
				})
				.project({
					_id: 1,
					isOpen: 1,
					title: 1,
					questions: 1,
					type: 1
				})
			const quizData = await createdCursor.toArray();
			res.status(200).json({
				quizData,
				tests
			})
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

module.exports = Router
