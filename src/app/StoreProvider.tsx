"use client"
import { store } from "@/lib/store"
import { setupListeners } from "@reduxjs/toolkit/query"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { Provider } from "react-redux"

Object.assign(window, { store })

interface Props
{
	readonly children: ReactNode
}

export const StoreProvider = ({ children }: Props) =>
{
	const storeRef = useRef<typeof store | null>(null)

	if (!storeRef.current)
	{
		// Create the store instance the first time this renders
		storeRef.current = store
	}

	useEffect(() =>
	{
		if (storeRef.current != null)
		{
			// configure listeners using the provided defaults
			// optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
			const unsubscribe = setupListeners(storeRef.current.dispatch)
			return unsubscribe
		}
	}, [])

	return <Provider store={storeRef.current}>{children}</Provider>
}
