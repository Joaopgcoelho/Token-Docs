/**
 * Validates a TreeDefinition for structural integrity.
 *
 * Checks:
 * 1. Tree has required `nodes` object and `rootId` string
 * 2. All node IDs in the map match their keys (uniqueness)
 * 3. All edges from decision nodes reference existing node IDs
 * 4. Exactly one root node exists (no incoming edges), matching rootId
 * 5. All paths from root terminate at a result or error node (DFS with cycle detection)
 * 6. Decision nodes have both `yes` and `no` edges
 *
 * @param {import('./types').TreeDefinition} tree
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTree(tree) {
  const errors = [];

  // --- Basic structure checks ---
  if (!tree || typeof tree !== 'object') {
    return { valid: false, errors: ['Tree must be a non-null object'] };
  }

  if (typeof tree.rootId !== 'string' || tree.rootId === '') {
    errors.push('Tree must have a non-empty string "rootId"');
  }

  if (!tree.nodes || typeof tree.nodes !== 'object' || Array.isArray(tree.nodes)) {
    errors.push('Tree must have a "nodes" object');
    return { valid: false, errors };
  }

  const nodeIds = Object.keys(tree.nodes);

  if (nodeIds.length === 0) {
    errors.push('Tree must contain at least one node');
    return { valid: false, errors };
  }

  // --- Check node.id matches its key in the map (Req 8.2 - uniqueness) ---
  for (const key of nodeIds) {
    const node = tree.nodes[key];
    if (!node || typeof node !== 'object') {
      errors.push(`Node "${key}" is not a valid object`);
      continue;
    }
    if (node.id !== key) {
      errors.push(`Node key "${key}" does not match node.id "${node.id}"`);
    }
  }

  // --- Check decision nodes have both yes and no edges, and edges reference existing nodes (Req 8.1) ---
  for (const key of nodeIds) {
    const node = tree.nodes[key];
    if (!node || typeof node !== 'object') continue;

    if (node.type === 'decision') {
      if (!node.yes) {
        errors.push(`Decision node "${key}" is missing a "yes" edge`);
      } else if (!tree.nodes[node.yes]) {
        errors.push(`Decision node "${key}" has "yes" edge referencing non-existent node "${node.yes}"`);
      }

      if (!node.no) {
        errors.push(`Decision node "${key}" is missing a "no" edge`);
      } else if (!tree.nodes[node.no]) {
        errors.push(`Decision node "${key}" has "no" edge referencing non-existent node "${node.no}"`);
      }
    }
  }

  // --- Check rootId references an existing node ---
  if (typeof tree.rootId === 'string' && tree.rootId !== '' && !tree.nodes[tree.rootId]) {
    errors.push(`rootId "${tree.rootId}" does not reference an existing node`);
  }

  // --- Check exactly one root node (no incoming edges) matches rootId (Req 8.4) ---
  const nodesWithIncomingEdges = new Set();
  for (const key of nodeIds) {
    const node = tree.nodes[key];
    if (!node || typeof node !== 'object') continue;

    if (node.type === 'decision') {
      if (node.yes && tree.nodes[node.yes]) {
        nodesWithIncomingEdges.add(node.yes);
      }
      if (node.no && tree.nodes[node.no]) {
        nodesWithIncomingEdges.add(node.no);
      }
    }
  }

  const rootCandidates = nodeIds.filter((id) => !nodesWithIncomingEdges.has(id));

  if (rootCandidates.length === 0) {
    errors.push('No root node found (all nodes have incoming edges — possible cycle)');
  } else if (rootCandidates.length > 1) {
    errors.push(
      `Multiple root nodes found (nodes with no incoming edges): ${rootCandidates.join(', ')}`
    );
  } else if (rootCandidates.length === 1 && rootCandidates[0] !== tree.rootId) {
    errors.push(
      `The only node with no incoming edges is "${rootCandidates[0]}", but rootId is "${tree.rootId}"`
    );
  }

  // --- DFS: all paths from root must terminate at result or error nodes (Req 8.3) ---
  if (tree.nodes[tree.rootId]) {
    const visited = new Set();
    const inStack = new Set();
    const dfsErrors = [];

    function dfs(nodeId) {
      if (inStack.has(nodeId)) {
        dfsErrors.push(`Cycle detected involving node "${nodeId}"`);
        return;
      }
      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      inStack.add(nodeId);

      const node = tree.nodes[nodeId];
      if (!node) {
        dfsErrors.push(`DFS reached non-existent node "${nodeId}"`);
        inStack.delete(nodeId);
        return;
      }

      if (node.type === 'result' || node.type === 'error') {
        // Terminal node — path is valid
        inStack.delete(nodeId);
        return;
      }

      if (node.type === 'decision') {
        if (node.yes && tree.nodes[node.yes]) {
          dfs(node.yes);
        }
        if (node.no && tree.nodes[node.no]) {
          dfs(node.no);
        }
        inStack.delete(nodeId);
        return;
      }

      // Unknown node type — treat as dangling
      dfsErrors.push(`Node "${nodeId}" has unknown type "${node.type}" and is not a terminal node`);
      inStack.delete(nodeId);
    }

    dfs(tree.rootId);

    // Check for unreachable nodes
    const unreachable = nodeIds.filter((id) => !visited.has(id));
    if (unreachable.length > 0) {
      dfsErrors.push(`Unreachable nodes from root: ${unreachable.join(', ')}`);
    }

    errors.push(...dfsErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
