import _ from 'lodash';

/**
 * A version of sampleSize which will do its best to maintain randomness while also making sure the sampleSize number gets reached.
 * NOTE: This method WILL return duplicates if arr.length < numToSample.
 * @param arr An array to sample from.
 * @param numToSample The number of items to sample.
 * @returns An array of sampled items, which will *always* be of length numToSample, unless arr is empty.
 */
export function sampleSizeGuaranteed(arr: any[], numToSample: number){
    if (arr.length === 0){
      return undefined;
    }
    else if (arr.length >= numToSample){
      return _.sampleSize(arr, numToSample);
    }
    else {
      // If we have more than numToSample, we need to sample len(ARR) / numToSample times.
      const timesToSample = Math.ceil(numToSample / arr.length);
      const sampledArrs = _.range(timesToSample).map(() => _.sampleSize(arr, numToSample));
  
      // Now we flatten and return the exact number of samples we need.
      return _.flatten(sampledArrs).slice(0, numToSample);
    }
}