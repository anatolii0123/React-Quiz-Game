import React from "react"
import "./QuizCard.css"
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap'

const JoinedQuizCard = ({ title, questions, id, joinQuiz }) => {
	return <Card style={{ width: '18rem' }} onClick={e => joinQuiz(id)} className="m-4">
		<Card.Img variant="top" src="/Quiz/download.jpg" />
		<Card.Body>
			<Card.Title>{title}</Card.Title>
		</Card.Body>
		<ListGroup className="list-group-flush">
			<ListGroupItem>{questions} Questions</ListGroupItem>
			<ListGroupItem>{id}</ListGroupItem>
		</ListGroup>
	</Card>
}

export default JoinedQuizCard
	// return <div className="quiz-card" onClick={e => joinQuiz(id)}>
	// 	<h1 id="created-quiz-title" style={{ textAlign: 'center' }}>{title}</h1>
	// 	<div id="horizontal-line"></div>
	// 	<div id="row">
	// 		<div style={{ margin: 'auto' }}>Questions : {questions}</div>
	// 	</div>
	// 	<div id="row">
	// 		<div id="questions">ID : {id}</div>
	// 	</div>
	// </div>