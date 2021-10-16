import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import './UserDashBoard.css'
import { Icon } from '@material-ui/core'
import {
	MusicNote, MusicOff
} from '@material-ui/icons'
import { ListGroup, Badge, Row, Col } from 'react-bootstrap'
import CreatedQuizCard from '../components/CreatedQuizCard'
import JoinedQuizCard from '../components/JoinedQuizCard'
import LoadingScreen from './LoadingScreen'
import CreateQuiz from './CreateQuiz'
import { Carousel } from 'react-bootstrap'
import firebase from '../firebase/firebase'

const UserDashboard = ({ user }) => {
	const [createdQuizzes, setCreatedQuizzes] = useState([])
	const [loading, setLoading] = useState(true)
	const [editQuiz, setEditQuiz] = useState([])
	const [allQuizzes, setAllQuizzes] = useState([])
	const [path, setPath] = useState('')
	// Fetch Data from the API
	useEffect(() => {
		// if (!user.uid) {
		// 	setLoading(false)
		// 	return
		// }
		const fetchQuizData = async () => {
			let results, quizData
			// if (user.uid) {
			// 	results = await fetch(`/API/users/${user.uid}`)
			// 	quizData = await results.json()
			// 	if (quizData.createdQuiz) setCreatedQuizzes(quizData.createdQuiz)
			// }
			results = await fetch(`/API/quizzes`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})
			quizData = await results.json()
			if (quizData.quizData) {
				setAllQuizzes(quizData.quizData)
			}
			setLoading(false)
		}
		fetchQuizData()
	}, [user])

	const editQuizHandle = async (title, questions, isOpen) => {
		if (!title) setEditQuiz([])
		else {
			setLoading(true)
			console.dir({
				quizId: createdQuizzes[editQuiz]._id,
				uid: user.uid,
				title,
				questions,
				isOpen,
			})
			const results = await fetch('/API/quizzes/edit', {
				method: 'POST',
				body: JSON.stringify({
					quizId: createdQuizzes[editQuiz]._id,
					uid: user.uid,
					title,
					questions,
					isOpen,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const submitData = await results.json()
			console.dir(submitData)
			const temp = [...createdQuizzes]
			temp[editQuiz[0]].title = title
			temp[editQuiz[0]].questions = questions
			temp[editQuiz[0]].isOpen = isOpen
			setCreatedQuizzes(temp)
			setEditQuiz([])
			setLoading(false)
		}
	}

	const deleteQuiz = async index => {
		setLoading(true)
		const results = await fetch(`/API/quizzes/${createdQuizzes[index]._id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		const submitData = await results.json()
		console.dir(submitData)
		const temp = [...createdQuizzes]
		temp.splice(index, 1)
		setCreatedQuizzes(temp)
		setEditQuiz([])
		setLoading(false)
	}

	if (loading) return <LoadingScreen />

	if (path) {
		return localStorage.getItem('username') == undefined ? <Redirect push to='join-quiz' /> : <Redirect push to={`/attempt-quiz/${path}`} />
	}

	localStorage.removeItem('username')

	if (editQuiz.length)
		return (
			<CreateQuiz
				user={user}
				quizTitle={createdQuizzes[editQuiz].title}
				questions={createdQuizzes[editQuiz].questions}
				isOpen={createdQuizzes[editQuiz].isOpen}
				editQuizHandle={editQuizHandle}
			/>
		)

	return (
		<div className='dash-body'>
			<div className='quizzes' style={{ width: '1250px' }}>
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
							</Carousel.Caption>
						</Carousel.Item>
					</Carousel>
				</div>
				<div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
					<div id='create-quiz-body' className='flex-container' style={{ width: '830px', color: '#ffffff', marginTop: '0px', marginBottom: '30px' }}>
						<div className='attemptQuestionCard theme-classic flex-container' style={{ backgroundColor: '#294634', marginLeft: '10px', width: '100%' }}>
							<div className='fixed' style={{ height: '60px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
								<Row style={{ marginLeft: 'auto', marginRight: 'auto' }}>
									<Col><div className='topText' style={{ width: '200px' }}>Quiz 1</div></Col>
									<Col><Icon style={{ height: '60px' }}>
										<MusicNote fontSize='large' />
									</Icon>
									</Col>
									<Col>
										<div className='topText' style={{ width: '200px' }}>Score:10</div>
									</Col>
								</Row>
							</div>
							<Row>
								<Col className='vertical-center'>
									{
										<JoinedQuizCard
											key={1}
											title='Enjoy Quiz !'
											// score={quiz.responses[0].score}
											questions={5}
											id={'12123'}
										/>
									}
								</Col>
								<Col className='vertical-center'>
									<div style={{ width: '300px', height: 'auto' }}>
										<Row>
											<img src='Quiz/Number/01.png'></img>
										</Row>
										<Row>
											<button className='button' style={{ width: '250px', borderRadius: '7px', margin: 'auto', marginTop: '40px', fontSize: '20px', height: '40px', paddingTop: '5px' }}>
												Start
											</button>
										</Row>
									</div>
								</Col>
							</Row>
						</div>
					</div>
					<div className='grow' style={{ flexGrow: '0', overflow: 'visible', height: `${window.innerHeight - 170}`, width: '350px' }}>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/1.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Al Haramain Madrash</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>11</div></ListGroup.Item>
						</ListGroup>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/2.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Amina Muhammad</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>10</div></ListGroup.Item>
						</ListGroup>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/3.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Shaveiz Muhammad</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>9</div></ListGroup.Item>
						</ListGroup>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/4.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Issa Uthman</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>8</div></ListGroup.Item>
						</ListGroup>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/5.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Kuluthum</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>7</div></ListGroup.Item>
						</ListGroup>
						<ListGroup horizontal>
							<ListGroup.Item variant='primary' className='markItem' style={{ backgroundColor: 'rgb(230,230,230)', color: 'rgb(41,70,52)' }}><img src='/Quiz/Avatar/6.png' style={{width:'45px', height:'45px'}} /></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '270px' }}><div style={{ marginTop: '10px' }}>Ahyan Ayan</div></ListGroup.Item>
							<ListGroup.Item variant='primary' className='markItem' style={{ width: '53px' }}><div style={{ marginTop: '10px' }}>6</div></ListGroup.Item>
						</ListGroup>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserDashboard
