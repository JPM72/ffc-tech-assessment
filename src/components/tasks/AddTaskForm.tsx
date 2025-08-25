'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface AddTaskFormProps
{
	onAdd: (title: string, description?: string) => void
	onCancel: () => void
}

export default function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps)
{
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	const handleSubmit = (e: React.FormEvent) =>
	{
		e.preventDefault()
		if (title.trim())
		{
			onAdd(title.trim(), description.trim() || undefined)
			setTitle('')
			setDescription('')
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<Input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Task title"
				required
				autoFocus
			/>
			<Input
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Task description (optional)"
			/>
			<div className="flex items-center space-x-2">
				<Button type="submit" size="sm">Add Task</Button>
				<Button type="button" onClick={onCancel} variant="secondary" size="sm">
					Cancel
				</Button>
			</div>
		</form>
	)
}