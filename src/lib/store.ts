import type {
	UnknownAction,
	ThunkAction,
	Action,
} from '@reduxjs/toolkit'
import
{
	configureStore,
	combineSlices,
} from '@reduxjs/toolkit'

import listenerMiddleware from './listenerMiddleware'
import { tasksSlice } from './features/tasks/tasksSlice'
import { listsSlice } from './features/lists/listsSlice'
import { apiService } from './apiService'

const domainSlice = combineSlices({
	[tasksSlice.slice.reducerPath]: tasksSlice.reducer,
	[listsSlice.slice.reducerPath]: listsSlice.reducer,
})

export const store = configureStore({
	devTools: process.env.NODE_ENV !== 'production',
	reducer: {
		domain: domainSlice,
		[apiService.reducerPath]: apiService.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(
		listenerMiddleware.middleware
	).concat([
		apiService.middleware
	])
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<
	ReturnType = void,
	ExtraThunkArg = unknown,
	ActionType extends Action = UnknownAction
> = ThunkAction<
	ReturnType,
	AppState,
	ExtraThunkArg,
	ActionType
>