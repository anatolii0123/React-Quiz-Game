import React, { useState } from "react"
import { Redirect } from 'react-router-dom'
import { IconButton } from '@material-ui/core'
import { EditRounded, DeleteRounded, PlayArrow, LockOpen, Lock, Stop } from '@material-ui/icons'
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Card, Row, Col } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import "./QuizCard.css"

const CreatedQuizCard = ({
	title,
	code,
	questions,
	isOpen,
	index,
	setEditQuiz,
	deleteQuiz,
	publishQuiz,
	startQuiz,
	showStart,
	lockQuiz,
	stopQuiz
}) => {
	const [path, setPath] = useState('')
	const user = localStorage.getItem('user')
	const { addToast } = useToasts()
	if (path) {
		return <Redirect to={path} />
	}

	return <Card className="m-4" style={{ border: '1px solid #a17f50', backgroundColor: 'rgb(41, 70, 52)', borderRadius: '10px', color: '#ffffff', width: '236px' }}>
		<Card.Img variant="top" src="/Quiz/Links/tariq-bin-ziyad-for-burning-the-boats-azhar-abbas.jpg" style={{ borderRadius: '10px' }} />
		<b style={{ marginTop: '20px', borderBottom: '1px solid #ffffff', marginLeft: '12px', marginRight: '12px', paddingBottom: '10px', color: '#ffffff' }}>{title}</b>
		<p style={{ borderBottom: '1px solid #ffffff', marginLeft: '12px', marginRight: '12px', marginBottom: '0px', paddingTop: '3px', paddingBottom: '3px', color: '#ffffff', fontSize: '12px' }}>Lesson Quiz</p>
		{user === 'admin' && <p style={{ borderBottom: '1px solid #ffffff', marginLeft: '12px', marginRight: '12px', marginBottom: '0px', paddingTop: '3px', paddingBottom: '3px', color: '#ffffff', fontSize: '12px' }}>{code}</p>}
		<p style={{ borderBottom: '1px solid #ffffff', marginLeft: '12px', marginRight: '12px', paddingTop: '3px', paddingBottom: '3px', color: '#ffffff', fontSize: '12px' }}>Teacher Shavez Muhammad</p>
		<Row style={{ marginBottom: '10px', paddingLeft: '15px', paddingRight: '15px' }}>
			{
				!isOpen && user === 'admin' && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={e => publishQuiz(code)}>
						<LockOpen />
					</IconButton>
				</Col>
			}
			{
				isOpen && user === 'admin' && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={e => lockQuiz(code)}>
						<Lock />
					</IconButton>
				</Col>
			}
			<Col>
				<CopyToClipboard
					text={code}
					onCopy={() => addToast('Copying Quiz Code Success', {
						appearance: 'success',
						autoDismiss: true
					})}
				>
					<IconButton style={{ padding: 0, color: '#a17f50' }}>
						<FileCopyIcon />
					</IconButton>
				</CopyToClipboard>
			</Col>
			{
				user !== 'admin' && showStart && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={() => startQuiz(code)}>
						<PlayArrow />
					</IconButton>
				</Col>
			}
			{
				user !== 'admin' && !showStart && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={() => stopQuiz(code)}>
						<Stop />
					</IconButton>
				</Col>
			}
			{
				user === 'admin' && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={() => setPath(`/create-quiz/${code}`)}>
						<EditRounded />
					</IconButton>
				</Col>
			}
			{
				user === 'admin' && <Col>
					<IconButton style={{ padding: 0, color: '#a17f50' }} onClick={() => deleteQuiz(code)}>
						<DeleteRounded />
					</IconButton>
				</Col>
			}
		</Row>
	</Card>
}
export default CreatedQuizCard
