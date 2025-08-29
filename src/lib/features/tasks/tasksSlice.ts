import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type EntityId, createEntityAdapter } from '@reduxjs/toolkit'
import { Task } from '@prisma/client'
import _ from 'lodash'
import { getAdapterReducers, getAdapterSelectors } from '@/lib/util/adapter'
import { createAppAsyncThunk, createAppSelector } from '@/lib/creators'
import { apiService } from '@/lib/apiService'
import { type AppThunk } from '@/lib/store'
import diff from '@/lib/util/diff'

const name = 'task'
const reducerPath = 'tasks'

const defaults = (task: Partial<Task>) =>
{
	return _.defaults({}, task, {
		title: '',
		description: '',
		completed: false,
	}) as Task
}

const adapter = createEntityAdapter<Task, string>({
	selectId: ({ id }) => id,
})
const initialState = adapter.getInitialState
export type TaskState = ReturnType<typeof adapter.getInitialState>

const slice = createSlice({
	name, reducerPath,
	initialState,
	reducers: {
		...getAdapterReducers<Task, string>(adapter, { defaults }),
	}
})
const { actions } = slice

const {
	rootSelector: taskRootSelector,
	...selectors
} = getAdapterSelectors<Task>(adapter, ['domain', reducerPath])
export { taskRootSelector }

export const taskSelectors = {
	...selectors,
}

const setTasks = (tasks): AppThunk => (dispatch) => dispatch(actions.createAll(tasks))

const addTask = createAppAsyncThunk<Task, Partial<Task>>(`${reducerPath}/add`, async (taskData, { dispatch }) =>
{
	const req = await dispatch(apiService.endpoints.addTask.initiate(defaults(taskData)))
	const task = req.data
	dispatch(actions.addOne(task))
	return task
})

const updateTask = createAppAsyncThunk<Task, Partial<Task>>(`${reducerPath}/update`, async (taskData, { dispatch, getState }) =>
{
	const state = getState()
	const { id } = taskData
	const existing = selectors.selectById(state, id)
	const updated = _.defaultsDeep({}, taskData, existing)
	const req = await dispatch(apiService.endpoints.updateTask.initiate(updated))
	const task = req.data
	dispatch(actions.updateOne({
		id,
		changes: diff.updated(existing, task)
	}))
	return task
})

const deleteTask = createAppAsyncThunk<void, string>(`${reducerPath}/delete`, async (id, { dispatch }) =>
{
	const req = await dispatch(apiService.endpoints.deleteTask.initiate(id))
	if (req.error) return
	dispatch(actions.removeOne(id))
})

export const taskThunks = {
	setTasks,
	addTask,
	updateTask,
	deleteTask,
}

export const tasksSlice = {
	initialState, defaults,
	adapter, slice,
	get actions() { return slice.actions },
	get reducer() { return slice.reducer },
}
export default tasksSlice