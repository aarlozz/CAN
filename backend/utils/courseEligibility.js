import Courses from "../models/Courses.js";

/**
 * Throws if the institution hasn't registered a matching Course for the
 * scholarship's eligibility criteria. Call this from createScholarship and
 * updateScholarship, right after you build eligibilityCriteria and before
 * you save.
 *
 * If targetLevel is empty, the scholarship isn't restricted to a level, so
 * there's nothing to check against.
 */
export async function assertOfferedByInstitution(
  institutionId,
  { targetLevel, targetFaculty, degreeProgram },
) {
  if (!targetLevel) return;

  const query = { institution: institutionId, isActive: true, level: targetLevel };
  if (targetFaculty) query.faculty = targetFaculty;
  if (degreeProgram) query.program = degreeProgram;

  const offered = await Courses.exists(query);
  if (!offered) {
    const what = degreeProgram || targetFaculty || targetLevel;
    const err = new Error(
      `Your institution doesn't have "${what}" registered as an offered course. Add it under the Courses tab first.`,
    );
    err.statusCode = 400;
    throw err;
  }
}