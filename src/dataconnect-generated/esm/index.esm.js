import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'traditional-rulers-app-firebase',
  location: 'us-central1'
};

export const createNewForumTopicRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewForumTopic', inputVars);
}
createNewForumTopicRef.operationName = 'CreateNewForumTopic';

export function createNewForumTopic(dcOrVars, vars) {
  return executeMutation(createNewForumTopicRef(dcOrVars, vars));
}

export const listAllCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCourses');
}
listAllCoursesRef.operationName = 'ListAllCourses';

export function listAllCourses(dc) {
  return executeQuery(listAllCoursesRef(dc));
}

export const markLessonAsCompletedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkLessonAsCompleted', inputVars);
}
markLessonAsCompletedRef.operationName = 'MarkLessonAsCompleted';

export function markLessonAsCompleted(dcOrVars, vars) {
  return executeMutation(markLessonAsCompletedRef(dcOrVars, vars));
}

export const getMyForumPostsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyForumPosts');
}
getMyForumPostsRef.operationName = 'GetMyForumPosts';

export function getMyForumPosts(dc) {
  return executeQuery(getMyForumPostsRef(dc));
}

