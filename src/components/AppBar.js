import React from 'react'
import Sidebar from './Sidebar'
import './AppBar.css'
import { Link } from 'react-router-dom'
import { Icon } from '@material-ui/core'
import { AccountCircle } from '@material-ui/icons'
const AppBar = ({ user, setUser, username, setUsername }) => {
	return (
		<div className='appBar'>
			<div className='slider'>
				<Sidebar setUsername={setUsername} />
				<Link to='/' className='home'>
					<b>Quiz</b>
				</Link>
			</div>
			<div className='appBar-user' style={{ marginRight: '80px' }}>
				<div id='row' style={{ height: '100%' }}>
					<div style={{ marginRight: '10px', paddingTop: '10px' }}>
						<Icon>
							<AccountCircle />
						</Icon>
					</div>
					<div className='vertical-center'>
						<div>{user.name || username}</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AppBar
