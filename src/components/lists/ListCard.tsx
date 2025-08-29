'use client'

import { useState } from 'react'
import { List, Task } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import TaskItem from '@/components/tasks/TaskItem'
import AddTaskForm from '@/components/tasks/AddTaskForm'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { taskThunks } from '@/lib/features/tasks/tasksSlice'
import { ListWithTasks, listSelectors } from '@/lib/features/lists/listsSlice'
interface ListCardProps
{
	listId: string
	onUpdateList: (id: string, title: string) => void
	onDeleteList: (id: string) => void
	onAddTask: (listId: string, title: string, description?: string) => void
	onUpdateTask: (id: string, data: Partial<Task>) => void
	onDeleteTask: (id: string) => void
}

export default function ListCard({
	listId,
	onUpdateList,
	onDeleteList,
	onAddTask,
	onUpdateTask,
	onDeleteTask
}: ListCardProps)
{
	const dispatch = useAppDispatch()

	const list = useAppSelector(state => listSelectors.selectListWithTasks(state, listId))

	const [isEditing, setIsEditing] = useState(false)
	const [title, setTitle] = useState(list.title)
	const [showAddTask, setShowAddTask] = useState(false)

	const handleSaveTitle = () =>
	{
		if (title.trim() && title !== list.title)
		{
			onUpdateList(list.id, title.trim())
		}
		setIsEditing(false)
	}

	const handleCancelEdit = () =>
	{
		setTitle(list.title)
		setIsEditing(false)
	}

	const completedTasks = list.tasks.filter(task => task.completed).length
	const totalTasks = list.tasks.length

	return (
		<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
			<div className="flex items-center justify-between">
				{isEditing ? (
					<div className="flex-1 flex items-center space-x-2">
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={(e) =>
							{
								if (e.key === 'Enter') handleSaveTitle()
								if (e.key === 'Escape') handleCancelEdit()
							}}
							className="flex-1"
							autoFocus
						/>
						<Button onClick={handleSaveTitle} size="sm">Save</Button>
						<Button onClick={handleCancelEdit} variant="secondary" size="sm">Cancel</Button>
					</div>
				) : (
					<>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900">{list.title}</h3>
							<p className="text-sm text-gray-500">
								{completedTasks}/{totalTasks} tasks completed
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								onClick={() => setIsEditing(true)}
								variant="secondary"
								size="sm"
							>
								Edit
							</Button>
							<Button
								onClick={() => onDeleteList(list.id)}
								variant="danger"
								size="sm"
							>
								Delete
							</Button>
						</div>
					</>
				)}
			</div>

			<div className="space-y-2">
				{list.tasks.length > 0 ? (
					list.tasks.map(task => (
						<TaskItem
							key={task.id}
							taskId={task.id}
							onUpdate={onUpdateTask}
							onDelete={onDeleteTask}
						/>
					))
				) : (
					<p className="text-gray-500 text-center py-4">No tasks yet</p>
				)}
			</div>

			{showAddTask ? (
				<AddTaskForm
					onAdd={(title, description) => onAddTask(listId, title, description)}
					onCancel={() => setShowAddTask(false)}
				/>
			) : (
				<Button
					onClick={() => setShowAddTask(true)}
					variant="secondary"
					className="w-full"
				>
					Add Task
				</Button>
			)}
		</div>
	)
}