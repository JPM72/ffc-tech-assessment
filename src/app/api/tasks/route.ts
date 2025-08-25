import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/user'

export async function POST(request: Request)
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

		const { title, description, listId } = await request.json()

		if (!title || typeof title !== 'string')
		{
			return NextResponse.json({ error: 'Title is required' }, { status: 400 })
		}

		if (!listId || typeof listId !== 'string')
		{
			return NextResponse.json({ error: 'List ID is required' }, { status: 400 })
		}

		const list = await prisma.list.findFirst({
			where: {
				id: listId,
				userId: user.id,
			}
		})

		if (!list)
		{
			return NextResponse.json({ error: 'List not found' }, { status: 404 })
		}

		const task = await prisma.task.create({
			data: {
				title,
				description: description || null,
				listId,
			}
		})

		return NextResponse.json(task)
	} catch (error)
	{
		console.error('Error creating task:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}