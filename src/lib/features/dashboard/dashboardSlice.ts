import { type ListSortKey } from '../lists/listsSlice'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'
import { createPathSelector, createAppSelector } from '@/lib/creators'
import { type AppThunk } from '@/lib/store'

export interface DashboardState
{
	loading: boolean
	showAddList: boolean
	newListTitle: string
	searchTerm: string
	sortBy: ListSortKey
	filterCompletionState: 'all' | 'completed' | 'incomplete'
}

const name = 'dashboard'

const initialState = () => ({
	loading: true,
	showAddList: false,
	newListTitle: '',
	searchTerm: '',
	sortBy: 'created',
	filterCompletionState: 'all',
}) as DashboardState

const KEYS = _.keys(initialState())

const slice = createSlice({
	name,
	initialState,
	reducers: {
		merge: {
			reducer: (state, { payload }: PayloadAction<Partial<DashboardState>>) =>
			{
				_.merge(state, payload)
			},
			prepare: data => ({
				payload: _.pick(data, KEYS) as Partial<DashboardState>
			}),
		},
		reset: state =>
		{
			_.assign(state, initialState())
		}
	}
})
const { actions } = slice

const dashboardRootSelector = createPathSelector(['view'])<DashboardState>(['dashboard'])

export const dashboardSelectors = {
	root: dashboardRootSelector,
	selectLoading: createAppSelector([dashboardRootSelector], ({ loading }) => loading),
	selectShowAddList: createAppSelector([dashboardRootSelector], ({ showAddList }) => showAddList),
	selectNewListTitle: createAppSelector([dashboardRootSelector], ({ newListTitle }) => newListTitle),
	selectSearchTerm: createAppSelector([dashboardRootSelector], ({ searchTerm }) => searchTerm),
	selectSortBy: createAppSelector([dashboardRootSelector], ({ sortBy }) => sortBy),
	selectFilterCompletionState: createAppSelector([dashboardRootSelector], ({ filterCompletionState }) => filterCompletionState),
}

const updateDashboardState = (state: Partial<DashboardState>): AppThunk => dispatch => dispatch(
	actions.merge(state)
)

export const dashboardThunks = {
	update: updateDashboardState,
}

export const dashboardSlice = {
	initialState,
	slice,
	get actions() { return slice.actions },
	get reducer() { return slice.reducer },
}