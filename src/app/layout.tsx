import './globals.css'
import type { Metadata } from 'next'
import { StrictMode } from 'react'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { StoreProvider } from './StoreProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Todo App',
	description: 'A full-stack todo list application with user authentication',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
})
{
	return (
		<StrictMode>
			<StoreProvider>
				<ClerkProvider>
					<html lang="en">
						<link rel="icon" href="/favicon.ico" sizes="any" />
						<body className={inter.className}>{children}</body>
					</html>
				</ClerkProvider>
			</StoreProvider>
		</StrictMode>
	)
}