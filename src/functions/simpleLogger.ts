

/**
 * A simple logger interface.
 */
export interface SimpleLogger {
    /** Log at loglevel LOG */
    log: (...args: any[]) => any;
    /** Log at loglevel WARN */
    warn: (...args: any[]) => any;
    /** Log at loglevel ERROR */
    error: (...args: any[]) => any;
    /** Log at loglevel INFO */
    info: (...args: any[]) => any;
    /** Log at loglevel DEBUG */
    debug: (...args: any[]) => any;
}

export interface CreateSimpleLoggerArgs {
    /**
     * Prefix to add to all log statements.
     * 
     * Can be a rawString, a simpleString, or a function that returns a string.
     * 
     * ### type: `rawString`
     * will yield output messages corresponding to:
     * ```ts
     * logger.log(rawString, ...args)
     * ```
     * 
     * ### type: `simpleString`
     * will improve formatting of output messages.
     * 
     * Example output would correspond to:
     * ```ts
     * logger.log(`[${simpleString}]: `, ...args)
     * ```
     * 
     * ### type: `function`
     * will call the function with the following parameters:
     * ```ts
     * const prefix = func({logType, logArgs})
     * 
     * logger.log(prefix, ...args)
     * ```
     */
    prefix?: {
        type: 'rawString',
        rawString: string
    } | {
        type: 'simpleString', 
        simpleString: string,
        logTypePrefix?: 'short' | 'long',
    } |
    {
        type: 'function',
        func: ((params: {logType: 'log' | 'warn' | 'error' | 'info' | 'debug', logArgs: any[]}) => string | string[])
    }

    /**
     * Functions to use for logging.
     * 
     * If not provided, will default to `console.log`, `console.warn`, `console.error`, `console.info`, and `console.debug`.
     */
    logFunctions?: {
        log?: (...args: any[]) => any;
        warn?: (...args: any[]) => any;
        error?: (...args: any[]) => any;
        info?: (...args: any[]) => any;
        debug?: (...args: any[]) => any;
    }
}

export function createSimpleLogger(args: CreateSimpleLoggerArgs): SimpleLogger {
    const logTypePrefixes = {
        NONE: {
            log: undefined,
            warn: undefined,
            error: undefined,
            info: undefined,
            debug: undefined,
        },
        short: {
            log: 'L',
            warn: 'W',
            error: 'E',
            info: 'I',
            debug: 'D',
        },
        long: {
            log: 'LOG',
            warn: 'WARN',
            error: 'ERROR',
            info: 'INFO',
            debug: 'DEBUG',
        }
    }

    const getPrefix = (logArgs: any[], logType: 'log' | 'warn' | 'error' | 'info' | 'debug'): string | string[] | undefined => {
        if (args.prefix){
            if (args.prefix.type === 'rawString'){
                return args.prefix.rawString;
            }
            else if (args.prefix.type === 'simpleString') {
                const logTypePrefixTable = logTypePrefixes[args.prefix.logTypePrefix || 'NONE'];

                const usingLogTypePrefix = logTypePrefixTable[logType]

                return usingLogTypePrefix ? `[${usingLogTypePrefix}|${args.prefix.simpleString}]: ` : `[${args.prefix.simpleString}]: `;
            }
            else if (args.prefix.type === 'function') {
                return args.prefix.func({logType, logArgs});
            }
            else {
                //@ts-ignore
                throw new Error(`Invalid prefix type: ${args.prefix.type}`);
            }
        }

        return undefined;
    }


    function basicLogWrapper(logFunc: (...args: any[]) => any, logType: 'log' | 'warn' | 'error' | 'info' | 'debug'){
        return (...args: any[]) => {
            const pref = getPrefix(args, logType);
            if (pref){
                if (Array.isArray(pref)){
                    logFunc(...pref, ...args);
                }
                else{
                    logFunc(pref, ...args);
                }
            }
            else {
                logFunc(...args)
            }
        }
    }

    return {
        log: basicLogWrapper(args.logFunctions?.log || console.log, 'log'),
        warn: basicLogWrapper(args.logFunctions?.warn || console.warn, 'warn'),
        error: basicLogWrapper(args.logFunctions?.error || console.error, 'error'),
        info: basicLogWrapper(args.logFunctions?.info || console.info, 'info'),
        debug: basicLogWrapper(args.logFunctions?.debug || console.debug, 'debug'),
    }
}