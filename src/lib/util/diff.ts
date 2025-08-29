import { assign } from 'lodash'
import
{
	diff as base,
	addedDiff,
	deletedDiff,
	detailedDiff,
	updatedDiff,
} from 'deep-object-diff'

type Diff = typeof base & {
	added: typeof addedDiff
	deleted: typeof deletedDiff
	detailed: typeof detailedDiff
	updated: typeof updatedDiff
}
export const diff: Diff = assign(function (...args: Parameters<typeof base>)
{
	return base(...args)
}, {
	added: addedDiff,
	deleted: deletedDiff,
	detailed: detailedDiff,
	updated: updatedDiff,
})
export default diff