import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Icon } from '@material-ui/core'
import './Sidebar.css'

import {
	CreateNewFolder,
	Dashboard,
	ExitToApp,
	MeetingRoom,
	MenuOpenRounded,
	MenuRounded,
	AssignmentInd
} from '@material-ui/icons'

function Sidebar({ setUsername, setUser, setPath, user, logout }) {
	const [signOut, setSignOut] = useState(false)
	// const user = localStorage.getItem('user')
	const SidedbarData = [
		{
			title: 'Dashboard',
			path: !!user ? '/admin/dashboard' : '/dashboard',
			icon: <Dashboard />,
			CName: 'nav-text',
		},
		{
			title: 'Create Quiz',
			path: '/create-quiz/',
			icon: <CreateNewFolder />,
			CName: 'nav-text',
		}
	]
	const [sidebar, setSidebar] = useState(false)
	const showSidebar = () => setSidebar(!sidebar)

	const username = localStorage.getItem('username')

	if (signOut) {
		logout()
		setSignOut(false)
	}
	console.log("sidebar:", user)
	return (
		<div>
			<Icon className='menu-bars' onClick={e => showSidebar()}>
				<MenuRounded />
			</Icon>
			<nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
				<ul className='nav-menu-items' onClick={e => showSidebar()}>
					<li className='navbar-toggle'>
						<Icon>
							<MenuOpenRounded fontSize='large' />
						</Icon>
					</li>
					{user === 'admin' && SidedbarData.map((item, index) => {
						return <li key={index} className='nav-text'>
							<Link to={item.path} style={{ color: '#ffffff' }}>
								<Icon style={{ height: '40px' }}>{item.icon}</Icon>
								<span className='nav-item-title'>{item.title}</span>
							</Link>
						</li>
					})}
					{
						(!!user || !!username) && <li className='nav-text sign-out' style={{ display: 'flex', justifyContent: 'left' }}>
							<Link
								to='/'
								onClick={() => setSignOut(true)}
								style={{ color: '#ffffff' }}>
								<Icon style={{ height: '40px' }}	>
									<ExitToApp />
								</Icon>
								<span className='nav-item-title'>{'SignOut'}</span>
							</Link>
						</li>
					}
				</ul>
			</nav>
		</div>
	)
}

export default Sidebar