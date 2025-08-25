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

		const { title } = await request.json()
		const { id } = await params

		if (!title || typeof title !== 'string')
		{
			return NextResponse.json({ error: 'Title is required' }, { status: 400 })
		}

		const list = await prisma.list.findFirst({
			where: {
				id,
				userId: user.id,
			}
		})

		if (!list)
		{
			return NextResponse.json({ error: 'List not found' }, { status: 404 })
		}

		const updatedList = await prisma.list.update({
			where: { id },
			data: { title },
			include: {
				tasks: {
					orderBy: { createdAt: 'desc' }
				}
			}
		})

		return NextResponse.json(updatedList)
	} catch (error)
	{
		console.error('Error updating list:', error)
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

		const list = await prisma.list.findFirst({
			where: {
				id,
				userId: user.id,
			}
		})

		if (!list)
		{
			return NextResponse.json({ error: 'List not found' }, { status: 404 })
		}

		await prisma.list.delete({
			where: { id }
		})

		return NextResponse.json({ message: 'List deleted successfully' })
	} catch (error)
	{
		console.error('Error deleting list:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}