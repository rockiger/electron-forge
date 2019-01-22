/* eslint "no-console": "off" */
import colors from 'colors';
import ora from './ora';

export class OraImpl {
  // eslint-disable-next-line no-empty-function, no-useless-constructor
  constructor(public text: string = '') {}

  succeed(_symbol?: string) { return this; }

  fail(_symbol?: string) { return this; }

  start() { return this; }

  stop(_symbol?: string) { return this; }

  warn(_message: string) { return this; }
}

export interface AsyncOraMethod {
  (
    initialOraValue: string,
    asyncFn: (ora: OraImpl) => Promise<void>,
    processExitFn?: (code: number) => void,
  ): Promise<void>;
  interactive?: boolean;
}

const asyncOra: AsyncOraMethod = (initialOraValue, asyncFn, processExitFn = process.exit) => {
  let fnOra = new OraImpl(initialOraValue);
  if (asyncOra.interactive) {
    fnOra = ora(initialOraValue).start();
  }
  return new Promise((resolve, reject) => {
    asyncFn(fnOra).then(() => {
      fnOra.succeed();
      resolve();
    }).catch((err) => {
      fnOra.fail();
      if (asyncOra.interactive) {
        if (err && err.message && err.stack) {
          console.error('\nAn unhandled error has occurred inside Forge:'.red);
          console.error(colors.red(err.message));
          console.error(colors.red(err.stack));
        } else {
          console.error('\nElectron forge was terminated:'.red);
          console.error(colors.red(typeof err === 'string' ? err : JSON.stringify(err)));
        }
        processExitFn(1);
        // If the process is still alive we should continue because either
        // something went really wrong or we are testing this function
        setTimeout(() => resolve(), 500);
      } else {
        reject(err);
      }
    });
  });
};

asyncOra.interactive = true;

export default asyncOra;
