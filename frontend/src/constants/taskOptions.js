export const TASK_STATUSES = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Completed', 'Blocked'];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const TASK_MODULES = ['Support', 'Validation', 'Development', 'Implementation', 'Integration', 'Training', 'Migration'];

export const TASK_LOCATIONS = ['Onsite', 'Offshore'];

export const TASK_WEIGHT_OPTIONS = [1, 2, 3, 5, 8, 13];

export const TASK_WEIGHT_GUIDE = {
  1: { label: '1 Point (Tiny)', duration: '~1-2 Hours', example: 'Fix typo, simple config change, UI alignment' },
  2: { label: '2 Points (Small)', duration: '~1 Day', example: 'Validation logic, Excel mapping, minor bug fix' },
  3: { label: '3 Points (Medium)', duration: '~2-3 Days', example: 'Build dashboard layout, new form/modal, component' },
  5: { label: '5 Points (Large)', duration: '~4-5 Days', example: 'Batch application script, complex API endpoint, pipeline' },
  8: { label: '8 Points (Very Large)', duration: '~1-2 Weeks', example: 'Complete Data Lake integration, OAuth SSO module' },
  13: { label: '13 Points (Epic)', duration: '~2+ Weeks', example: 'Architecture rewrite, multi-tenant deployment (needs splitting)' }
};
