// paginate.js — Reusable pagination helper
//
// Usage:
//   const paginate = require('../utils/paginate');
//
//   const result = await paginate(
//     Scholarship,
//     { isActive: true, isDeleted: false },
//     {
//       page:     req.query.page,
//       limit:    req.query.limit,
//       sort:     { applicationDeadline: 1 },
//       populate: [{ path: 'collegeId', select: 'collegeName contactInfo' }],
//       select:   'scholarshipTitle scholarshipType financialDetails applicationDeadline',
//     }
//   );
//
//   res.json({
//     data:       result.data,
//     pagination: result.pagination,
//   });
//
// Returns:
//   {
//     data: [...documents],
//     pagination: {
//       page:       1,
//       limit:      10,
//       total:      47,
//       pages:      5,
//       hasNext:    true,
//       hasPrev:    false,
//     }
//   }

const paginate = async (model, query = {}, options = {}) => {
  const page  = Math.max(1, parseInt(options.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));  // cap at 100
  const skip  = (page - 1) * limit;

  // Build query chain
  let q = model.find(query);

  if (options.select)   q = q.select(options.select);
  if (options.populate) {
    const populations = Array.isArray(options.populate)
      ? options.populate
      : [options.populate];
    populations.forEach((p) => { q = q.populate(p); });
  }

  // Run count and data fetch in parallel for performance
  const [total, data] = await Promise.all([
    model.countDocuments(query),
    q
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),              // plain JS objects — faster than Mongoose documents for reads
  ]);

  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
};

module.exports = paginate;