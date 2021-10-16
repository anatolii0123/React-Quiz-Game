const { MongoClient } = require('mongodb')
const Evaluate = require('../Algorithms/EvaluateQuiz')
const ObjectId = require('mongodb').ObjectId
const API_KEY = require('../db-config').database
const jwt = require('jsonwebtoken')

let db
// const DBStart = async () => {
// 	console.log('DB server connecting...')
// 	const client = await MongoClient.connect(API_KEY, {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true
// 	})
// 	console.log('DB Connected Successfully.')
// 	db = client.db('quiz')
// }

const DBStart = async () => {
	console.log('DB server connecting...')
	const client = new MongoClient(API_KEY, { useNewUrlParser: true, useUnifiedTopology: true })//, { useNewUrlParser: true, useUnifiedTopology: true }
	try {
		await client.connect()
		db = client.db('quiz')
	}
	catch (e) {
		console.log(e);
	}
	// db = client.db("QuizAlharamain")
	// client.connect(err => {
	// 	db = client.db("test");
	// 	// perform actions on the collection object
	// });
}
DBStart()
const withDB = async (operations, res) => {
	try {
		await operations(db)
		// client.close()
	} catch (error) {
		console.log('Error connecting to DB : ', error)
		res.status(500).json({ message: 'Error Connecting to db ', error })
	}
}

const createUser = async (user, res) => {
	await withDB(async (db) => {
		const usr = await db.collection('users').findOne({ username: user.username })
		if (!usr) {
			const result = await db.collection('users').insertOne({
				...user
			})
			res.status(200).json({ message: 'Success' })
		} else {
			res.status(200).json({ message: 'User Record Exist' })
		}
	})
}

const login = async (user, res) => {
	await withDB(async (db) => {
		const usr = await db.collection('users').findOne({ username: user.username })
		if (usr) {
			if (user.password === usr.password) {
				res.status(200).json({ message: 'Success' })
			}
			else {
				res.status(401).json({ message: 'Wrong Password' })
			}
		} else {
			res.status(401).json({ message: 'No Such User' })
		}
	})
}

createQuiz = async (quiz, res) => {
	try {
		await withDB(async (db) => {
			quiz['responses'] = []
			const result = await db.collection('quizzes').insertOne(quiz)
			res.status(200).json({
				message: 'Success',
				quizId: result.insertedId
			})
			console.log('Quiz Added to Creator Document: ', result.insertedId)
		})
	} catch (error) {
		res.status(200).json({ message: 'Error creating quiz', error })
		console.log('Error : ', error)
	}
}

submitQuiz = async (submittedQuiz, res) => {
	console.log('quiz:', submittedQuiz)
	withDB(async (db) => {
		try {
			// Check whether the user has already submitted the Quiz
			const validationCursor = db.collection('users').find({
				$and: [
					{ uid: submittedQuiz.uid },
					{ attemptedQuiz: ObjectId(submittedQuiz.quizId) }
				]
			})

			const quizData = await validationCursor.toArray()

			// If the quiz is already submitted, DONOT submit it.
			if (quizData[0]) {
				console.log('in quiz already attempted')
				return res.status(200).json({
					error: 'ERR:QUIZ_ALREADY_ATTEMPTED'
				})
			}
			const cursor = db
				.collection('quizzes')
				.find({ _id: new ObjectId(submittedQuiz.quizId) })
				.project({ questions: 1 })

			const quiz = await cursor.toArray()

			console.log('in quiz store')
			const score = Evaluate(quiz[0].questions, submittedQuiz.questions)
			console.log('score : ', score)
			res.status(200).json({ score })

			// Update in quizzes responses
			await db.collection('quizzes').updateOne(
				{ _id: new ObjectId(submittedQuiz.quizId) },
				{
					$push: {
						responses: { uid: submittedQuiz.uid, score: score }
					}
				}
			)
			// Update user's attempted quizzes
			await db.collection('users').updateOne(
				{ uid: submittedQuiz.uid },
				{
					$push: {
						attemptedQuiz: ObjectId(submittedQuiz.quizId)
					}
				}
			)
		} catch (error) {
			console.log('Error:', error)
			res.status(500).json({ error })
		}
	})
}

const getResponses = (obj, res) => {
	withDB(async (db) => {
		const cursor = db
			.collection('quizzes')
			.find({ _id: new ObjectId(obj.quizCode), uid: obj.uid })
			.project({ responses: 1 })
		const cursorData = await cursor.toArray()
		const responses = cursorData[0].responses
		const uidList = responses.map((response) => response.uid)

		const cursor2 = db
			.collection('users')
			.find({ uid: { $in: uidList } })
			.project({ uid: 1, name: 1, email: 1 })

		const cursor2Data = await cursor2.toArray()
		const finalResponse = []
		cursor2Data.forEach((data) => {
			let index = responses.findIndex((resp) => resp.uid === data.uid)
			finalResponse.push({
				name: data.name,
				email: data.email,
				score: responses[index].score
			})
		})
		res.status(200).json({ finalResponse })
	}, res)
}

module.exports.withDB = withDB
module.exports.createUser = createUser
module.exports.login = login
module.exports.createQuiz = createQuiz
module.exports.submitQuiz = submitQuiz
module.exports.getResponses = getResponses
