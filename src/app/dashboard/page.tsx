'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { List, Task } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ListCard from '@/components/lists/ListCard'

interface ListWithTasks extends List
{
	tasks: Task[]
}

export default function Dashboard()
{
	const { user, isLoaded } = useUser()
	const [lists, setLists] = useState<ListWithTasks[]>([])
	const [loading, setLoading] = useState(true)
	const [showAddList, setShowAddList] = useState(false)
	const [newListTitle, setNewListTitle] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState<'created' | 'name' | 'tasks'>('created')
	const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'incomplete'>('all')

	useEffect(() =>
	{
		if (isLoaded)
		{
			fetchLists()
		}
	}, [isLoaded])

	const fetchLists = async () =>
	{
		try
		{
			const response = await fetch('/api/lists')
			if (response.ok)
			{
				const data = await response.json()
				setLists(data)
			}
		} catch (error)
		{
			console.error('Error fetching lists:', error)
		} finally
		{
			setLoading(false)
		}
	}

	const handleAddList = async (e: React.FormEvent) =>
	{
		e.preventDefault()
		if (!newListTitle.trim()) return

		try
		{
			const response = await fetch('/api/lists', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ title: newListTitle.trim() }),
			})

			if (response.ok)
			{
				const newList = await response.json()
				setLists(prev => [newList, ...prev])
				setNewListTitle('')
				setShowAddList(false)
			}
		} catch (error)
		{
			console.error('Error creating list:', error)
		}
	}

	const handleUpdateList = async (id: string, title: string) =>
	{
		try
		{
			const response = await fetch(`/api/lists/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ title }),
			})

			if (response.ok)
			{
				const updatedList = await response.json()
				setLists(prev => prev.map(list => list.id === id ? updatedList : list))
			}
		} catch (error)
		{
			console.error('Error updating list:', error)
		}
	}

	const handleDeleteList = async (id: string) =>
	{
		if (!confirm('Are you sure you want to delete this list? All tasks will be deleted too.'))
		{
			return
		}

		try
		{
			const response = await fetch(`/api/lists/${id}`, {
				method: 'DELETE',
			})

			if (response.ok)
			{
				setLists(prev => prev.filter(list => list.id !== id))
			}
		} catch (error)
		{
			console.error('Error deleting list:', error)
		}
	}

	const handleAddTask = async (listId: string, title: string, description?: string) =>
	{
		try
		{
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ listId, title, description }),
			})

			if (response.ok)
			{
				const newTask = await response.json()
				setLists(prev => prev.map(list =>
					list.id === listId
						? { ...list, tasks: [newTask, ...list.tasks] }
						: list
				))
			}
		} catch (error)
		{
			console.error('Error creating task:', error)
		}
	}

	const handleUpdateTask = async (id: string, data: Partial<Task>) =>
	{
		try
		{
			const response = await fetch(`/api/tasks/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (response.ok)
			{
				const updatedTask = await response.json()
				setLists(prev => prev.map(list => ({
					...list,
					tasks: list.tasks.map(task => task.id === id ? updatedTask : task)
				})))
			}
		} catch (error)
		{
			console.error('Error updating task:', error)
		}
	}

	const handleDeleteTask = async (id: string) =>
	{
		try
		{
			const response = await fetch(`/api/tasks/${id}`, {
				method: 'DELETE',
			})

			if (response.ok)
			{
				setLists(prev => prev.map(list => ({
					...list,
					tasks: list.tasks.filter(task => task.id !== id)
				})))
			}
		} catch (error)
		{
			console.error('Error deleting task:', error)
		}
	}

	const filteredAndSortedLists = lists
		.filter(list =>
		{
			const matchesSearch = searchTerm === '' ||
				list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				list.tasks.some(task =>
					task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
				)

			if (!matchesSearch) return false

			if (filterCompleted === 'all') return true

			const hasCompletedTasks = list.tasks.some(task => task.completed)
			const hasIncompleteTasks = list.tasks.some(task => !task.completed)

			if (filterCompleted === 'completed') return hasCompletedTasks
			if (filterCompleted === 'incomplete') return hasIncompleteTasks || list.tasks.length === 0

			return true
		})
		.sort((a, b) =>
		{
			switch (sortBy)
			{
				case 'name':
					return a.title.localeCompare(b.title)
				case 'tasks':
					return b.tasks.length - a.tasks.length
				case 'created':
				default:
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			}
		})

	if (!isLoaded || loading)
	{
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Todo Lists</h1>
							<p className="text-gray-600">Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
						</div>
						<UserButton afterSignOutUrl="/" />
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8 space-y-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<Input
							placeholder="Search lists and tasks..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1"
						/>
						<div className="flex gap-2">
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as any)}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm"
							>
								<option value="created">Sort by Created</option>
								<option value="name">Sort by Name</option>
								<option value="tasks">Sort by Task Count</option>
							</select>
							<select
								value={filterCompleted}
								onChange={(e) => setFilterCompleted(e.target.value as any)}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm"
							>
								<option value="all">All Lists</option>
								<option value="completed">With Completed Tasks</option>
								<option value="incomplete">With Incomplete Tasks</option>
							</select>
						</div>
					</div>

					{showAddList ? (
						<form onSubmit={handleAddList} className="flex gap-2">
							<Input
								value={newListTitle}
								onChange={(e) => setNewListTitle(e.target.value)}
								placeholder="List title"
								className="flex-1"
								autoFocus
							/>
							<Button type="submit">Add List</Button>
							<Button
								type="button"
								onClick={() =>
								{
									setShowAddList(false)
									setNewListTitle('')
								}}
								variant="secondary"
							>
								Cancel
							</Button>
						</form>
					) : (
						<Button onClick={() => setShowAddList(true)}>Add New List</Button>
					)}
				</div>

				{filteredAndSortedLists.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredAndSortedLists.map(list => (
							<ListCard
								key={list.id}
								list={list}
								onUpdateList={handleUpdateList}
								onDeleteList={handleDeleteList}
								onAddTask={handleAddTask}
								onUpdateTask={handleUpdateTask}
								onDeleteTask={handleDeleteTask}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg mb-4">
							{lists.length === 0 ? 'No lists yet. Create your first list to get started!' : 'No lists match your search criteria.'}
						</p>
						{lists.length === 0 && (
							<Button onClick={() => setShowAddList(true)}>Create Your First List</Button>
						)}
					</div>
				)}
			</main>
		</div>
	)
}