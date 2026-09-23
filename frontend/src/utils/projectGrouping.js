/**
 * Groups a list of projects into parent projects and sub-projects for select dropdowns (<optgroup>)
 */
export const groupProjectsByParent = (projects = []) => {
  if (!Array.isArray(projects)) return { topLevel: [], groups: [] };

  const projectMap = new Map();
  projects.forEach((p) => {
    if (p && (p.project_id || p.id)) {
      const id = String(p.project_id || p.id);
      projectMap.set(id, p);
    }
  });

  // Group sub-projects by parent ID or parent name
  const parentGroupMap = new Map();
  const topLevel = [];

  projects.forEach((p) => {
    if (!p) return;
    const parentId = p.parent_project_id ? String(p.parent_project_id) : null;
    const parentObj = parentId ? projectMap.get(parentId) : null;
    const parentName = parentObj ? parentObj.project_name : p.parent_project_name || null;

    if (parentId && parentName) {
      if (!parentGroupMap.has(parentName)) {
        parentGroupMap.set(parentName, []);
      }
      parentGroupMap.get(parentName).push(p);
    } else {
      topLevel.push(p);
    }
  });

  const groups = [];
  parentGroupMap.forEach((subProjects, parentName) => {
    groups.push({
      parentName,
      subProjects: subProjects.sort((a, b) => (a.project_name || '').localeCompare(b.project_name || ''))
    });
  });

  groups.sort((a, b) => a.parentName.localeCompare(b.parentName));

  return {
    topLevel: topLevel.sort((a, b) => (a.project_name || '').localeCompare(b.project_name || '')),
    groups
  };
};
