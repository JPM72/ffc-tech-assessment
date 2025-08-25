import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/user'

export async function GET()
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

		const lists = await prisma.list.findMany({
			where: { userId: user.id },
			include: {
				tasks: {
					orderBy: { createdAt: 'desc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return NextResponse.json(lists)
	} catch (error)
	{
		console.error('Error fetching lists:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

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

		const { title } = await request.json()

		if (!title || typeof title !== 'string')
		{
			return NextResponse.json({ error: 'Title is required' }, { status: 400 })
		}

		const list = await prisma.list.create({
			data: {
				title,
				userId: user.id,
			},
			include: {
				tasks: true
			}
		})

		return NextResponse.json(list)
	} catch (error)
	{
		console.error('Error creating list:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}