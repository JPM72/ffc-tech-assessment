'use client'

import ListCard from '@/components/lists/ListCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { dashboardSelectors, dashboardThunks } from '@/lib/features/dashboard/dashboardSlice'
import { listSelectors, listThunks } from '@/lib/features/lists/listsSlice'
import { taskThunks } from '@/lib/features/tasks/tasksSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { UserButton, useUser } from '@clerk/nextjs'
import { Task } from '@prisma/client'
import { useEffect, useState } from 'react'

export default function Dashboard()
{
	const dispatch = useAppDispatch()

	const { user, isLoaded } = useUser()
	const lists = useAppSelector(listSelectors.selectListsWithTasks)
	const loading = useAppSelector(dashboardSelectors.selectLoading)
	const [showAddList, setShowAddList] = useState(false)
	const newListTitle = useAppSelector(dashboardSelectors.selectNewListTitle)
	const setNewListTitle = newListTitle => dispatch(dashboardThunks.update({ newListTitle }))
	const searchTerm = useAppSelector(dashboardSelectors.selectSearchTerm)
	const sortBy = useAppSelector(dashboardSelectors.selectSortBy)
	const filterCompleted = useAppSelector(dashboardSelectors.selectFilterCompletionState)
	const setFilterCompleted = filterCompletionState => dispatch(
		dashboardThunks.update({ filterCompletionState })
	)

	const filteredAndSortedLists = useAppSelector(state => listSelectors.selectFilteredAndSorted(
		state, searchTerm, filterCompleted, sortBy
	))

	useEffect(() =>
	{
		if (isLoaded)
		{
			dispatch(listThunks.fetchListsWithTasks()).finally(() =>
			{
				dispatch(dashboardThunks.update({ loading: false }))
			})
		}
	}, [isLoaded])

	const handleAddList = async (e: React.FormEvent) =>
	{
		e.preventDefault()
		const title = newListTitle.trim()
		if (!title) return

		await dispatch(listThunks.addList({ title }))

		dispatch(dashboardThunks.update({
			showAddList: false,
			newListTitle: ''
		}))
	}

	const handleUpdateList = async (id: string, title: string) =>
	{
		await dispatch(listThunks.updateList({ id, title }))
	}

	const handleDeleteList = async (id: string) =>
	{
		if (!confirm('Are you sure you want to delete this list? All tasks will be deleted too.'))
		{
			return
		}

		await dispatch(listThunks.deleteList(id))
	}

	const handleAddTask = async (listId: string, title: string, description?: string) =>
	{
		console.log({ listId, title, description })
		await dispatch(taskThunks.addTask({ listId, title, description }))
	}

	const handleUpdateTask = async (id: string, data: Partial<Task>) =>
	{
		await dispatch(taskThunks.updateTask({ id, ...data }))
	}

	const handleDeleteTask = async (id: string) =>
	{
		await dispatch(taskThunks.deleteTask(id))
	}

	if (!isLoaded || loading)
	{
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col gap-4 items-center justify-center">
				<div role="status">
					<svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
					</svg>
					<span className="sr-only">Loading...</span>
				</div>
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-200">
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
							onChange={(e) => dispatch(dashboardThunks.update({ searchTerm: e.target.value }))}
							className="flex-1"
						/>
						<div className="flex gap-2">
							<select
								value={sortBy}
								onChange={(e) => dispatch(dashboardThunks.update({ sortBy: e.target.value as any }))}
								className="rounded-md bg-white border border-gray-300 px-3 py-2 text-sm"
							>
								<option value="created">Sort by Created</option>
								<option value="name">Sort by Name</option>
								<option value="tasks">Sort by Task Count</option>
							</select>
							<select
								value={filterCompleted}
								onChange={(e) => setFilterCompleted(e.target.value as any)}
								className="rounded-md bg-white border border-gray-300 px-3 py-2 text-sm"
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
									dispatch(dashboardThunks.update({
										showAddList: false,
										newListTitle: ''
									}))
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
								listId={list.id}
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