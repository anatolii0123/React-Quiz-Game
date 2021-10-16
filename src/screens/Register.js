import React, { useState, useEffect } from 'react'
import { Redirect, Link } from 'react-router-dom'
import './Home.css'
import { InputGroup, FormControl } from 'react-bootstrap'
const Register = ({ showToast }) => {
  const [path, setPath] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [cPassword, setCPassword] = useState('')

  useEffect(() => {
  })

  const register = async () => {
    if (password !== cPassword) {
      showToast('Register', 'Two passwords are different', 'error')
      return;
    }
    const result = await fetch('/API/users/create', {
      method: 'POST',
      body: JSON.stringify({
        name,
        username,
        password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const res = await result.json()
    showToast('Register', res.message, res.message === 'Success' ? 'success' : 'error')
    if (res.message === 'Success') {
      setPath('/admin')
    }
  }

  if (!!path) {
    return <Redirect push to={path} />
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
                onChange={e => setUsername(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Name"
                aria-label="name"
                aria-describedby="basic-addon1"
                value={name}
                onChange={e => setName(e.target.value)}
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
              <FormControl
                placeholder="Confirm Password"
                aria-label="Password"
                type="password"
                aria-describedby="basic-addon1"
                value={cPassword}
                onChange={e => setCPassword(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <button className="btn" style={{ backgroundColor: '#A17F50', color: '#fff', width: '100%' }} onClick={e => register()}>REGISTER</button>
            </InputGroup>
            <InputGroup className="mb-3">
              <Link to='/admin' style={{ width: '100%' }}><button className="btn" style={{ backgroundColor: '#A17F50', color: '#fff', width: '100%' }}>LOGIN</button></Link>
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
