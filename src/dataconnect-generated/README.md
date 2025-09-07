# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllCourses*](#listallcourses)
  - [*GetMyForumPosts*](#getmyforumposts)
- [**Mutations**](#mutations)
  - [*CreateNewForumTopic*](#createnewforumtopic)
  - [*MarkLessonAsCompleted*](#marklessonascompleted)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllCourses
You can execute the `ListAllCourses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllCourses(): QueryPromise<ListAllCoursesData, undefined>;

interface ListAllCoursesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllCoursesData, undefined>;
}
export const listAllCoursesRef: ListAllCoursesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllCourses(dc: DataConnect): QueryPromise<ListAllCoursesData, undefined>;

interface ListAllCoursesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllCoursesData, undefined>;
}
export const listAllCoursesRef: ListAllCoursesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllCoursesRef:
```typescript
const name = listAllCoursesRef.operationName;
console.log(name);
```

### Variables
The `ListAllCourses` query has no variables.
### Return Type
Recall that executing the `ListAllCourses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllCoursesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllCoursesData {
  courses: ({
    id: UUIDString;
    title: string;
    description: string;
    difficultyLevel?: string | null;
    duration?: number | null;
  } & Course_Key)[];
}
```
### Using `ListAllCourses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllCourses } from '@dataconnect/generated';


// Call the `listAllCourses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllCourses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllCourses(dataConnect);

console.log(data.courses);

// Or, you can use the `Promise` API.
listAllCourses().then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

### Using `ListAllCourses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllCoursesRef } from '@dataconnect/generated';


// Call the `listAllCoursesRef()` function to get a reference to the query.
const ref = listAllCoursesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllCoursesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.courses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

## GetMyForumPosts
You can execute the `GetMyForumPosts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyForumPosts(): QueryPromise<GetMyForumPostsData, undefined>;

interface GetMyForumPostsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyForumPostsData, undefined>;
}
export const getMyForumPostsRef: GetMyForumPostsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyForumPosts(dc: DataConnect): QueryPromise<GetMyForumPostsData, undefined>;

interface GetMyForumPostsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyForumPostsData, undefined>;
}
export const getMyForumPostsRef: GetMyForumPostsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyForumPostsRef:
```typescript
const name = getMyForumPostsRef.operationName;
console.log(name);
```

### Variables
The `GetMyForumPosts` query has no variables.
### Return Type
Recall that executing the `GetMyForumPosts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyForumPostsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyForumPostsData {
  forumPosts: ({
    id: UUIDString;
    content: string;
    createdAt: TimestampString;
    topic: {
      id: UUIDString;
      title: string;
    } & ForumTopic_Key;
  } & ForumPost_Key)[];
}
```
### Using `GetMyForumPosts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyForumPosts } from '@dataconnect/generated';


// Call the `getMyForumPosts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyForumPosts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyForumPosts(dataConnect);

console.log(data.forumPosts);

// Or, you can use the `Promise` API.
getMyForumPosts().then((response) => {
  const data = response.data;
  console.log(data.forumPosts);
});
```

### Using `GetMyForumPosts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyForumPostsRef } from '@dataconnect/generated';


// Call the `getMyForumPostsRef()` function to get a reference to the query.
const ref = getMyForumPostsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyForumPostsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.forumPosts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.forumPosts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewForumTopic
You can execute the `CreateNewForumTopic` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewForumTopic(vars: CreateNewForumTopicVariables): MutationPromise<CreateNewForumTopicData, CreateNewForumTopicVariables>;

interface CreateNewForumTopicRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewForumTopicVariables): MutationRef<CreateNewForumTopicData, CreateNewForumTopicVariables>;
}
export const createNewForumTopicRef: CreateNewForumTopicRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewForumTopic(dc: DataConnect, vars: CreateNewForumTopicVariables): MutationPromise<CreateNewForumTopicData, CreateNewForumTopicVariables>;

interface CreateNewForumTopicRef {
  ...
  (dc: DataConnect, vars: CreateNewForumTopicVariables): MutationRef<CreateNewForumTopicData, CreateNewForumTopicVariables>;
}
export const createNewForumTopicRef: CreateNewForumTopicRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewForumTopicRef:
```typescript
const name = createNewForumTopicRef.operationName;
console.log(name);
```

