import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { Task, List } from '@prisma/client'
import type { ListWithTasks } from './features/lists/listsSlice'
import _ from 'lodash'

const TAG_LISTS = { type: 'Lists', id: 'LIST' } as const
const TAG_TASKS = { type: 'Tasks', id: 'TASK' } as const

export const apiService = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/',
		prepareHeaders: (headers) =>
		{
			headers.set('Content-Type', 'application/json')
		},
		paramsSerializer: params => JSON.stringify({ params }),
	}),
	tagTypes: [TAG_LISTS.type, TAG_TASKS.type],
	endpoints: builder => ({
		getLists: builder.query<ListWithTasks[], void>({
			query: () => ({
				url: 'lists',
				method: 'GET',
			}),
			providesTags: (result, error, id) =>
			{
				console.log({ result, error, id })
				return result
					? [
						...result.map(({ id }) => ({ type: TAG_LISTS.type, id } as const)),
						..._(result).flatMap('tasks').map(
							({ id }) => ({ type: TAG_TASKS.type, id } as const)
						).value(),
						TAG_LISTS,
						TAG_TASKS,
					]
					: [TAG_LISTS, TAG_TASKS]
			}
		}),
		addList: builder.mutation<List, Partial<List>>({
			query: body => ({
				url: 'lists',
				body,
				method: 'POST',
			}),
			invalidatesTags: [TAG_LISTS],
		}),
		updateList: builder.mutation<List, Partial<List>>({
			query: body => ({
				url: `lists/${body.id}`,
				body,
				method: 'PUT',
			}),
			invalidatesTags: [TAG_LISTS],
		}),
		deleteList: builder.mutation<void, string>({
			query: id => ({
				url: `lists/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags(result, error, id, meta)
			{
				if (meta?.response.ok === true)
				{
					return [{ type: TAG_LISTS.type, id }]
				}
			},
		}),
		addTask: builder.mutation<Task, Partial<Task>>({
			query: body => ({
				url: 'tasks',
				body,
				method: 'POST',
			}),
			invalidatesTags: [TAG_LISTS, TAG_TASKS],
		}),
		updateTask: builder.mutation<Task, Partial<Task>>({
			query: body => ({
				url: `tasks/${body.id}`,
				body,
				method: 'PUT',
			}),
			invalidatesTags: [TAG_TASKS],
		}),
		deleteTask: builder.mutation<void, string>({
			query: id => ({
				url: `tasks/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags(result, error, id, meta)
			{
				if (meta?.response.ok === true)
				{
					return [{ type: TAG_TASKS.type, id }]
				}
			},
		}),
	})
})