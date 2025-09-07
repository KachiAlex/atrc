const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'traditional-rulers-app-firebase',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewForumTopicRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewForumTopic', inputVars);
}
createNewForumTopicRef.operationName = 'CreateNewForumTopic';
exports.createNewForumTopicRef = createNewForumTopicRef;

exports.createNewForumTopic = function createNewForumTopic(dcOrVars, vars) {
  return executeMutation(createNewForumTopicRef(dcOrVars, vars));
};

const listAllCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllCourses');
}
listAllCoursesRef.operationName = 'ListAllCourses';
exports.listAllCoursesRef = listAllCoursesRef;

exports.listAllCourses = function listAllCourses(dc) {
  return executeQuery(listAllCoursesRef(dc));
};

const markLessonAsCompletedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkLessonAsCompleted', inputVars);
}
markLessonAsCompletedRef.operationName = 'MarkLessonAsCompleted';
exports.markLessonAsCompletedRef = markLessonAsCompletedRef;

exports.markLessonAsCompleted = function markLessonAsCompleted(dcOrVars, vars) {
  return executeMutation(markLessonAsCompletedRef(dcOrVars, vars));
};

const getMyForumPostsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyForumPosts');
}
getMyForumPostsRef.operationName = 'GetMyForumPosts';
exports.getMyForumPostsRef = getMyForumPostsRef;

exports.getMyForumPosts = function getMyForumPosts(dc) {
  return executeQuery(getMyForumPostsRef(dc));
};
