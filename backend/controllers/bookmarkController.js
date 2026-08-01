import Bookmark from "../models/Bookmark.js";

// POST /api/bookmarks/:scholarshipId
export const addBookmark = async (req, res) => {
  try {
    const { scholarshipId } = req.params;

    const existing = await Bookmark.findOne({
      user: req.user.id,
      scholarship: scholarshipId,
    });

    if (existing) {
      return res
        .status(200)
        .json({ message: "Already bookmarked.", bookmarked: true });
    }

    await Bookmark.create({ user: req.user.id, scholarship: scholarshipId });

    return res
      .status(201)
      .json({ message: "Scholarship bookmarked.", bookmarked: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/bookmarks/:scholarshipId
export const removeBookmark = async (req, res) => {
  try {
    const { scholarshipId } = req.params;

    await Bookmark.findOneAndDelete({
      user: req.user.id,
      scholarship: scholarshipId,
    });

    return res.json({ message: "Bookmark removed.", bookmarked: false });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/bookmarks — full bookmark list with scholarship details
export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate("scholarship")
      .sort({ createdAt: -1 });

    // Drop bookmarks pointing at a scholarship that's since been deleted
    const valid = bookmarks.filter((b) => b.scholarship);

    return res.json({
      bookmarks: valid.map((b) => ({
        bookmarkId: b._id,
        createdAt: b.createdAt,
        scholarship: b.scholarship,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/bookmarks/mine-ids — lightweight list of bookmarked scholarship IDs
// (used by scholarship list/detail pages to show filled vs. outline icon)
export const getMyBookmarkIds = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id }).select(
      "scholarship"
    );
    return res.json({
      scholarshipIds: bookmarks.map((b) => b.scholarship.toString()),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};