import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home()
{
	return (
		<main className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Todo App</h1>
				<p className="text-gray-600 mb-6 text-center">
					Welcome to your personal todo list application.
				</p>

				<SignedOut>
					<div className="space-y-4">
						<SignInButton mode="modal">
							<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
								Sign In
							</button>
						</SignInButton>
						<Link
							href="/sign-up"
							className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors block text-center"
						>
							Sign Up
						</Link>
					</div>
				</SignedOut>

				<SignedIn>
					<Link
						href="/dashboard"
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
					>
						Go to Dashboard
					</Link>
				</SignedIn>
			</div>
		</main>
	)
}