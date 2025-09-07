import { CreateNewForumTopicData, CreateNewForumTopicVariables, ListAllCoursesData, MarkLessonAsCompletedData, MarkLessonAsCompletedVariables, GetMyForumPostsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewForumTopic(options?: useDataConnectMutationOptions<CreateNewForumTopicData, FirebaseError, CreateNewForumTopicVariables>): UseDataConnectMutationResult<CreateNewForumTopicData, CreateNewForumTopicVariables>;
export function useCreateNewForumTopic(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewForumTopicData, FirebaseError, CreateNewForumTopicVariables>): UseDataConnectMutationResult<CreateNewForumTopicData, CreateNewForumTopicVariables>;

export function useListAllCourses(options?: useDataConnectQueryOptions<ListAllCoursesData>): UseDataConnectQueryResult<ListAllCoursesData, undefined>;
export function useListAllCourses(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllCoursesData>): UseDataConnectQueryResult<ListAllCoursesData, undefined>;

export function useMarkLessonAsCompleted(options?: useDataConnectMutationOptions<MarkLessonAsCompletedData, FirebaseError, MarkLessonAsCompletedVariables>): UseDataConnectMutationResult<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;
export function useMarkLessonAsCompleted(dc: DataConnect, options?: useDataConnectMutationOptions<MarkLessonAsCompletedData, FirebaseError, MarkLessonAsCompletedVariables>): UseDataConnectMutationResult<MarkLessonAsCompletedData, MarkLessonAsCompletedVariables>;

export function useGetMyForumPosts(options?: useDataConnectQueryOptions<GetMyForumPostsData>): UseDataConnectQueryResult<GetMyForumPostsData, undefined>;
export function useGetMyForumPosts(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyForumPostsData>): UseDataConnectQueryResult<GetMyForumPostsData, undefined>;
