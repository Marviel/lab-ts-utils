
---

# LAB TS Utils 

A Collection of helpful tools for Typescript projects.

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]


## Install

NPM:
```bash
npm install @lukebechtel/lab-ts-utils
```
YARN:

```bash
yarn add @lukebechtel/lab-ts-utils
```


# Functions

## `fixIndent`
This function detects the minimum indentation level of each line and removes it. It reads over all lines, identifies the minimum indentation level, and strips all indentation before this level.

### Usage
#### Simplifying Indentation
```typescript
import { fixIndent } from '@lukebechtel/lab-ts-utils';

const str = `
    Hello,
        World!
    Have a good day.`;

console.log(fixIndent(str));

// Expected output:
// Hello,
//     World!
// Have a good day.
```

---

## `jwtBearerify`
Prepends "Bearer" to a JWT token if it doesn't already start with "Bearer".

### Usage
#### Adding Bearer Prefix
```typescript
import { jwtBearerify } from '@lukebechtel/lab-ts-utils';

const token = 'abc.xyz.123';
console.log(jwtBearerify(token));

// Expected output:
// Bearer abc.xyz.123
```

---

## `mergeDeep`
Uses lodash `mergeWith` to produce a deeply merged object from provided objects.

### Usage
#### Deep Merging
```typescript
import { mergeDeep } from '@lukebechtel/lab-ts-utils';

const obj1 = { a: [1], b: 2 };
const obj2 = { a: [3], c: 4 };

console.log(mergeDeep({toMerge: [obj1, obj2]}));

// Expected output:
// { a: [1, 3], b: 2, c: 4 }
```

---

## `notEmpty`
This function checks if an item has some value. It narrows down the type from TValue | null | undefined to TValue, allowing TypeScript to know that the value is not null or undefined.

### Usage
#### Checking Non-Empty Values
```typescript
import { notEmpty } from '@lukebechtel/lab-ts-utils';

const value1 = undefined;
const value2 = 'Hello, World!';
console.log(notEmpty(value1)); // Expected output: false
console.log(notEmpty(value2)); // Expected output: true
```

---

## `prefixAllLines`
This function adds a given prefix to the start of each line in a given string.

### Usage
#### Adding Prefix to Each Line
```typescript
import { prefixAllLines } from '@lukebechtel/lab-ts-utils';

const str = `Hello,
World!
Have a good day.`;
const prefix = '>> ';

console.log(prefixAllLines(prefix, str));

// Expected output:
// >> Hello,
// >> World!
// >> Have a good day.
```

---

You can replace `'@lukebechtel/lab-ts-utils'` with the actual name of your library. Also, replace the dummy variables and strings with actual examples that you wish to use.


## `createSimpleLogger`
This function creates a simple logger with customizable prefixing and logging functions. You may use `rawString`, `simpleString`, or a `function` as a prefix to your log statements. Logging functions are also customizable and will default to appropriate console functions if no alternatives are provided.

### Usage
#### Basic Logger
```typescript
let logger = createSimpleLogger({}); // creates a logger with no prefix and default console logging

logger.log("log this");  // console output: "log this"
```

#### Logger with Raw String Prefix
```typescript
let logger = createSimpleLogger({
    prefix: {
        type: 'rawString',
        rawString: 'raw'
    }
}); 

logger.log("log this");  // console output: "raw log this"
```

#### Logger with Simple String Prefix
```typescript
let logger = createSimpleLogger({
    prefix: {
        type: 'simpleString',
        simpleString: 'simple'
    }
}); 

logger.log("log this");  // console output: "[simple]: log this"
```

#### Logger with Function Prefix
```typescript
let logger = createSimpleLogger({
    prefix: {
        type: 'function',
        func: ({logType, logArgs}) => `[${logType.toUpperCase()}|${logArgs.length} arguments]: `
    }
}); 

logger.log("log this", "and this");  // console output: "[LOG|2 arguments]: log this and this"
```

## `trimAllLines`
This function receives a multi-line string and trims the whitespace at the start and end of each line.

### Usage
#### Trimming All Lines
```typescript
let str = "     Line 1     \n     Line 2     ";
let trimmedStr = trimAllLines(str);

console.log(trimmedStr);  // console output: "Line 1\nLine 2"
```

## `trimLines`
This function adjusts the indentation of a block string and optionally removes leading and trailing blank line blocks.

### Usage
#### Adjusting Indentation and Removing Trailing Blank Lines
```typescript
let str = "     Line 1\n     Line 2\n  \n";
let trimmedStr = trimLines(str, { trimVerticalEnd: true });

console.log(trimmedStr);  // console output: "Line 1\nLine 2"
```

## `tryUntilAsync`
This function repeatedly executes a promise-returning function until it resolves or reaches a stopping condition.

### Usage
#### Resolving Once the Promise is Successful
```typescript
let attempts = 0;
let maxAttempts = 3;

let result = await tryUntilAsync({
    func: async () => {
        attempts++;
        if (attempts === maxAttempts) {
            return "Success"
        }
        else {
            throw new Error("Fail");
        }
    },
    tryLimits: {
        maxAttempts
    }
});

console.log(result);  // console output: "Success"
```

#### Resolving Based on a Specific Stop Condition
```typescript
let attempts = 0;
let maxAttempts = 3;

let result = await tryUntilAsync({
    func: async () => {
        attempts++;
        return attempts;
    },
    stopCondition: (result: number) => result === maxAttempts,
    tryLimits: {
        maxAttempts
    }
});

console.log(result); // console output: 3
```

#### Using a Customized Delay Function
```typescript
let start = Date.now();
let delayInSec = 2;

let result = await tryUntilAsync({
    func: async () => "Success",
    delay: {
        delayFunction: () => {
            return new Promise(resolve => setTimeout(resolve, delayInSec * 1000));
        }
    }
});

let end = Date.now();

console.log(result); // console output: "Success"
console.log(`Time elapsed: ${(end-start)/1000} seconds`); // console output: "Time elapsed: 2 seconds"
```

Please note that it's possible to encounter a `TryUntilTimeoutError` if the maximum number of attempts is reached or if the maximum time is exceeded without a successful result.



[build-img]:https://github.com/Marviel/lab-ts-lib/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/Marviel/lab-ts-lib/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/@lukebechtel/lab-ts-utils
[downloads-url]:https://www.npmtrends.com/@lukebechtel/lab-ts-utils
[npm-img]:https://img.shields.io/npm/v/@lukebechtel/lab-ts-utils
[npm-url]:https://www.npmjs.com/package/@lukebechtel/lab-ts-utils
[issues-img]:https://img.shields.io/github/issues/Marviel/lab-ts-utils
[issues-url]:https://github.com/Marviel/lab-ts-utils/issues
[codecov-img]:https://codecov.io/gh/Marviel/lab-ts-utils/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/Marviel/lab-ts-utils