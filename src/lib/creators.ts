import _, { type PropertyPath } from 'lodash'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppDispatch, AppState } from './store'
import type {
	OutputSelector,
	Selector,
	SelectorArray,
	UnknownMemoizer,
	weakMapMemoize,
} from 'reselect'
import { createSelector } from 'reselect'

// https://redux-toolkit.js.org/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: AppState
	dispatch: AppDispatch
}>()

// https://reselect.js.org/FAQ#how-can-i-make-a-pre-typed-version-of-createselector-for-my-root-state
export type TypedCreateSelector<
	State,
	MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
	ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize
> = <
	InputSelectors extends readonly Selector<State>[],
	Result,
	OverrideMemoizeFunction extends UnknownMemoizer = MemoizeFunction,
	OverrideArgsMemoizeFunction extends UnknownMemoizer = ArgsMemoizeFunction
>(
	...createSelectorArgs: Parameters<
		typeof createSelector<
			InputSelectors,
			Result,
			OverrideMemoizeFunction,
			OverrideArgsMemoizeFunction
		>
	>
) => ReturnType<
	typeof createSelector<
		InputSelectors,
		Result,
		OverrideMemoizeFunction,
		OverrideArgsMemoizeFunction
	>
>

export const createAppSelector: TypedCreateSelector<AppState> = createSelector

const flattenPath = (path) => _.castArray(path).flat(Infinity)
export const createPathSelector = (
	start: PropertyPath
) =>
{
	const $start = _.castArray(start).flat(Infinity)

	return <TResult>(
		path: PropertyPath
	) =>
	{
		const $path = [...$start, flattenPath(path)]
		return _.property<any, TResult>($path as string[])
	}
}