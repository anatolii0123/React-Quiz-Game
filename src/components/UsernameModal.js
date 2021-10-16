import React, { useState, useEffect } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Modal } from '@material-ui/core'
import { Row, Col, InputGroup, FormControl } from 'react-bootstrap'
import './AddQuestionModal.css'

export default class UsernameModal extends React.Component {
  constructor(props) {
    super(props)
    localStorage.removeItem('user')
    this.state = {
      username: localStorage.getItem('username') || '',
      code: '',
      picture: parseInt(localStorage.getItem('picture')) || 1
    }
  }
  enter = () => {
    // const res = await fetch('/API/users/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ name: username }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    // const body = await res.json()
    // localStorage.setItem('username', username)
    // localStorage.setItem('id', body.id)
    // this.props.setUsername(username)
    // setPath('/join-quiz')
    const { username, code, picture } = this.state
    const { showToast } = this.props
    if (!username) {
      return showToast('Quiz Login', 'No Username', 'error')
    }
    if (!code) {
      return showToast('Quiz Login', 'No Quiz Code', 'error')
    }
    if (!picture) {
      return showToast('Quiz Login', 'No Picture', 'error')
    }
    localStorage.setItem('username', username)
    localStorage.setItem('picture', picture)
    this.props.setUsername(username)
    this.props.history.push(`/attempt-quiz/${code}`)
  }

  render() {
    const { username, code, picture } = this.state
    const { open } = this.props
    const classes = {
      modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '25px'
      },
      paper: {
        // backgroundColor: theme.palette.background.paper,
        // boxShadow: theme.shadows[5],
        // padding: theme.spacing(2, 4, 3),
        outline: 0,
        width: '90%',
        borderRadius: '10px',
      },
      buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
      }
    }
    let img = []
    for (let i = 1; i < 21; ++i) {
      img.push(i)
    }
    return <div style={{ width: '800px', height: '500px', marginTop: `${(window.innerHeight - 570) / 2 > 100 ? (window.innerHeight - 570) / 2 : 100}px`, backgroundColor: '#A17F50', marginLeft: `${(window.innerWidth - 800) / 2}px` }} >
      <div
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        style={classes.modal}
        // style={{ width: '360px', margin: 'auto' }}
        open={true}
      >
        <Row>
          <Col lg='auto' md='auto' sm='auto' style={{ backgroundColor: '#294634', width: '300px', paddingLeft: '15px', paddingRight: '15px', borderRadius: '10px 0 0 10px', height: '450px' }}>
            <img
              style={{ width: '100px', marginLeft: '85px', marginRight: '85px', marginTop: '60px', marginBottom: '60px' }}
              src="/Quiz/logo/admin_login_logo.png"
              className="rounded"
              alt=""
            />
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Student Name"
                aria-label="Username"
                aria-describedby="basic-addon1"
                style={{ height: '40px' }}
                value={username}
                onChange={e => this.setState({ username: e.target.value })}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Quiz Code"
                aria-label="Password"
                aria-describedby="basic-addon1"
                style={{ height: '40px' }}
                value={code}
                onChange={e => this.setState({ code: e.target.value })}
              />
            </InputGroup>
            <button className="btn" style={{ backgroundColor: '#A17F50', color: '#fff', width: '100%', marginTop: '15px', marginBottom: '25px', height: '40px', borderRadius: '10px', paddingTop: '5px', fontSize: '12px' }} onClick={e => this.enter()}>ENTER</button>
          </Col>
          <Col lg='auto' md='auto' sm='auto' style={{ width: '435px', backgroundColor: '#fff', height: '450px', overflow: 'auto', borderRadius: '0 10px 10px 0' }}>
            <div style={{ textAlign: 'center', color: '#294634', marginTop: '20px', marginBottom: '20px' }}>CHOOSE AVATAR</div>
            <div style={{ padingLeft: '10px' }}>
              {
                img.map((im, index) => <img
                  src={`/Quiz/Avatar/${im}.png`}
                  style={{ margin: '20px 20px 20px 20px', width: '90px', height: '90px', border: picture === index + 1 ? 'blue 1px solid' : 'none' }}
                  className="rounded"
                  alt=""
                  key={im}
                  onClick={e => this.setState({ picture: index + 1 })}
                />)
              }
            </div>
          </Col>
        </Row>
      </div>
    </div>
  }
}