import { Switch, Route } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import firebase from './firebase/firebase'

// Stylesheet
import './App.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import 'bootstrap/dist/css/bootstrap.min.css';
// Components
import Home from './screens/Home'
import OneTimeDashBoard from './screens/OneTimeDashboard'
import CreateQuiz from './screens/CreateQuiz'
import JoinQuiz from './screens/JoinQuiz'
import UserDashboard from './screens/UserDashboard'
import CreatedSuccessfully from './screens/CreatedSuccessfully'
import NotFoundPage from './screens/NotFoundPage'
import AttemptQuiz from './screens/AttemptQuiz'
import AppBar from './components/AppBar'
import Responses from './screens/Responses'
import AttemptBlindQuiz from './screens/AttemptBlindQuiz'
import UsernameModal from './components/UsernameModal'
import MyHome from './screens/MyHome'

const App = () => {
	const [user, setUser] = useState({})
	const [username, setUsername] = useState(localStorage.getItem('username'))
	useEffect(() => {
		const createUserInDB = async () => {
			if (user.uid)
				if (
					firebase.auth().currentUser.metadata.lastSignInTime ===
					firebase.auth().currentUser.metadata.creationTime
				) {
					try {
						await fetch('/API/users/create', {
							method: 'POST',
							body: JSON.stringify({
								uid: user.uid,
								name: user.name,
								email: user.email,
							}),
							headers: {
								'Content-Type': 'application/json',
							},
						})
						console.log('posted')
					} catch (error) {
						console.log('User Creation Error: ', error)
					}
				}
		}
		createUserInDB()
	}, [user])
	return (
		<div className='App flex-container grow'>
			<div className='fixed'>
				<AppBar user={user} setUser={setUser} username={username} setUsername={setUsername} />
			</div>
			<Switch>
				<Route path='/name'>
					<UsernameModal setUsername={setUsername} />
				</Route>
				<Route path='/admin'>
					{
						!firebase.auth().currentUser ? <Home setUser={setUser} /> : <OneTimeDashBoard user={user} />
					}
				</Route>
				<Route path='/dashboard'>
					<UserDashboard user={user} />
				</Route>
				<Route path='/create-quiz'>
					<CreateQuiz user={user} />
				</Route>
				<Route
					path='/created-successfully/:quizCode'
					component={CreatedSuccessfully}
				/>
				<Route path='/join-quiz'>
					<JoinQuiz user={user} />
				</Route>
				<Route path='/attempt-quiz/:quizCode' component={AttemptQuiz} />
				<Route
					path='/attempt-blind-quiz/:quizCode'
					component={AttemptBlindQuiz}
				/>
				<Route path='/responses/:quizCode' component={Responses} />
				<Route path='/'>
					<UserDashboard user={user} />
				</Route>
				<Route component={NotFoundPage} />
			</Switch>
		</div>
	)
}

export default App
/*
!firebase.auth().currentUser ?
*/