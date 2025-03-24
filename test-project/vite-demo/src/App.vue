<template>
  <div class="app">
    <h1>Mock Server Pro Demo</h1>
    <div class="user-list">
      <h2>用户列表</h2>
      <ul v-if="users.length">
        <li v-for="user in users" :key="user.id">
          {{ user.name }} ({{ user.email }})
        </li>
      </ul>
      <p v-else>暂无用户</p>
    </div>
    <div class="user-form">
      <h2>添加用户</h2>
      <form @submit.prevent="addUser">
        <div>
          <label>姓名：</label>
          <input v-model="newUser.name" required>
        </div>
        <div>
          <label>邮箱：</label>
          <input v-model="newUser.email" type="email" required>
        </div>
        <button type="submit">添加</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const newUser = ref({
  name: '',
  email: ''
})

const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users')
    users.value = await response.json()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const addUser = async () => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value)
    })
    if (response.ok) {
      await fetchUsers()
      newUser.value = { name: '', email: '' }
    }
  } catch (error) {
    console.error('添加用户失败:', error)
  }
}

onMounted(fetchUsers)
</script>

<style>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.user-list, .user-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style> 