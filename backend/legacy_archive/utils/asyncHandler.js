// asyncHandler.js — Async controller wrapper
//
// Wraps any async route handler and forwards any thrown error
// to Express's next() so the global errorHandler catches it.
//
// Without this, every controller needs its own try/catch:
//   exports.getProfile = async (req, res) => {
//     try { ... } catch (err) { res.status(500).json(...) }
//   }
//
// With this, controllers are clean:
//   exports.getProfile = asyncHandler(async (req, res) => {
//     const profile = await Student.findOne({ userId: req.user._id });
//     res.json({ data: profile });
//   });
//
// Any thrown error or rejected promise is caught here and
// passed to the global errorHandler middleware in app.js.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;