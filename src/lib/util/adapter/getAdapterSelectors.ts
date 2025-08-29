import type {
	EntityAdapter,
	EntityId,
	EntityState,
	PayloadAction,
} from '@reduxjs/toolkit'
import _, { type PropertyPath } from 'lodash'

export function getAdapterSelectors<T, I extends EntityId = EntityId>(
	adapter: EntityAdapter<T, I>,
	path: PropertyPath
)
{
	const rootSelector = _.property<any, EntityState<T, I>>(path)
	return {
		rootSelector,
		...adapter.getSelectors(rootSelector)
	}
}