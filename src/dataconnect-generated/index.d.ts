import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Book_Key {
  id: UUIDString;
  __typename?: 'Book_Key';
}

export interface Course_Key {
  id: UUIDString;
  __typename?: 'Course_Key';
}

export interface CreateNewForumTopicData {
  forumTopic: ForumTopic_Key;
}

export interface CreateNewForumTopicVariables {
  title: string;
  content: string;
}

export interface ForumPost_Key {
  id: UUIDString;
  __typename?: 'ForumPost_Key';
}

export interface ForumTopic_Key {
  id: UUIDString;
  __typename?: 'ForumTopic_Key';
}

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

export interface Lesson_Key {
  id: UUIDString;
  __typename?: 'Lesson_Key';
}

export interface ListAllCoursesData {
  courses: ({
    id: UUIDString;
    title: string;
    description: string;
    difficultyLevel?: string | null;
    duration?: number | null;
  } & Course_Key)[];
}

export interface MarkLessonAsCompletedData {
  userProgress_upsert: UserProgress_Key;
}

export interface MarkLessonAsCompletedVariables {
  lessonId: UUIDString;
}

export interface UserProgress_Key {
  userId: UUIDString;
  lessonId: UUIDString;
  __typename?: 'UserProgress_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewForumTopicRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewForumTopicVariables): MutationRef<CreateNewForumTopicData, CreateNewForumTopicVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewForumTopicVariables): MutationRef<CreateNewForumTopicData, CreateNewForumTopicVariables>;
  operationName: string;
}
export const createNewForumTopicRef: CreateNewForumTopicRef;

export function createNewForumTopic(vars: CreateNewForumTopicVariables): MutationPromise<CreateNewForumTopicData, CreateNewForumTopicVariables>;
export function createNewForumTopic(dc: DataConnect, vars: CreateNewForumTopicVariables): MutationPromise<CreateNewForumTopicData, CreateNewForumTopicVariables>;

interface ListAllCoursesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllCoursesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllCoursesData, undefined>;
  operationName: string;
}
export const listAllCoursesRef: ListAllCoursesRef;

export function listAllCourses(): QueryPromise<ListAllCoursesData, undefined>;
export function listAllCourses(dc: DataConnect): QueryPromise<ListAllCoursesData, undefined>;

interface MarkLessonAsCompletedRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkLessonAsCompletedVariables): MutationRef<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MarkLessonAsCompletedVariables): MutationRef<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
  operationName: string;
}
export const markLessonAsCompletedRef: MarkLessonAsCompletedRef;

export function markLessonAsCompleted(vars: MarkLessonAsCompletedVariables): MutationPromise<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
export function markLessonAsCompleted(dc: DataConnect, vars: MarkLessonAsCompletedVariables): MutationPromise<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;

interface GetMyForumPostsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyForumPostsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyForumPostsData, undefined>;
  operationName: string;
}
export const getMyForumPostsRef: GetMyForumPostsRef;

export function getMyForumPosts(): QueryPromise<GetMyForumPostsData, undefined>;
export function getMyForumPosts(dc: DataConnect): QueryPromise<GetMyForumPostsData, undefined>;

