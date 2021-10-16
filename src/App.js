import { Switch, Route } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { Row, Col, Toast, ToastContainer } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'

// Stylesheet
import './App.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import 'bootstrap/dist/css/bootstrap.min.css';
// Components
import Home from './screens/Home'
import CreateQuiz from './screens/CreateQuiz'
import EditQuiz from './screens/editQuiz'
import JoinQuiz from './screens/JoinQuiz'
import UserDashboard from './screens/UserDashboard'
import CreatedSuccessfully from './screens/CreatedSuccessfully'
import NotFoundPage from './screens/NotFoundPage'
import AttemptQuiz from './screens/AttemptQuiz'
import AppBar from './components/AppBar'
import Responses from './screens/Responses'
import AttemptBlindQuiz from './screens/AttemptBlindQuiz'
import UsernameModal from './components/UsernameModal'
import AdminDashboard from './screens/AdminDashboard'
import Register from './screens/Register'

const App = () => {
	const [user, setUser] = useState(localStorage.getItem('user'))
	const [username, setUsername] = useState(localStorage.getItem('username'))
	const [show, setShow] = useState(false)
	const [toastTitle, setToastTitle] = useState('')
	const [toastContent, setToastContent] = useState('')
	const { addToast } = useToasts()
	useEffect(() => {
	}, [user])
	const showToast = (title, content, appr = 'success') => {
		addToast(title + ' ' + content, {
			appearance: appr,
			autoDismiss: true
		})
	}
	const logout = () => {
		setUser('')
		setUsername('')
		localStorage.removeItem('user')
		localStorage.removeItem('username')
		localStorage.removeItem('picture')
	}
	return (
		<div className='App flex-container grow'>
			<div className='fixed'>
				<AppBar setUsername={setUsername} user={user} username={username} setUser={setUser} logout={logout} />
			</div>
			<ToastContainer position="top-end" className="p-3" style={{ position: 'absolute', marginTop: '80px', zIndex: '100' }}>
				<Toast onClose={() => setShow(false)} show={show} delay={5000} autohide>
					<Toast.Header>
						<img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
						<strong className="me-auto">{toastTitle}</strong>
					</Toast.Header>
					<Toast.Body>{toastContent}</Toast.Body>
				</Toast>
			</ToastContainer>
			<Switch>
				<Route path='/name' render={routeProps => <UsernameModal setUsername={setUsername} showToast={showToast} {...routeProps} />} />
				<Route path='/admin/dashboard/editQuiz' render={routeProps => <EditQuiz setUser={setUser} user={user} {...routeProps} />} />

				<Route path='/admin/dashboard' render={routeProps => <AdminDashboard setUsername={setUsername} setUser={setUser} showToast={showToast} role='admin' {...routeProps} />} />
				<Route path='/teacher/dashboard' render={routeProps => <AdminDashboard setUsername={setUsername} setUser={setUser} showToast={showToast} role='teacher' {...routeProps} />} />

				<Route path='/admin' render={routeProps => <Home setUser={setUser} user={user} showToast={showToast} setUsername={setUsername} {...routeProps} />} />
				<Route path='/teacher' render={routeProps => <Home setUser={setUser} user={user} showToast={showToast} setUsername={setUsername} {...routeProps} />} />

				<Route path='/register' render={routeProps => <Register showToast={showToast} {...routeProps} />} />

				<Route path='/dashboard' render={routeProps => <UserDashboard user={user} {...routeProps} />} />
				<Route path='/create-quiz/:id' render={routeProps => <CreateQuiz showToast={showToast} id={routeProps.match.params.id} {...routeProps} />} />
				<Route path='/create-quiz' render={routeProps => <CreateQuiz showToast={showToast} {...routeProps} />} />
				<Route path='/created-successfully/:quizCode' component={CreatedSuccessfully} />
				<Route path='/join-quiz' render={routeProps => <JoinQuiz user={user} {...routeProps} />} />
				<Route path='/attempt-quiz/:quizCode' component={AttemptQuiz} />
				<Route path='/attempt-blind-quiz/:quizCode' component={AttemptBlindQuiz} />
				<Route path='/responses/:quizCode' component={Responses} />
				<Route path='/' render={routeProps => <UsernameModal setUsername={setUsername} showToast={showToast} {...routeProps} />} />
				<Route component={NotFoundPage} />
			</Switch>
		</div>
	)
}

export default App
/*
!firebase.auth().currentUser ?
*/