import _ from 'lodash';

import { maybify } from '../src/functions/maybify';
import { Maybe } from '../src/functions/types';

describe('maybify', () => {
    it('Should handle an already-maybed function correctly.', (): any => {
        const fn = async (input: number): Promise<Maybe<number>> => {
            return {
                success: true,
                data: input + 1
            }
        }

        const result = maybify(fn)(5);

        expect(result).resolves.toEqual({ success: true, data: 6, error: undefined });
    })

    it('Should handle a function that returns a value correctly.', (): any => {
        const fn = async (input: number) => {
            return input + 1;
        };

        const result = maybify(fn)(5);

        expect(result).resolves.toEqual({ success: true, data: 6, error: undefined });
    })
})