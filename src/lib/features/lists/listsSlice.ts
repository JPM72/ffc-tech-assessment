import { apiService } from '@/lib/apiService'
import { createAppAsyncThunk, createAppSelector } from '@/lib/creators'
import { type AppThunk } from '@/lib/store'
import { getAdapterReducers, getAdapterSelectors } from '@/lib/util/adapter'
import diff from '@/lib/util/diff'
import { List, Task } from '@prisma/client'
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import { taskSelectors, taskThunks } from '../tasks/tasksSlice'
import { type DashboardState } from '../dashboard/dashboardSlice'

export interface ListWithTasks extends List
{
	tasks: Task[]
}

export type ListSortKey = 'created' | 'name' | 'tasks'

const name = 'list'
const reducerPath = 'lists'

const defaults = (list: Partial<List>) =>
{
	return _.defaults({}, list, {
		title: '',
	}) as List
}

const adapter = createEntityAdapter<List, string>({
	selectId: ({ id }) => id,
})
const initialState = adapter.getInitialState
export type ListState = ReturnType<typeof adapter.getInitialState>

const slice = createSlice({
	name, reducerPath,
	initialState,
	reducers: {
		...getAdapterReducers<List, string>(adapter, { defaults }),
	}
})
const { actions } = slice

const {
	rootSelector: listRootSelector,
	...selectors
} = getAdapterSelectors<List>(adapter, ['domain', reducerPath])
export { listRootSelector }

const selectListsWithTasks = createAppSelector([
	selectors.selectEntities,
	taskSelectors.selectAll,
], (lists, tasks) =>
{
	const groupedTasks = _.groupBy(tasks, 'listId')
	return _.map(lists, (list, id) => ({
		...list,
		tasks: groupedTasks[id] ?? []
	}))
})

const selectFilteredAndSorted = createAppSelector([
	selectListsWithTasks,
	(state, searchTerm: string) => searchTerm,
	(state, searchTerm, completionState: DashboardState['filterCompletionState']) => completionState,
	(state, searchTerm, completionState, sortBy: ListSortKey) => sortBy,
], (lists, searchTerm, completionState, sortBy) =>
{
	const searchTermToLower = _.toLower(searchTerm)
	const toLowerIncludes = s => _.toLower(s).includes(searchTermToLower)

	let filtered = lists
	if (searchTermToLower !== '')
	{
		filtered = _.filter(filtered, ({ title, tasks }) =>
		{
			return toLowerIncludes(title)
				|| _.some(tasks, ({ title, description }) =>
					toLowerIncludes(title)
					|| toLowerIncludes(description)
				)
		})
	}

	const filterCompletionState = {
		all: null, completed: true, incomplete: false
	}[completionState]

	if (filterCompletionState !== null)
	{
		filtered = _.filter(filtered, ({ tasks }) => _.some(tasks, { completed: filterCompletionState }))
	}

	filtered = filtered.sort((a, b) =>
	{
		switch (sortBy)
		{
			case 'name':
				return a.title.localeCompare(b.title)
			case 'tasks':
				return b.tasks.length - a.tasks.length
			case 'created':
			default:
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		}
	})

	return filtered
})

export const listSelectors = {
	...selectors,
	selectListsWithTasks,
	selectFilteredAndSorted,
}

const setLists = (lists): AppThunk => (dispatch) => dispatch(actions.createAll(lists))

const addList = createAppAsyncThunk<List, Partial<List>>(`${reducerPath}/add`, async (listData, { dispatch }) =>
{
	const req = await dispatch(apiService.endpoints.addList.initiate(defaults(listData)))
	const list = req.data
	dispatch(actions.addOne(list))
	return list
})

const updateList = createAppAsyncThunk<List, Partial<List>>(`${reducerPath}/update`, async (listData, { dispatch, getState }) =>
{
	const state = getState()
	const { id } = listData
	const existing = selectors.selectById(state, id)
	const req = await dispatch(apiService.endpoints.updateList.initiate(defaults(listData)))
	const list = req.data
	dispatch(actions.updateOne({
		id,
		changes: diff.updated(existing, list)
	}))
	return list
})

const deleteList = createAppAsyncThunk<void, string>(`${reducerPath}/delete`, async (id, { dispatch }) =>
{
	const req = await dispatch(apiService.endpoints.deleteList.initiate(id))
	if (req.error) return
	dispatch(actions.removeOne(id))
})

const fetchListsWithTasks = createAppAsyncThunk<ListWithTasks[], undefined>(`${reducerPath}/fetch`, async (v, { dispatch }) =>
{
	const req = await dispatch(apiService.endpoints.getLists.initiate())
	console.log(req)
	if (!req.isSuccess) return []

	const { data } = req
	const listData = []
	const taskData = []

	for (const { tasks, ...rest } of data)
	{
		listData.push(rest)
		taskData.push(...tasks)
	}

	dispatch(setLists(listData))
	dispatch(taskThunks.setTasks(taskData))

	return data
})

export const listThunks = {
	setLists,
	addList,
	updateList,
	deleteList,
	fetchListsWithTasks,
}

export const listsSlice = {
	initialState, defaults,
	adapter, slice,
	get actions() { return slice.actions },
	get reducer() { return slice.reducer },
}
export default listsSlice