### Variables
The `CreateNewForumTopic` mutation requires an argument of type `CreateNewForumTopicVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewForumTopicVariables {
  title: string;
  content: string;
}
```
### Return Type
Recall that executing the `CreateNewForumTopic` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewForumTopicData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewForumTopicData {
  forumTopic: ForumTopic_Key;
}
```
### Using `CreateNewForumTopic`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewForumTopic, CreateNewForumTopicVariables } from '@dataconnect/generated';

// The `CreateNewForumTopic` mutation requires an argument of type `CreateNewForumTopicVariables`:
const createNewForumTopicVars: CreateNewForumTopicVariables = {
  title: ..., 
  content: ..., 
};

// Call the `createNewForumTopic()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewForumTopic(createNewForumTopicVars);
// Variables can be defined inline as well.
const { data } = await createNewForumTopic({ title: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewForumTopic(dataConnect, createNewForumTopicVars);

console.log(data.forumTopic);

// Or, you can use the `Promise` API.
createNewForumTopic(createNewForumTopicVars).then((response) => {
  const data = response.data;
  console.log(data.forumTopic);
});
```

### Using `CreateNewForumTopic`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewForumTopicRef, CreateNewForumTopicVariables } from '@dataconnect/generated';

// The `CreateNewForumTopic` mutation requires an argument of type `CreateNewForumTopicVariables`:
const createNewForumTopicVars: CreateNewForumTopicVariables = {
  title: ..., 
  content: ..., 
};

// Call the `createNewForumTopicRef()` function to get a reference to the mutation.
const ref = createNewForumTopicRef(createNewForumTopicVars);
// Variables can be defined inline as well.
const ref = createNewForumTopicRef({ title: ..., content: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewForumTopicRef(dataConnect, createNewForumTopicVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.forumTopic);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.forumTopic);
});
```

## MarkLessonAsCompleted
You can execute the `MarkLessonAsCompleted` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
markLessonAsCompleted(vars: MarkLessonAsCompletedVariables): MutationPromise<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;

interface MarkLessonAsCompletedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkLessonAsCompletedVariables): MutationRef<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
}
export const markLessonAsCompletedRef: MarkLessonAsCompletedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
markLessonAsCompleted(dc: DataConnect, vars: MarkLessonAsCompletedVariables): MutationPromise<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;

interface MarkLessonAsCompletedRef {
  ...
  (dc: DataConnect, vars: MarkLessonAsCompletedVariables): MutationRef<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
}
export const markLessonAsCompletedRef: MarkLessonAsCompletedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the markLessonAsCompletedRef:
```typescript
const name = markLessonAsCompletedRef.operationName;
console.log(name);
```

### Variables
The `MarkLessonAsCompleted` mutation requires an argument of type `MarkLessonAsCompletedVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface MarkLessonAsCompletedVariables {
  lessonId: UUIDString;
}
```
### Return Type
Recall that executing the `MarkLessonAsCompleted` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MarkLessonAsCompletedData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MarkLessonAsCompletedData {
  userProgress_upsert: UserProgress_Key;
}
```
### Using `MarkLessonAsCompleted`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, markLessonAsCompleted, MarkLessonAsCompletedVariables } from '@dataconnect/generated';

// The `MarkLessonAsCompleted` mutation requires an argument of type `MarkLessonAsCompletedVariables`:
const markLessonAsCompletedVars: MarkLessonAsCompletedVariables = {
  lessonId: ..., 
};

// Call the `markLessonAsCompleted()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await markLessonAsCompleted(markLessonAsCompletedVars);
// Variables can be defined inline as well.
const { data } = await markLessonAsCompleted({ lessonId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await markLessonAsCompleted(dataConnect, markLessonAsCompletedVars);

console.log(data.userProgress_upsert);

// Or, you can use the `Promise` API.
markLessonAsCompleted(markLessonAsCompletedVars).then((response) => {
  const data = response.data;
  console.log(data.userProgress_upsert);
});
```

### Using `MarkLessonAsCompleted`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, markLessonAsCompletedRef, MarkLessonAsCompletedVariables } from '@dataconnect/generated';

// The `MarkLessonAsCompleted` mutation requires an argument of type `MarkLessonAsCompletedVariables`:
const markLessonAsCompletedVars: MarkLessonAsCompletedVariables = {
  lessonId: ..., 
};

// Call the `markLessonAsCompletedRef()` function to get a reference to the mutation.
const ref = markLessonAsCompletedRef(markLessonAsCompletedVars);
// Variables can be defined inline as well.
const ref = markLessonAsCompletedRef({ lessonId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = markLessonAsCompletedRef(dataConnect, markLessonAsCompletedVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProgress_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgress_upsert);
});
```

