export interface TextValidateResult {
  valid: boolean;
  diffs: string[];
}

function deepCompare(
  user: unknown,
  solution: unknown,
  path: string
): string[] {
  const diffs: string[] = [];

  if (user === solution) return diffs;

  const userType = typeof user;
  const solutionType = typeof solution;

  if (userType !== solutionType) {
    diffs.push(`${path}: expected ${solutionType}, got ${userType}`);
    return diffs;
  }

  if (user === null || solution === null) {
    if (user !== solution) {
      diffs.push(`${path}: expected ${JSON.stringify(solution)}, got ${JSON.stringify(user)}`);
    }
    return diffs;
  }

  if (Array.isArray(user) && Array.isArray(solution)) {
    if (user.length !== solution.length) {
      diffs.push(
        `${path}: expected ${solution.length} items, got ${user.length}`
      );
    }
    const len = Math.min(user.length, solution.length);
    for (let i = 0; i < len; i++) {
      diffs.push(...deepCompare(user[i], solution[i], `${path}[${i}]`));
    }
    return diffs;
  }

  if (typeof user === "object" && typeof solution === "object") {
    const userObj = user as Record<string, unknown>;
    const solutionObj = solution as Record<string, unknown>;
    const userKeys = Object.keys(userObj);
    const solutionKeys = Object.keys(solutionObj);

    const missingKeys = solutionKeys.filter((k) => !(k in userObj));
    for (const k of missingKeys) {
      diffs.push(`${path}.${k}: missing`);
    }

    const extraKeys = userKeys.filter((k) => !(k in solutionObj));
    for (const k of extraKeys) {
      diffs.push(`${path}.${k}: unexpected extra field`);
    }

    for (const k of solutionKeys) {
      if (k in userObj) {
        diffs.push(...deepCompare(userObj[k], solutionObj[k], `${path}.${k}`));
      }
    }
    return diffs;
  }

  if (String(user) !== String(solution)) {
    diffs.push(
      `${path}: expected ${JSON.stringify(solution)}, got ${JSON.stringify(user)}`
    );
  }

  return diffs;
}

export function validateSection(
  userSection: unknown,
  solutionSection: unknown,
  sectionName: string
): TextValidateResult {
  const diffs: string[] = [];

  if (!userSection || typeof userSection !== "object") {
    return {
      valid: false,
      diffs: [`Missing or empty "${sectionName}" section in your config`],
    };
  }

  const userObj = userSection as Record<string, unknown>;
  const solutionObj = solutionSection as Record<string, unknown>;
  const userKeys = Object.keys(userObj);
  const solutionKeys = Object.keys(solutionObj);

  const missingKeys = solutionKeys.filter((k) => !(k in userObj));
  for (const k of missingKeys) {
    diffs.push(`${sectionName}.${k}: missing`);
  }

  const extraKeys = userKeys.filter((k) => !(k in solutionObj));
  for (const k of extraKeys) {
    diffs.push(`${sectionName}.${k}: unexpected extra field`);
  }

  for (const name of solutionKeys) {
    if (name in userObj) {
      diffs.push(
        ...deepCompare(userObj[name], solutionObj[name], `${sectionName}.${name}`)
      );
    }
  }

  return { valid: diffs.length === 0, diffs };
}

export function textValidate(
  userProcessors: Record<string, unknown>,
  solutionProcessors: Record<string, unknown>
): TextValidateResult {
  return validateSection(userProcessors, solutionProcessors, "processors");
}
