import React, { useState, useEffect } from 'react'
import './Home.css'
import { InputGroup, FormControl } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'

const Home = ({ setUser, history, setUsername }) => {
	const [username, setUserName] = useState('')
	const [password, setPassword] = useState('')
	const { addToast } = useToasts()
	useEffect(() => {
		// let isMounted = true
		// return () => (isMounted = false)
	}, [setUser])
	setUsername('')
	localStorage.removeItem('username')
	const login = async () => {
		const result = await fetch('/API/users/login', {
			method: 'POST',
			body: JSON.stringify({
				username,
				password
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		const res = await result.json()

		if (res.message === 'Success') {
			localStorage.setItem('user', username)
			setUser(username)
			history.push(username === 'admin' ? '/admin/dashboard' : '/teacher/dashboard')
			addToast('Login Success', {
				appearance: 'success',
				autoDismiss: true
			})
		}
		else {
			addToast(res.message, {
				appearance: 'error',
				autoDismiss: true
			})
		}
	}

	return (
		<div className='vertical-center pt-5' style={{ backgroundColor: '#294634', height: '100%' }}>
			<div id='Home'>
				<div id='logo'>
					<div id='logo-name'>
						<b>Create Al Haramain Games</b>
					</div>
					<div id='description'>
						Now create and join quiz at a single platform.You can create
						trivia quizzes, personality test, polls and survays. Share out
						your quiz with your students with a unique code.
					</div>
				</div>

				<div id='login-card'>
					<label className='login-label'>
						<img
							style={{ width: '100px' }}
							src="/Quiz/logo/admin_login_logo.png"
							className="rounded"
							alt=""
						/>
					</label>
					<div>
						<InputGroup className="mb-3">
							<FormControl
								placeholder="Username"
								aria-label="Username"
								aria-describedby="basic-addon1"
								value={username}
								onChange={e => setUserName(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="mb-3">
							<FormControl
								placeholder="Password"
								aria-label="Password"
								type="password"
								aria-describedby="basic-addon1"
								value={password}
								onChange={e => setPassword(e.target.value)}
							/>
						</InputGroup>
						<InputGroup className="mb-3">
							<button className="btn" style={{ backgroundColor: '#A17F50', color: '#fff', width: '100%' }} onClick={e => login()}>LOGIN</button>
						</InputGroup>
						{/* <InputGroup className="mb-3">
							<Link to='/register' style={{ width: '100%' }}><button className="btn" style={{ backgroundColor: '#A17F50', color: '#fff', width: '100%' }}>REGISTER</button></Link>
						</InputGroup> */}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
