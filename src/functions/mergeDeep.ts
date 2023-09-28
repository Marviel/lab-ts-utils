import _ from 'lodash';

interface MergeDeepOptions {
    /**
     * The objects to be merged.
     */
    toMerge: any[];
    /**
     * If true, will throw an error if two properties have
     * the same position in the object tree, but are not both arrays.
     */
    failOnMismatchedArrays?: boolean;
}

/**
 * Uses lodash `mergeWith` to produce a deeply merged object from provided objects.
 *
 */
export function mergeDeep({
    toMerge,
    failOnMismatchedArrays = false,
}: MergeDeepOptions): any {
    //@ts-ignore
    return _.mergeWith(
        {},
        ...toMerge,
        (objValue: any, srcValue: any, key: string): any[] | undefined => {
            if (_.isArray(objValue) && _.isArray(srcValue)) {
                //@ts-ignore
                return objValue.concat(srcValue);
            } else if (
                failOnMismatchedArrays &&
                (_.isArray(objValue) || _.isArray(srcValue))
            ) {
                throw new Error(`Mismatched arrays at key: ${key}`);
            }
        }
    );
}
