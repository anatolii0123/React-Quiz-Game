const express = require('express')
const Router = express.Router()
const DB = require('./DB')
const ObjectId = require('mongodb').ObjectId
let students = require('../data/students')

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
				/*
				const cursor2 = db.collection('users').find({
					$and: [{ uid }, { attemptedQuiz: ObjectId(quizId) }],
				})

				const quiz2 = await cursor2.toArray()
				console.log('quiz 2 : ', quiz2)
				if (quiz2[0]) {
					console.log('in quiz already attempted')
					res.status(200).json({
						error: 'ERR:QUIZ_ALREADY_ATTEMPTED',
					})
				} else res.status(200).json(quizData[0])
				*/
				res.status(200).json(quizData[0])
			}
		} catch (error) {
			res.status(500).json({ error: 'ERR:QUIZ_NOT_FOUND' })
		}
	}, res)
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
	console.log('deleting:',id)
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
	const { quizId, uid, title, questions, isOpen } = req.body

	DB.withDB(async (db) => {
		try {
			await db.collection('quizzes').updateOne(
				{
					$and: [{ uid }, { _id: ObjectId(quizId) }],
				},
				{
					$set: {
						title,
						questions,
						isOpen,
					},
				},
				(err, result) => {
					if (err) throw err
					res.status(200).json({
						message: 'Quiz Updated Successfully.',
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
	console.log('Req Body : ', reqBody)
	DB.getResponses(reqBody, res)
})

Router.get('/', (req, res) => {
	DB.withDB(async (db) => {
		try {
			const createdCursor = db
				.collection('quizzes')
				.find({})
				.project({
					isOpen: 1,
					title: 1,
					questions: 1,
					responses: {
						$size: '$responses',
					},
				})
			const quizData = await createdCursor.toArray();
			res.status(200).json({
				quizData
			})
		} catch (error) {
			res.status(500).json({ error })
		}
	})
})

module.exports = Router
