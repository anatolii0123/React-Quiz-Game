import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Row, Col, Form, InputGroup } from 'react-bootstrap'
import './CreateQuiz.css'
import AddQuestionModal from '../components/AddQuestionModal'
import QuestionsTable from '../components/QuestionsTable'
import { Switch } from '@material-ui/core'
import LoadingScreen from './LoadingScreen'

export default class CreateQuiz extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			title: '',
			access: false,
			quizId: props.id,
			questions: [],
			editing: false,
			curIndex: -1,
			type: "Qur'an",
			isOpen: false
		}
	}
	async componentDidMount() {
		const { quizId } = this.state
		if (quizId) {
			const res = await fetch(`/API/quizzes/${quizId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const result = await res.json()
			this.setState({ title: result.quizData.title, questions: result.quizData.questions, type: result.quizData.type, isOpen: result.quizData.isOpen })
		}
	}
	addQuestionHandle = (title, optionType, options) => {
		const { curIndex, questions } = this.state
		if (curIndex < 0) {
			questions.push({ title, optionType, options })
		}
		else {
			questions[curIndex] = { title, optionType, options }
		}
		this.setState({ questions })
	}
	onSave = async () => {
		const { title, quizId, questions, type, isOpen } = this.state
		if (quizId) {
			const res = await fetch('/API/quizzes/edit', {
				method: 'POST',
				body: JSON.stringify({ title, questions, type, quizId, isOpen }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const result = await res.json()
			if (result.message === 'Success') {
				this.props.showToast('Editing Quiz', 'Success')
				this.props.history.push('/admin/dashboard')
			}
			else {
				this.props.showToast('Editing Quiz', 'Fail', 'error')
			}
		}
		else {
			const res = await fetch('/API/quizzes/create', {
				method: 'POST',
				body: JSON.stringify({ title, questions, type, isOpen }),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const result = await res.json()
			if (result.message === 'Success') {
				this.props.showToast('Adding Quiz', 'Success')
				this.props.history.push('/admin/dashboard')
			}
			else {
				this.props.showToast('Adding Quiz', 'Fail', 'error')
			}
		}
	}
	onChangeFile = async (file, index, field) => {
		let formdata = new FormData()
		formdata.append('file', file)
		const res = await fetch('/API/upload', {
			method: 'POST',
			body: formdata
		})
		const result = await res.json()
		let { questions } = this.state
		questions[index][field] = result.filePath
		this.setState({ questions: [...questions] })
		this.props.showToast('File Upload', 'Success')
	}
	deleteQuiz = index => {
		let { questions } = this.state
		questions.splice(index, 1)
		this.setState({ questions })
	}
	render() {
		const { access, title, questions, curIndex, editing, type } = this.state
		console.log('current type:', type)
		return (
			<div id='main-body' style={{ backgroundColor: '#FFFFFF' }}>
				<div id='create-quiz-body'>
					<div className='quiz-header' style={{ backgroundColor: '#F1F1F1', boxShadow: 'none', width: '1138px' }}>
						<Row>
							<Col>
								<input
									style={{ width: '450px', height: '35px', fontSize: '25px', border: 'none' }}
									type='text'
									className='input-text'
									value={title}
									onChange={(e) => this.setState({ title: e.target.value })}
									id='quiz-title'
									placeholder='Untitled Quiz'
									autoFocus
									autoComplete='off'
								/>
							</Col>
							<Col md='auto'>
								<button
									// disabled={!(title.length && questionArray.length)}
									className='button'
									style={{ height: '35px', fontSize: '15px', paddingTop: '3px', paddingBottom: '5px' }}
									onClick={() => this.setState({ editing: true, curIndex: -1 })}
								>
									+Question
								</button>
							</Col>
							<Col md='auto'>
								<select name="cars" className="custom-select" style={{ width: '150px', marginTop: '10px' }} value={type} onChange={e => this.setState({ type: e.target.value })}>
									<option value="Qur'an">Qur'an</option>
									<option value='Arabic'>Arabic</option>
									<option value='Islamic Studies'>Islamic Studies</option>
								</select>
							</Col>
							<Col md='auto'>
								<button
									// disabled={!(title.length && questionArray.length)}
									className='button'
									style={{ height: '35px', fontSize: '15px', paddingTop: '3px', paddingBottom: '5px' }}
									onClick={this.onSave}
								>
									SAVE
								</button>
							</Col>
							<Col md='auto'>
								<Link to='/admin/dashboard'><button
									// disabled={!(title.length && questionArray.length)}
									className='button'
									style={{ height: '35px', fontSize: '15px', paddingTop: '3px', paddingBottom: '5px' }}
								>
									CANCEL
								</button></Link>
							</Col>
						</Row>
					</div>
					{
						<div className='controls'>
							<AddQuestionModal
								type={curIndex >= 0 ? 'edit' : 'add'}
								title={curIndex >= 0 ? questions[curIndex].title : ''}
								opType={curIndex >= 0 ? questions[curIndex].optionType : 'radio'}
								opArray={curIndex >= 0 ? questions[curIndex].options : []}
								index={curIndex}
								addQuestionHandle={this.addQuestionHandle}
								editQuestionHandle={this.editQuestionHandle}
								open={editing}
								handleClose={() => this.setState({ editing: false })}
							/>
						</div>
					}
					<div style={{ width: '1138px' }}>
						{
							questions.map((question, index) =>
								<Row style={{ marginTop: '30px', backgroundColor: '#FFFFFF', paddingTop: '30px' }} key={index}>
									<Col>
										<div style={{ height: '50px', background: '#A17F50', borderRadius: '5px', color: '#ffffff', textAlign: 'left', fontSize: '20px', paddingTop: '10px', paddingLeft: '30px' }}>
											QUESTION {index + 1}
										</div>
										<Row style={{ paddingTop: '20px', paddingBottom: '20px', marginLeft: '2px', marginRight: '2px', height: '180px', backgroundColor: '#F1F1F1' }}>
											<Col xs={4} md={4} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'center' }}>
												{
													!!question.image && <img src={question.image} style={{ width: '100%' }}></img>
												}
											</Col>
											<Col xs={8} md={8} lg={8} xl={8}>
												<div style={{ height: '100%', position: 'relative' }}>
													<p style={{ margin: '0', position: 'absolute', top: '50%', left: '20%', transform: 'translate(-20%,-50%)' }} rows='5' cols='40'>
														{question.title}
													</p>
												</div>
											</Col>
										</Row>
										<div style={{ backgroundColor: '#CCCCCC' }}>
											<Row style={{ justifyContent: 'space-around' }}>
												<div style={{ position: 'relative', width: '90px' }}>
													<div className='fileInput' style={{ height: '35px', paddingTop: '5px' }}>+Image</div>
													<Form.Control type="file" onChange={e => this.onChangeFile(e.target.files[0], index, 'image')} style={{ position: 'absolute', width: '90px', height: '35px', left: '12px', top: '0', opacity: '0' }} />
												</div>
												{/* <div style={{ position: 'relative', width: '90px' }}>
													<div className='fileInput' style={{ height: '35px', paddingTop: '5px' }}>+Audio</div>
													<Form.Control type="file" onChange={e => this.onChangeFile(e.target.files[0], index, 'audio')} style={{ position: 'absolute', width: '90px', height: '35px', left: '12px', top: '0', opacity: '0' }} />
												</div> */}
												<button
													className='button'
													onClick={() => this.setState({ editing: true, curIndex: index })}
													style={{ height: '35px', fontSize: '12px', paddingTop: '3px', paddingBottom: '5px', width: '90px', fontSize: '15px', marginTop: '10px' }}
												>
													EDIT
												</button>
												<button
													className='button'
													onClick={() => this.deleteQuiz(index)}
													style={{ height: '35px', fontSize: '12px', paddingTop: '3px', paddingBottom: '5px', width: '90px', fontSize: '15px', marginTop: '10px' }}
												>
													DELETE
												</button>
											</Row>
										</div>
									</Col>
									<Col>
										<div style={{ height: '50px', background: '#A17F50', borderRadius: '5px', color: '#ffffff', textAlign: 'left', fontSize: '20px', paddingTop: '10px', paddingLeft: '30px' }}>
											ANSWERS
										</div>
										<Row style={{ backgroundColor: '#F1F1F1', height: '235px', marginLeft: '2px', marginRight: '2px' }}>
											<Col style={{ paddingLeft: '30px', overflow: 'y', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
												{
													question.options.map((opt, idx) => idx % 2 == 0 && <Row style={{ marginTop: '10px' }}>
														<form>
															<input type={question.optionType === 'radio' ? 'radio' : 'checkbox'} id="vehicle1" name="vehicle1" value="Bike" readOnly checked={opt.isCorrect} />
															<label htmlFor="vehicle1" style={{ marginLeft: '10px' }}>{opt.text}</label>
														</form>
													</Row>)
												}
											</Col>
											<Col style={{ paddingLeft: '30px', overflow: 'y', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
												{
													question.options.map((opt, idx) => idx % 2 == 1 && <Row style={{ marginTop: '10px' }}>
														<form>
															<input type={question.optionType === 'radio' ? 'radio' : 'checkbox'} id="vehicle1" name="vehicle1" value="Bike" readOnly checked={opt.isCorrect} />
															<label htmlFor="vehicle1" style={{ marginLeft: '10px' }}>{opt.text}</label>
														</form>
													</Row>)
												}
											</Col>
										</Row>
									</Col>
								</Row>
							)
						}
					</div>
				</div>
			</div>
		)
	}
}
/*
const CreateQuiz = ({
	user,
	quizTitle,
	questions,
	isOpen,
	editQuizHandle,
	showToast
}) => {
	const [questionArray, setQuestionArray] = useState([])
	const [title, setTitle] = useState('')
	const [access, setAccess] = useState(true)
	const [loading, setLoading] = useState('stop')
	const [quizCode, setQuizCode] = useState(null)

	const addQuestionHandle = (title, optionType, options) => {
		const arr = [...questionArray]
		arr.push({ title, optionType, options })
		setQuestionArray(arr)
	}
	useEffect(() => {
		if (quizTitle) {
			setTitle(quizTitle)
			setQuestionArray(questions)
			setAccess(isOpen)
		}
	}, [quizTitle, questions, isOpen])

	const createQuiz = async () => {
		if (!(title.length || questionArray.length)) {
			alert('Please add title and questions.')
			return
		} else if (!title.length) {
			alert('Please add Quiz title.')
			return
		} else if (!questionArray.length) {
			alert('Please add any questions.')
			return
		}
		setLoading('start')
		try {
			const result = await fetch('/API/quizzes/create', {
				method: 'POST',
				body: JSON.stringify({
					title,
					uid: user.uid,
					questions: questionArray,
					isOpen: access
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const body = await result.json()
			setQuizCode(body.quizId)
			showToast('Create Quiz', 'Success')
		} catch (e) {
			setLoading('error')
		}
	}
	if (quizCode) return <Redirect push to={`/created-successfully/${quizCode}`} />

	if (loading === 'start') return <LoadingScreen />

}

export default CreateQuiz
*/