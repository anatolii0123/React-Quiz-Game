const express = require('express')
const ObjectId = require('mongodb').ObjectId
const Router = express.Router()
const DB = require('./DB')
let { students } = require('../data/students')

// Create User in DB
Router.post('/create', (req, res) => {
	DB.createUser(req.body, res)
})

Router.post('/login', (req, res) => {
	DB.login(req.body, res)
})

// Get user Data
Router.get('/:uid', (req, res) => {
	const uid = req.params.uid
	if (!uid) return res.status(500).json({ error: 'Incomplete Parameters' })
	DB.withDB(async (db) => {
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
		const createdQuiz = await createdCursor.toArray()
		const userCursor = await db.collection('users').find({ uid }).project({
			attemptedQuiz: 1,
		})
		const userInfo = await userCursor.toArray()
		if (userInfo) {
			res.status(200).json({ createdQuiz })
		} else {
			res.status(200).json({ createdQuiz })
		}
	}, res)
})

module.exports = Router
