import { prisma } from './prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function syncUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return null

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  })

  if (existingUser) {
    return existingUser
  }

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
    }
  })

  return newUser
}