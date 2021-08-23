import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Row, Table } from 'react-bootstrap'
import * as io from 'socket.io-client';
import LoadingScreen from './LoadingScreen'
import AttemptedModal from './AttemptedModal'
import './AttemptQuiz.css'

let socket
class AttemptQuiz extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			number: 0,
			questions: [],
			attemptedQuestions: [],
			quizTitle: '',
			loading: true,
			result: {},
			showModal: false,
			path: '',
			quizCode: '',
			score: 0,
			time: true,
			mark: 0,
			totalScore: 0,
			students: [],
			showMark: false
		}
	}
	async componentDidMount() {
		const quizCode = this.props.match.params.quizCode
		const res = await fetch('/API/quizzes/join', {
			method: 'POST',
			body: JSON.stringify({ quizId: quizCode }),
			headers: {
				'Content-Type': 'application/json',
			},
		})
		const quizData = await res.json()
		console.log('fetch res:', quizData)
		if (!!quizData.error) {
			this.setState({
				quizTitle: quizData.error,
				loading: false
			})
		}
		else {
			this.setState({
				quizTitle: quizData.title,
				questions: quizData.questions,
				loading: false
			})
			const env = process.env.NODE_ENV;
			socket = io.connect((!!env && env.includes('production')) ? 'https://arcane-atoll-82454.herokuapp.com:4000' : 'http://192.168.104.16:4000')
			const username = localStorage.getItem('username')
			socket.emit('login', { username, quizCode })
			socket.on('mark', students => {
				this.setState({ students })
			})
			const temp = quizData.questions.map((question) => {
				return {
					id: question.id,
					title: question.title,
					optionType: question.optionType,
					selectedOptions: [],
				}
			})
			this.setState({
				attemptedQuestions: temp,
				quizCode
			})
		}
	}
	componentWillUnmount() {
		socket.close()
	}
	handleOptionSelect = (option, number) => {
		const { attemptedQuestions, questions } = this.state
		const temp = [...attemptedQuestions]
		let options;
		if (temp.length >= number - 1) {
			options = temp[number].selectedOptions
		}
		else {
			options = []
		}
		if (attemptedQuestions[number].optionType === 'radio') options[0] = option
		else {
			console.log('option select:', options, option)
			if (options.find(opt => opt === option)) {
				options.splice(options.findIndex(opt => opt === option), 1)
			} else {
				options.push(option)
			}
		}
		temp[number].selectedOptions = options
		let score = this.getMark(temp, number)
		if (attemptedQuestions[number].optionType === 'radio') {
			console.log('select score:', score)
			let currentScore = this.evaluateQuiz(questions, temp)
			socket.emit('mark', { id: localStorage.getItem('id'), currentScore })
			this.setState({
				attemptedQuestions: temp,
				time: number < questions.length - 1,
				mark: score === 1 ? 1 : 2,
				showMark: true
			})
			setTimeout(() => this.increaseNumber(), 1500)
		} else if (attemptedQuestions[number].optionType === 'check') {
			this.setState({
				attemptedQuestions: [...temp]
			})
		}
		console.log('select current number:', number)
	}

	getMark = (attemptedQuestions, number) => {
		const { questions } = this.state
		console.log('get marK:', number)
		const correctOptions = questions[number].options.filter((op) => op.isCorrect)
		console.log('options:', correctOptions)
		let question = questions[number]
		let mark
		// Error for Quiz with no correct answers
		if (correctOptions.length < 1) return 0
		const weightage = 1 / correctOptions.length
		let qScore = 0
		if (correctOptions.length < attemptedQuestions[number].selectedOptions.length) {
			qScore -=
				(question.selectedOptions.length - correctOptions.length) * weightage
		}
		attemptedQuestions[number].selectedOptions.forEach((selectedOp) => {
			const correct = correctOptions.find((op) => op.text === selectedOp)
			if (correct !== undefined) qScore += weightage
		})
		return (qScore < 1 ? 0 : 1)
	}

	checkNext = () => {
		const { attemptedQuestions, questions, number } = this.state
		let score = this.getMark(attemptedQuestions, number)
		if (attemptedQuestions[number].optionType === 'check') {
			let currentScore = this.evaluateQuiz(questions, attemptedQuestions)
			socket.emit('mark', { id: localStorage.getItem('id'), currentScore })
			this.setState({
				mark: score === 1 ? 1 : 2,
				showMark: true
			})
			setTimeout(() => this.increaseNumber(), 1500)
		}
	}

	increaseNumber = () => {
		const { number, questions, attemptedQuestions } = this.state
		if (number < questions.length - 1) {
			this.setState({
				number: number + 1,
				showMark: false,
				mark: 0
			})
		}
		else {
			this.setState({
				showModal: true,
				result: this.evaluateQuiz(questions, attemptedQuestions),
				showMark: false
			})
			setTimeout(() => this.increaseNumber(), 1500)
		}
	}
	submitQuiz = async () => {
		// send attempted Questions to backend
		const { quizCode, attemptedQuestions } = this.state
		try {
			const { questions, attemptedQuestions, number } = this.state
			const score = this.evaluateQuiz(questions, attemptedQuestions)
			this.setState({
				score
			})
			// const res = await fetch('/API/quizzes/submit', {
			// 	method: 'POST',
			// 	body: JSON.stringify({
			// 		quizId: quizCode,
			// 		questions: attemptedQuestions,
			// 	}),
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// })
			// const body = await res.json()
			const realQues = questions[number]
			const correctOptions = realQues.options.filter((op) => op.isCorrect)
			let question = questions[number]
			let mark
			// Error for Quiz with no correct answers
			if (correctOptions.length < 1) return 0
			const weightage = 1 / correctOptions.length
			let qScore = 0
			if (correctOptions.length < attemptedQuestions[number].selectedOptions.length) {
				qScore -=
					(question.selectedOptions.length - correctOptions.length) * weightage
			}
			attemptedQuestions[number].selectedOptions.forEach((selectedOp) => {
				const correct = correctOptions.find((op) => op.text === selectedOp)
				if (correct !== undefined) qScore += weightage
			})

			if (qScore < 1) {
				mark = 2
			} else {
				mark = 1
			}

			this.setState({
				// result: body,
				showModal: true,
				time: false,
				mark
			})
			// console.log('res body : ', body)
		} catch (e) {
			console.log('Error Submitting quiz', e)
		}
	}
	evaluateQuiz = (quizQuestions, attemptedQuestions) => {
		let score = 0
		console.log('quiestions:', quizQuestions, attemptedQuestions)
		attemptedQuestions.forEach((question) => {
			const realQues = quizQuestions.find((x) => x.id === question.id)
			console.log('current question:', realQues)
			const correctOptions = realQues.options.filter((op) => op.isCorrect)
			// Error for Quiz with no correct answers
			if (correctOptions.length < 1) return 0

			const attemptedOptions = question.selectedOptions
			if (realQues.optionType === 'check') {
				let cnt = 0
				for (let i = 0; i < attemptedOptions.length; ++i) {
					if (correctOptions.find(opt => opt.text == attemptedOptions[i])) {
						++cnt
					} else {
						console.log('diff ', attemptedOptions[i])
					}
				}
				if (cnt === correctOptions.length) {
					console.log(`pro${question.title} right`)
					++score
				}
				else {
					console.log(`pro${question.title} wrong`, correctOptions, attemptedOptions)
				}
			}
			else if (realQues.optionType === 'radio') {
				console.log('correct option:', correctOptions)
				console.log('attempt:', attemptedOptions)
				if (correctOptions[0].text === attemptedOptions[0]) {
					console.log('same')
					++score
				}
				else {
					console.log('different')
				}
			}
		})
		return score.toFixed(0)
	}
	hideModal = () => {
		this.setState({ showModal: false, mark: 0, number: this.state.number + 1 })
	}

	render = () => {
		console.log('width and height:', window.innerWidth, window.innerHeight)
		const { number, questions, attemptedQuestions, quizTitle, loading, result, path, showModal, score, time, mark, students, showMark } = this.state
		const { handleOptionSelect, submitQuiz, increaseNumber, hideModal, checkNext } = this
		const quizCode = this.props.match.params.quizCode
		if (loading) return <LoadingScreen />
		// For Quiz not Found
		if (quizTitle === 'ERR:QUIZ_NOT_FOUND')
			return (
				<div className='loading'>
					<h1>404 Quiz Not Found!</h1>
					<div id='logo-name'>
						<b>Quiz</b>
					</div>
					<h3>
						Go back to <Link to='/join-quiz'>Join Quiz </Link>Page.
					</h3>
				</div>
			)
		if (!!path) {
			return <Redirect push to={`/attempt-quiz/${quizCode}/${path}`} />
		}
		// For Quiz not accessible
		else if (quizTitle === 'ERR:QUIZ_ACCESS_DENIED')
			return (
				<div className='loading'>
					<h2>
						Quiz Access is Not Granted by the Creator. Please contact Quiz
						Creator.
					</h2>
					<div id='logo-name'>
						<b>Quiz</b>
					</div>
					<h3>
						Go back to <Link to='/join-quiz'>Join Quiz </Link>Page.
					</h3>
				</div>
			)
		else if (quizTitle === 'ERR:QUIZ_ALREADY_ATTEMPTED')
			return (
				<div className='loading'>
					<h2>You have already taken the Quiz.</h2>
					<div id='logo-name'>
						<b>Quiz</b>
					</div>
					<h3>
						Go back to <Link to='/join-quiz'>Join Quiz </Link>Page.
					</h3>
				</div>
			)
		else {
			let question = questions[number], options = attemptedQuestions.length > number ? attemptedQuestions[number].selectedOptions : []
			return (
				<div id='main-body' className='flex-container grow'>
					<div className='flex-horizontal-container grow'>
						<div id='create-quiz-body' className='flex-container grow' style={{ flexGrow: '1' }}>
							<div className='quiz-header fixed' style={{ height: '100px' }}>
								<h2>{quizTitle}</h2>
							</div>
							<div className='attemptQuestionCard theme-classic flex-container grow' style={{ backgroundColor: '#ddffdd' }}>
								<div className='grow vertical-center puzzle-text'>
									{question.title}
								</div>
								{
									mark === 0 ? <div className='option-div options-grid grow' style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
										{question.options.map((option, ind) => (
											<div className={
												`option option-${ind + 1} is-mcq myoption-text is-selected option-pressed `
											} style={{ width: '100%' }} key={ind}>
												<div
													className='option-inner vertical-center puzzle-text option-pressed is-selected theme-option-container'
													style={{ width: '100%' }}
													name={`option${number}`}
													checked={options.findIndex(opt => opt === option.text) >= 0}
													onClick={e =>
														handleOptionSelect(option.text, number)
													}>
													{option.text}
													{
														question.optionType === 'check' && <span className={"select-icon-wrapper flex-view all-center is-selected" + (options.findIndex(opt => opt === option.text) >= 0 ? " pink-background option-selected" : '')}>
															<span className="icon"></span>
														</span>
													}
												</div>
											</div>
										))}
									</div> : <div className='option-div options-grid grow' style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
										{question.options.map((option, ind) => (
											<div className={'option is-mcq myoption-text is-selected option-pressed ' + (option.isCorrect ? `right-color ` : '') + ((option.isCorrect === false && options.findIndex(opt => opt === option.text) >= 0) ? 'wrong-color ' : '')} style={{ width: '100%' }} key={ind}>
												{
													(option.isCorrect || options.findIndex(opt => opt === option.text) >= 0) && <div
														className='option-inner vertical-center puzzle-text option-pressed is-selected theme-option-container'
														style={{ width: '100%' }}
														name={`option${number}`}
														checked={options.findIndex(opt => opt === option.text) >= 0}
														onClick={e =>
															handleOptionSelect(option.text, number)
														}
													>
														{option.text}
														{
															question.optionType === 'check' && <span className={"select-icon-wrapper flex-view all-center is-selected " + (options.findIndex(opt => opt === option.text) >= 0 ? "pink-background" : '')}>
																<span className={"icon " + (options.findIndex(opt => opt === option.text) >= 0 ? "option-selected" : '')}></span>
															</span>
														}
													</div>
												}
											</div>
										))}
									</div>
								}
								<div className='fixed' style={{ height: '70px' }}>
									{
										number === questions.length - 1 && question.optionType === 'check' && <button className='button wd-200' onClick={e => checkNext()}>
											Submit
										</button>
									}
									{
										question.optionType === 'check' && number < questions.length - 1 && <button className='button wd-200' onClick={e => checkNext()}>
											Next
										</button>
									}
								</div>
								{
									mark === 1 ? <div className='fixed mycorrect-answer vertical-center puzzle-text'>
										Correct
									</div> : (mark == 2 ? <div className='fixed mywrong-answer vertical-center puzzle-text'>
										Wrong
									</div> : '')
								}
							</div>
							<AttemptedModal result={result} totalScore={questions.length} showModal={showModal} />
						</div>
						<div className='grow' style={{ flexGrow: '0', width: '200px', marginTop: '100px' }}>
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>Name</th>
										<th>Score</th>
									</tr>
								</thead>
								<tbody>
									{
										students.map(std => <tr>
											<td>{std.name}</td>
											<td>{std.mark}</td>
										</tr>)
									}
								</tbody>
							</Table>
						</div>
					</div>
				</div >
			)
		}
	}
}

export default AttemptQuiz