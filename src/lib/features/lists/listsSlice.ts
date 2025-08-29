import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type EntityId, createEntityAdapter } from '@reduxjs/toolkit'
import { Task, List } from '@prisma/client'
import _ from 'lodash'
import { getAdapterReducers, getAdapterSelectors } from '@/lib/util/adapter'
import { type AppThunk } from '@/lib/store'
import { createAppAsyncThunk, createAppSelector } from '@/lib/creators'
import { apiService } from '@/lib/apiService'
import { taskThunks, taskSelectors } from '../tasks/tasksSlice'

export interface ListWithTasks extends List
{
	tasks: Task[]
}

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
	console.log(tasks)
	const groupedTasks = _.groupBy(tasks, 'listId')
	return _.map(lists, (list, id) => ({
		...list,
		tasks: groupedTasks[id] ?? []
	}))
})

export const listSelectors = {
	...selectors,
	selectListsWithTasks,
}

const setLists = (lists): AppThunk => (dispatch) => dispatch(actions.createAll(lists))

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
	fetchListsWithTasks,
}

export const listsSlice = {
	initialState, defaults,
	adapter, slice,
	get actions() { return slice.actions },
	get reducer() { return slice.reducer },
}
export default listsSlice