'use client'

import { useState } from 'react'
import { Task } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { tasksSlice, taskSelectors, taskThunks } from '@/lib/features/tasks/tasksSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

interface TaskItemProps
{
	taskId: string
	onUpdate: (id: string, data: Partial<Task>) => void
	onDelete: (id: string) => void
}

export default function TaskItem({ taskId, onUpdate, onDelete }: TaskItemProps)
{
	const dispatch = useAppDispatch()
	const task = useAppSelector(state => taskSelectors.selectById(state, taskId))
	const [isEditing, setIsEditing] = useState(false)
	const [title, setTitle] = useState(task.title)
	const [description, setDescription] = useState(task.description || '')

	const handleToggleComplete = () =>
	{
		// dispatch(tasksSlice.actions.updateOne({
		// 	id: taskId,
		// 	changes: { completed: !task.completed }
		// }))
		onUpdate(task.id, { completed: !task.completed })
	}

	const handleSave = () =>
	{
		if (title.trim())
		{
			onUpdate(task.id, {
				title: title.trim(),
				description: description.trim() || null
			})
			setIsEditing(false)
		}
	}

	const handleCancel = () =>
	{
		setTitle(task.title)
		setDescription(task.description || '')
		setIsEditing(false)
	}

	return (
		<div className={`border rounded-lg p-3 ${task.completed ? 'bg-gray-50' : 'bg-white'}`}>
			{isEditing ? (
				<div className="space-y-3">
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Task title"
					/>
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Task description (optional)"
					/>
					<div className="flex items-center space-x-2">
						<Button onClick={handleSave} size="sm">Save</Button>
						<Button onClick={handleCancel} variant="secondary" size="sm">Cancel</Button>
					</div>
				</div>
			) : (
				<div className="flex items-start space-x-3">
					<input
						type="checkbox"
						checked={task.completed}
						onChange={handleToggleComplete}
						className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<div className="flex-1 min-w-0">
						<h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
							{task.title}
						</h4>
						{task.description && (
							<p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
								{task.description}
							</p>
						)}
						{task.completedAt && (
							<p className="text-xs text-gray-400 mt-1">
								Completed on {new Date(task.completedAt).toLocaleDateString()}
							</p>
						)}
					</div>
					<div className="flex items-center space-x-1">
						<Button
							onClick={() => setIsEditing(true)}
							variant="secondary"
							size="sm"
						>
							Edit
						</Button>
						<Button
							onClick={() => onDelete(task.id)}
							variant="danger"
							size="sm"
						>
							Delete
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}