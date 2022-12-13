/* eslint-disable promise/always-return */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/import-style */
import * as fse from 'fs-extra';
import * as path from 'path';
import { CPSConfig } from './cps-config';

describe('cps-config', () => {
    describe('test', () => {
        it('shall get full config object', async() => {
            const cpsPath = path.join(
                __filename,
                "data",
                "cps.yml"
                );
            const cpsObj = CPSConfig.createFromYMLFile(cpsPath);

            
        });
    });
});