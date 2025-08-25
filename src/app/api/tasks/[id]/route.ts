import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/user'

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
)
{
	try
	{
		const { userId: clerkUserId } = await auth()

		if (!clerkUserId)
		{
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const user = await syncUser()
		if (!user)
		{
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const { title, description, completed } = await request.json()
		const { id } = await params

		const task = await prisma.task.findFirst({
			where: {
				id,
				list: {
					userId: user.id,
				}
			}
		})

		if (!task)
		{
			return NextResponse.json({ error: 'Task not found' }, { status: 404 })
		}

		const updateData: any = {}

		if (title !== undefined) updateData.title = title
		if (description !== undefined) updateData.description = description || null
		if (completed !== undefined)
		{
			updateData.completed = completed
			updateData.completedAt = completed ? new Date() : null
		}

		const updatedTask = await prisma.task.update({
			where: { id },
			data: updateData
		})

		return NextResponse.json(updatedTask)
	} catch (error)
	{
		console.error('Error updating task:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
)
{
	try
	{
		const { userId: clerkUserId } = await auth()

		if (!clerkUserId)
		{
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const user = await syncUser()
		if (!user)
		{
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		const { id } = await params

		const task = await prisma.task.findFirst({
			where: {
				id,
				list: {
					userId: user.id,
				}
			}
		})

		if (!task)
		{
			return NextResponse.json({ error: 'Task not found' }, { status: 404 })
		}

		await prisma.task.delete({
			where: { id }
		})

		return NextResponse.json({ message: 'Task deleted successfully' })
	} catch (error)
	{
		console.error('Error deleting task:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}