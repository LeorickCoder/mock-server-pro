import React, { useState, useEffect } from 'react'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import UserDetails from './components/UserDetails'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 获取单个用户
  const viewUser = async (id) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      setCurrentUser(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 创建新用户
  const createUser = async (userData) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) throw new Error('Failed to create user')
      
      const createdUser = await response.json()
      setUsers([...users, createdUser])
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 更新用户
  const updateUser = async (userData) => {
    if (!currentUser) return false
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) throw new Error('Failed to update user')
      
      const updatedUser = await response.json()
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user))
      setCurrentUser(updatedUser)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 删除用户
  const deleteUser = async (id) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      setUsers(users.filter(user => user.id !== id))
      if (currentUser && currentUser.id === id) {
        setCurrentUser(null)
      }
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="app">
      <header>
        <h1>Mock Server Pro - Webpack Demo</h1>
      </header>
      
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <UserList 
                users={users} 
                loading={loading} 
                error={error} 
                onView={viewUser} 
                onDelete={deleteUser} 
                onRefresh={fetchUsers} 
              />
              
              <UserForm onSubmit={createUser} />
            </div>
            
            <div className="col">
              {currentUser && (
                <UserDetails 
                  user={currentUser} 
                  onUpdate={updateUser} 
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} Mock Server Pro</p>
      </footer>
    </div>
  )
}

export default App 