import * as applicationService from "../services/applicationService.js";

// ─── POST /api/application/apply (student only) ──────────────────────────────
export const applyForScholarship = async (req, res) => {
  try {
    const application = await applicationService.applyForScholarship({
      userId: req.user.id,
      body: req.body,
    });
    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("applyForScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/application/my (student only) ──────────────────────────────────
export const getMyApplications = async (req, res) => {
  try {
    const result = await applicationService.getMyApplications(req.user.id);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getMyApplications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/application/institution (institution only) ─────────────────────
export const getInstitutionApplications = async (req, res) => {
  try {
    const result = await applicationService.getInstitutionApplications({
      userId: req.user.id,
      query: req.query,
    });
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getInstitutionApplications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/application/:id (student or institution) ───────────────────────
export const getApplicationById = async (req, res) => {
  try {
    const application = await applicationService.getApplicationById({
      userId: req.user.id,
      role: req.user.role,
      id: req.params.id,
    });
    res.json({ application });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getApplicationById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PATCH /api/application/:id/review (institution only) ────────────────────
export const reviewApplication = async (req, res) => {
  try {
    const { status, rejectionReason, internalNotes } = req.body;
    const application = await applicationService.reviewApplication({
      userId: req.user.id,
      id: req.params.id,
      status,
      rejectionReason,
      internalNotes,
    });
    res.json({ message: `Application ${status}.`, application });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("reviewApplication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PATCH /api/application/:id/withdraw (student only) ──────────────────────
export const withdrawApplication = async (req, res) => {
  try {
    await applicationService.withdrawApplication({
      userId: req.user.id,
      id: req.params.id,
    });
    res.json({ message: "Application withdrawn successfully." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("withdrawApplication error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
