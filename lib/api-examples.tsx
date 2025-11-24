// Example: Using the API services in your components

import { useEffect, useState } from 'react'
import { taskService, authService, dashboardService } from '@/lib/api-service'
import type { Task, User, DashboardStats } from '@/lib/api-types'

// Example 1: Login Component
export function LoginExample() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    setError('')

    const { data, error: apiError } = await authService.login({ 
      username, 
      password 
    })

    if (apiError) {
      setError(apiError)
      setLoading(false)
      return
    }

    if (data?.access_token) {
      // Token is automatically stored by setAuthToken
      localStorage.setItem('auth_token', data.access_token)
      // Redirect to dashboard
      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div>
      <button 
        onClick={() => handleLogin('testuser', 'password')}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

// Example 2: Fetch and Display Tasks
export function TaskListExample() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await taskService.getTasks()
      
      if (error) {
        console.error('Failed to fetch tasks:', error)
        setLoading(false)
        return
      }

      if (data) {
        setTasks(data)
      }
      setLoading(false)
    }

    fetchTasks()
  }, [])

  if (loading) return <div>Loading tasks...</div>

  return (
    <div>
      <h2>My Tasks</h2>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>XP: {task.xp_reward}</span>
        </div>
      ))}
    </div>
  )
}

// Example 3: Complete a Task
export function CompleteTaskExample({ taskId }: { taskId: number }) {
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)

    const { data, error } = await taskService.completeTask(taskId)

    if (error) {
      console.error('Failed to complete task:', error)
      setCompleting(false)
      return
    }

    if (data) {
      console.log('Task completed!', data)
      console.log(`Earned ${data.xp_earned} XP and ${data.coins_earned} coins!`)
      // Refresh task list or update UI
    }

    setCompleting(false)
  }

  return (
    <button onClick={handleComplete} disabled={completing}>
      {completing ? 'Completing...' : 'Complete Task'}
    </button>
  )
}

// Example 4: Create a New Task
export function CreateTaskExample() {
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)

    const { data, error } = await taskService.createTask({
      title: 'New Habit',
      description: 'Practice meditation daily',
      task_type: 'habit',
      difficulty: 'medium',
      tag_ids: [1, 2], // Optional: tag IDs
    })

    if (error) {
      console.error('Failed to create task:', error)
      setCreating(false)
      return
    }

    if (data) {
      console.log('Task created!', data)
      // Refresh task list or redirect
    }

    setCreating(false)
  }

  return (
    <button onClick={handleCreate} disabled={creating}>
      {creating ? 'Creating...' : 'Create Task'}
    </button>
  )
}

// Example 5: Dashboard Stats
export function DashboardExample() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await dashboardService.getStats()

      if (error) {
        console.error('Failed to fetch stats:', error)
        setLoading(false)
        return
      }

      if (data) {
        setStats(data)
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading stats...</div>
  if (!stats) return <div>No stats available</div>

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <p>Level: {stats.level}</p>
        <p>Total XP: {stats.total_xp}</p>
        <p>Coins: {stats.coins}</p>
        <p>Current Streak: {stats.current_streak}</p>
        <p>Completed Today: {stats.completed_today}</p>
        <p>Total Tasks: {stats.total_tasks}</p>
      </div>
    </div>
  )
}

// Example 6: Get Current User
export function UserProfileExample() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await authService.getCurrentUser()

      if (error) {
        console.error('Failed to fetch user:', error)
        return
      }

      if (data) {
        setUser(data)
      }
    }

    fetchUser()
  }, [])

  if (!user) return <div>Loading user...</div>

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <p>Email: {user.email}</p>
      <p>Level: {user.level}</p>
      <p>XP: {user.xp}</p>
      <p>Coins: {user.coins}</p>
      <p>Streak: {user.streak}</p>
    </div>
  )
}

// Example 7: Error Handling with Toast
import { useToast } from '@/hooks/use-toast'

export function TaskWithToastExample({ taskId }: { taskId: number }) {
  const { toast } = useToast()

  const handleComplete = async () => {
    const { data, error } = await taskService.completeTask(taskId)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      return
    }

    if (data) {
      toast({
        title: 'Task Completed! 🎉',
        description: `You earned ${data.xp_earned} XP and ${data.coins_earned} coins!`,
      })
    }
  }

  return (
    <button onClick={handleComplete}>
      Complete Task
    </button>
  )
}

// Example 8: Protected Route (HOC)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const checkAuth = async () => {
        const { data, error } = await authService.getCurrentUser()

        if (error || !data) {
          // Redirect to login
          window.location.href = '/login'
          return
        }

        setIsAuthenticated(true)
        setLoading(false)
      }

      checkAuth()
    }, [])

    if (loading) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Usage: export default withAuth(MyProtectedPage)
