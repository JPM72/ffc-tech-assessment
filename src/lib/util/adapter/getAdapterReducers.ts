import _ from 'lodash'
import type {
	EntityAdapter,
	EntityId,
	EntityState,
	PayloadAction,
} from '@reduxjs/toolkit'

type AddedIds = Record<string, { id: number } & object>

interface Options<T>
{
	defaults?: ((parameters: Partial<T>) => NonNullable<T>)
}
type CreateParameter<T> = Partial<T> | Partial<T>[]

export function getAdapterReducers<T, I extends EntityId = EntityId>(adapter: EntityAdapter<T, I>, options?: Options<T>)
{
	const opts = _.defaults(options, {
		defaults: _.identity
	})
	const {
		defaults
	} = opts

	const prepareCreate = (data: CreateParameter<T>) => ({
		payload: _.castArray(data).map(defaults)
	})

	return {
		create: {
			reducer: (state, { payload }: PayloadAction<CreateParameter<T>>) => adapter.addMany(
				state ?? adapter.getInitialState(),
				payload as T[]
			),
			prepare: prepareCreate,
		},
		createAll: {
			reducer: (state, { payload }: PayloadAction<CreateParameter<T>>) => adapter.setAll(
				state ?? adapter.getInitialState(),
				payload as T[]
			),
			prepare: prepareCreate,
		},
		addOne: (state, { payload }) => adapter.addOne(state ?? adapter.getInitialState(), payload),
		addMany: (state, { payload }) => adapter.addMany(state ?? adapter.getInitialState(), payload),
		setOne: (state, { payload }) => adapter.setOne(state ?? adapter.getInitialState(), payload),
		setMany: (state, { payload }) => adapter.setMany(state ?? adapter.getInitialState(), payload),
		setAll: (state, { payload }) => adapter.setAll(state ?? adapter.getInitialState(), payload),
		removeOne: (state, { payload }) => adapter.removeOne(state ?? adapter.getInitialState(), payload),
		removeMany: (state, { payload }) => adapter.removeMany(state ?? adapter.getInitialState(), payload),
		removeAll: (state) => adapter.removeAll(state ?? adapter.getInitialState()),
		updateOne: (state, { payload }) => adapter.updateOne(state ?? adapter.getInitialState(), payload),
		updateMany: (state, { payload }) => adapter.updateMany(state ?? adapter.getInitialState(), payload),
		upsertOne: (state, { payload }) => adapter.upsertOne(state, payload),
		upsertMany: (state, { payload }) => adapter.upsertMany(state ?? adapter.getInitialState(), payload),

		setAddedIds: (state, { payload }: PayloadAction<AddedIds>) =>
		{
			const updates = _.map(payload, ({ id }, oldId) => ({
				id: oldId,
				changes: { id }
			}))

			return adapter.updateMany(
				(state ?? adapter.getInitialState()) as EntityState<T, I>,
				updates as any
			)
		},
	}
}
export default getAdapterReducers