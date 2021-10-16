import React from 'react'
import { Link, Redirect } from 'react-router-dom'
import { ListGroup, Row, Col, Carousel } from 'react-bootstrap'
import * as io from 'socket.io-client';
import {
	MusicNote, MusicOff
} from '@material-ui/icons'
import { Icon } from '@material-ui/core'
import LoadingScreen from './LoadingScreen'
import JoinedQuizCard from '../components/JoinedQuizCard';
import './AttemptQuiz.css'

let socket
const socketUrl = "/"
// const socketUrl = "ws://192.168.104.16:3001"

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
			students: [],
			showMark: false,
			music: true,
			waiting: 5,
			timeout: 10
		}
		this.url = "/audio.mp3";
		this.audio = new Audio(this.url);
		this.audio.play()
		this.audio.addEventListener('ended', function () {
			this.audio = new Audio(this.url);
			this.audio.play()
		}, false);
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
		if (!!quizData.error) {
			this.setState({
				quizTitle: quizData.error,
				loading: false
			})
		}
		else {
			socket = io.connect(socketUrl)
			const username = localStorage.getItem('username')
			const picture = localStorage.getItem('picture')
			socket.emit('login', { username, quizCode, picture })
			socket.on('mark', students => {
				this.setState({
					students: [...students]
				})
			})
			socket.on('start', () => {
				console.log('starting quiz now')
				this.timerId = setInterval(this.timerFunc, 1000)
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
				quizTitle: quizData.title,
				questions: quizData.questions,
				loading: false,
				attemptedQuestions: temp,
				quizCode
			})
			// this.timerId = setInterval(this.timerFunc, 1000)
		}
	}
	componentWillUnmount() {
		if (!!socket) {
			socket.close()
		}
		if (!!this.audio) {
			this.audio.pause()
		}
	}
	clock = () => {
		let { timeout } = this.state
		if (timeout > 0) {
			return this.setState({ timeout: timeout - 1 })
		}
		this.checkNext()
	}
	timerFunc = () => {
		let { waiting } = this.state
		if (waiting > 0) {
			--waiting;
			this.setState({ waiting })
			if (waiting === 0) {
				clearInterval(this.timerId)
				this.timerId = setInterval(this.clock, 1000)
			}
		}
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
			if (options.find(opt => opt === option)) {
				options.splice(options.findIndex(opt => opt === option), 1)
			} else {
				options.push(option)
			}
		}
		temp[number].selectedOptions = options
		let score = this.getMark(temp, number)
		if (attemptedQuestions[number].optionType === 'radio') {
			let currentScore = this.evaluateQuiz(questions, temp)
			console.log('radio current answer:', temp)
			console.log('current score:', number, currentScore)
			socket.emit('mark', { id: localStorage.getItem('id'), currentScore })
			clearInterval(this.timerId)
			this.setState({
				attemptedQuestions: temp,
				time: number < questions.length - 1,
				mark: score === 1 ? 1 : 2,
				showMark: true,
				score: currentScore
			})
			// this.audio.pause()
			setTimeout(() => this.increaseNumber(), 3000)
		} else if (attemptedQuestions[number].optionType === 'check') {
			console.log('checkbox current answer:', temp)
			this.setState({
				attemptedQuestions: [...temp]
			})
		}
	}

	getMark = (attemptedQuestions, number) => {
		const { questions } = this.state
		const correctOptions = questions[number].options.filter((op) => op.isCorrect)
		let question = questions[number]
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

	checkNext = (flag = true) => {
		clearInterval(this.timerId)
		const { attemptedQuestions, questions, number } = this.state
		let score = this.getMark(attemptedQuestions, number)
		let currentScore = this.evaluateQuiz(questions, attemptedQuestions)
		console.log('current answer:', attemptedQuestions)
		console.log('current score:', number, currentScore)
		socket.emit('mark', { id: localStorage.getItem('id'), currentScore })
		this.setState({
			mark: score === 1 ? 1 : 2,
			showMark: true,
			score: currentScore,
			timeout: 10
		})
		// this.audio.pause()
		setTimeout(this.increaseNumber, 3000)
	}

	increaseNumber = () => {
		const { number, questions, attemptedQuestions } = this.state
		if (number < questions.length - 1) {
			this.setState({
				number: number + 1,
				showMark: false,
				mark: 0,
				timeout: 10
			})
			this.timerId = setInterval(this.clock, 1000)
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
		} catch (e) {
		}
	}
	evaluateQuiz = (quizQuestions, attemptedQuestions) => {
		let score = 0
		attemptedQuestions.forEach((question, index) => {
			// const realQues = quizQuestions.find((x) => x.id === question.id)
			const realQues = quizQuestions[index]
			const correctOptions = realQues.options.filter((op) => op.isCorrect)
			// Error for Quiz with no correct answers
			if (correctOptions.length < 1) return 0

			const attemptedOptions = question.selectedOptions
			if (realQues.optionType === 'check') {
				let cnt = 0
				for (let i = 0; i < attemptedOptions.length; ++i) {
					if (correctOptions.find(opt => opt.text === attemptedOptions[i])) {
						++cnt
					}
				}
				if (cnt === correctOptions.length) {
					++score
				}
			}
			else if (realQues.optionType === 'radio') {
				if (correctOptions[0].text === attemptedOptions[0]) {
					++score
				}
			}
		})
		return score.toFixed(0)
	}
	hideModal = () => {
		this.setState({ showModal: false, mark: 0, number: this.state.number + 1 })
	}
	handleMusic = () => {
		const { music } = this.state
		music ? this.audio.pause() : this.audio.play()
		this.setState({ music: !music })
	}

	render = () => {
		const { number, questions, attemptedQuestions, quizTitle, loading, path, showModal, score, mark, students, music, waiting, timeout } = this.state
		const { handleOptionSelect, checkNext } = this
		const { quizCode } = this.props.match.params
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
						Go back to <Link to='/name'>Join Quiz </Link>Page.
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
				<div className='dash-body'>
					<div className='quizzes' style={{ width: '1250px', paddingBottom: '50px' }}>
						<div>
							<Carousel style={{ height: '100%' }}>
								<Carousel.Item interval={4000}>
									<img
										className="d-block"
										style={{ width: `1240px`, height: `336px` }}
										src="/Quiz/banner.png"
										alt="Second slide"
									/>
									<Carousel.Caption>
										{/* <h3>Second slide label</h3>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
									</Carousel.Caption>
								</Carousel.Item>
								<Carousel.Item interval={4000}>
									<img
										className="d-block"
										style={{ width: `1240px`, height: `336px` }}
										src="/Quiz/banner1.png"
										alt="Second slide"
									/>
									<Carousel.Caption>
										{/* <h3>Second slide label</h3>
								<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
									</Carousel.Caption>
								</Carousel.Item>
							</Carousel>
						</div>
						<Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '20px' }}>
							<p style={{ width: '200px', color: '#294634', marginTop: '35px' }}>Time Remaining</p>
							<img src={`/Quiz/Number/${(timeout < 10 ? '0' : '')}${timeout}.png`} style={{ width: '150px' }}></img>
						</Row>
						<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', height: '1300px' }}>
							<div id='create-quiz-body' className='flex-container' style={{ width: '830px', color: '#ffffff', marginTop: '0px', marginBottom: '30px' }}>
								{
									waiting > 0 ? <div className='attemptQuestionCard theme-classic flex-container' style={{ backgroundColor: '#294634', marginLeft: '10px', width: '100%' }}>
										<div className='fixed' style={{ height: '60px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
											<Row style={{ marginLeft: 'auto', marginRight: 'auto' }}>
												<Col><div className='topText' style={{ width: '200px' }}>Quiz 1</div></Col>
												<Col><Icon style={{ height: '60px' }}>
													<MusicNote fontSize='large' />
												</Icon>
												</Col>
												<Col>
													<div className='topText' style={{ width: '200px' }}>Score:0</div>
												</Col>
											</Row>
										</div>
										<Row>
											<Col className='vertical-center'>
												{
													!!quizTitle && <JoinedQuizCard
														title={quizTitle}
														// score={quiz.responses[0].score}
														questions={questions.length}
														id={quizCode}
													/>
												}
											</Col>
											<Col className='vertical-center'>
												<div style={{ width: '300px', height: 'auto' }}>
													<Row>
														<img src={`/Quiz/Number/0${waiting}.png`}></img>
													</Row>
												</div>
											</Col>
										</Row>
									</div> :
										<div className='attemptQuestionCard theme-classic' style={{ backgroundColor: '#294634', marginLeft: '10px', width: '100%', height: '600px', marginBottom: '100px' }}>
											<div className='fixed' style={{ height: '60px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
												<Row style={{ marginLeft: 'auto', marginRight: 'auto' }}>
													<Col><div className='topText' style={{ width: '200px' }}>Quiz {`${number + 1}`}</div></Col>
													<Col><Icon style={{ height: '60px' }} onClick={e => this.handleMusic()}>
														{music ? <MusicNote fontSize='large' /> : <MusicOff fontSize='large' />}
													</Icon>
													</Col>
													<Col>
														<div className='topText' style={{ width: '200px' }}>Score:{`${score}`}</div>
													</Col>
												</Row>
											</div>
											<Row style={{ marginTop: '30px', marginBottom: '30px' }}>
												{
													!showModal && !!question.image && <Col xs={4} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
														{
															!!question.image && <img src={question.image} style={{ width: '100%' }}></img>
														}
													</Col>
												}
												{
													!showModal && <Col className='grow vertical-center puzzle-text' style={{ color: '#ffffff' }} xs={!!question.image ? 8 : 12} md={!!question.image ? 8 : 12} lg={!!question.image ? 8 : 12} xl={!!question.image ? 8 : 12}>
														{question.title}
													</Col>
												}
											</Row>
											{
												mark === 0 ? !showModal && <div className='option-div options-grid grow' style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
													{question.options.map((option, ind) => (
														<div className={
															`option is-mcq myoption-text is-selected option-pressed `
														} style={{ width: '100%', height: '140px', backgroundColor: '#ffffff' }} key={ind}>
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
												</div> : !showModal && <div className='option-div options-grid grow' style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
													{question.options.map((option, ind) => (
														<div className={'option is-mcq myoption-text is-selected option-pressed ' + (option.isCorrect ? `right-color ` : '') + ((option.isCorrect === false && options.findIndex(opt => opt === option.text) >= 0) ? 'wrong-color ' : '')} style={{ width: '100%', height: '140px' }} key={ind}>
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
											{
												!showModal && <div className='fixed' style={{ height: '70px' }}>
													{
														number === questions.length - 1 && question.optionType === 'check' && <button className='button wd-200' onClick={e => checkNext(true)}>
															Submit
														</button>
													}
													{
														question.optionType === 'check' && number < questions.length - 1 && <button className='button wd-200' onClick={e => checkNext(true)}>
															Next
														</button>
													}
												</div>
											}
											{
												mark === 1 ? !showModal && <div className='fixed mycorrect-answer vertical-center puzzle-text' style={{ marginTop: '20px' }}>
													Correct
												</div> : (mark === 2 ? !showModal && <div className='fixed mywrong-answer vertical-center puzzle-text' style={{ marginTop: '20px' }}>
													Wrong
												</div> : <div style={{ height: '100px' }}>  </div>)
											}
											{
												showModal && <div style={{ position: 'relative', height: '150px', marginTop: '45px' }}>
													{students.length > 0 && <img src={`/Quiz/Avatar/${students[0].picture}.png`} style={{ position: 'absolute', left: '360px', top: '20px', width: '80px', height: '80px' }}></img>}
													{students.length > 1 && <img src={`/Quiz/Avatar/${students[1].picture}.png`} style={{ position: 'absolute', left: '235px', top: '60px', width: '80px', height: '80px' }}></img>}
													{students.length > 2 && <img src={`/Quiz/Avatar/${students[2].picture}.png`} style={{ position: 'absolute', left: '500px', top: '100px', width: '80px', height: '80px' }}></img>}
													{students.length > 0 && <div style={{ position: 'absolute', left: '360px', top: '110px', width: '80px', textAlign: 'center' }}>{students[0].name}</div>}
													{students.length > 1 && <div style={{ position: 'absolute', left: '235px', top: '150px', width: '80px', textAlign: 'center' }}>{students[1].name}</div>}
													{students.length > 2 && <div style={{ position: 'absolute', left: '500px', top: '190px', width: '80px', textAlign: 'center' }}>{students[2].name}</div>}
												</div>
											}
											{
												showModal && <div>
													<img src='/Quiz/cup.png'></img>
												</div>
											}
										</div>
								}
							</div>
							<div className='grow' style={{ flexGrow: '0', overflow: 'visible', height: `${window.innerHeight - 170}`, width: '350px' }}>
								{
									students.map((std, ind) => <ListGroup horizontal key={ind}>
										<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src={`/Quiz/Avatar/${std.picture}.png`} style={{ width: '45px', height: '45px' }} /></ListGroup.Item>
										<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>{std.name}</div></ListGroup.Item>
										<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>{std.mark}</div></ListGroup.Item>
									</ListGroup>)
								}
							</div>
						</div>
					</div>
				</div>
			)
		}
	}
}

export default AttemptQuiz