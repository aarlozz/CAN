import * as scholarshipService from "../services/scholarshipService.js";

// ─── POST /api/scholarship/create ────────────────────────────────────────────
export const createScholarship = async (req, res) => {
  try {
    const scholarship = await scholarshipService.createScholarship({
      userId: req.user.id,
      body: req.body,
    });
    res.status(201).json({ message: "Scholarship created.", scholarship });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("createScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/scholarship/all (public) ───────────────────────────────────────
export const getAllScholarships = async (req, res) => {
  try {
    const result = await scholarshipService.getAllScholarships(req.query);
    res.status(200).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getAllScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/scholarship/my (institution only) ──────────────────────────────
export const getMyScholarships = async (req, res) => {
  try {
    const result = await scholarshipService.getMyScholarships({
      userId: req.user.id,
      search: req.query.search,
    });
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getMyScholarships error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/scholarship/:id (public) ───────────────────────────────────────
export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await scholarshipService.getScholarshipById(req.params.id);
    res.json({ scholarship });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("getScholarshipById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/scholarship/:id (institution only) ────────────────────────────
export const updateScholarship = async (req, res) => {
  try {
    const scholarship = await scholarshipService.updateScholarship({
      userId: req.user.id,
      id: req.params.id,
      body: req.body,
    });
    res.json({ message: "Scholarship updated.", scholarship });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("updateScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE /api/scholarship/:id (institution only) ──────────────────────────
export const deleteScholarship = async (req, res) => {
  try {
    await scholarshipService.deleteScholarship({
      userId: req.user.id,
      id: req.params.id,
    });
    res.json({ message: "Scholarship deleted." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("deleteScholarship error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};