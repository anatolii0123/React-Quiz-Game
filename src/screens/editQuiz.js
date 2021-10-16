import React from 'react'
// import { Redirect } from 'react-router-dom'
import { Row, Col } from 'react-bootstrap'
import './CreateQuiz.css'
import AddQuestionModal from '../components/AddQuestionModal'
import QuestionsTable from '../components/QuestionsTable'
import { Switch } from '@material-ui/core'
// import LoadingScreen from './LoadingScreen'

const EditQuiz = ({
	// 	user,
	// 	quizTitle,
	// 	questions,
	// 	isOpen,
	// 	editQuizHandle,
	// 	showToast
}) => {
	// const [questionArray, setQuestionArray] = useState([])
	// const [title, setTitle] = useState('')
	// const [access, setAccess] = useState(true)
	// const [loading, setLoading] = useState('stop')
	// const [quizCode, setQuizCode] = useState(null)

	// const addQuestionHandle = (title, optionType, options) => {
	// 	const arr = [...questionArray]
	// 	arr.push({ title, optionType, options })
	// 	setQuestionArray(arr)
	// }
	// useEffect(() => {
	// 	if (quizTitle) {
	// 		setTitle(quizTitle)
	// 		setQuestionArray(questions)
	// 		setAccess(isOpen)
	// 	}
	// }, [quizTitle, questions, isOpen])

	// const createQuiz = async () => {
	// 	if (!(title.length || questionArray.length)) {
	// 		alert('Please add title and questions.')
	// 		return
	// 	} else if (!title.length) {
	// 		alert('Please add Quiz title.')
	// 		return
	// 	} else if (!questionArray.length) {
	// 		alert('Please add any questions.')
	// 		return
	// 	}
	// 	setLoading('start')
	// 	try {
	// 		const result = await fetch('/API/quizzes/create', {
	// 			method: 'POST',
	// 			body: JSON.stringify({
	// 				title,
	// 				uid: user.uid,
	// 				questions: questionArray,
	// 				isOpen: access
	// 			}),
	// 			headers: {
	// 				'Content-Type': 'application/json'
	// 			}
	// 		})
	// 		const body = await result.json()
	// 		setQuizCode(body.quizId)
	// 		showToast('Create Quiz', 'Success')
	// 	} catch (e) {
	// 		setLoading('error')
	// 	}
	// }
	// if (quizCode) return <Redirect push to={`/created-successfully/${quizCode}`} />

	// if (loading === 'start') return <LoadingScreen />

	return (
		<div id='main-body'>
			<div id='create-quiz-body'>
				<div className='quiz-header'>
					<Row>
						<Col>
							<input
								type='text'
								className='input-text'
								value="Testing Quiz"
								// onChange={(e) => setTitle(e.target.value)}
								id='quiz-title'
								placeholder='Untitled Quiz'
								autoFocus
								autocomplete='off'
							/>
						</Col>
						<Col>
							<div style={{ width: '100px' }}>Subject</div>
							<select style={{ width: '100px' }}>
								<option>Qur'an</option>
								<option>Arabic</option>
								<option>Islamic Studies</option>
							</select>
							<Switch
								checked='true'
								// onChange={(e) => setAccess(e.target.checked)}
								color='secondary'
								name='access'
							/>
						</Col>
					</Row>
				</div>
				<div className='controls'>
					<AddQuestionModal />
					<div className='switch'>
						<h4>Public</h4>
					</div>
				</div>
			</div>
			<div className='questionTable'>
				<QuestionsTable
				/>
			</div>
			<div>
				<button className='add-btn'>
					Close
				</button>
				<button
					// disabled={!(title.length && questionArray.length)}
					className='button wd-200'

				>
					Save
					Quiz
				</button>
			</div>
		</div>
	)
}

export default EditQuiz
