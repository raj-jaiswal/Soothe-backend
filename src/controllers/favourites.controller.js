const favouritesRepo = require("../db/favourites.repo");

async function getFavourites(req, res) {
  try {
    const userId = req.user.userId || req.user.id;

    const favourites = await favouritesRepo.getUserFavourites(userId);

    return res.status(200).json(favourites);
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return res.status(500).json({ error: "Failed to fetch favourites" });
  }
}

async function addFavourite(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const { songId } = req.params;

    const existing = await favouritesRepo.getFavourite(userId, songId);

    if (existing) {
      return res.status(200).json({
        message: "Song already in favourites",
        favourite: existing,
      });
    }

    const favourite = await favouritesRepo.addFavourite(userId, songId);

    return res.status(201).json({
      message: "Song added to favourites",
      favourite,
    });
  } catch (error) {
    console.error("Error adding favourite:", error);
    return res.status(500).json({ error: "Failed to add favourite" });
  }
}

async function removeFavourite(req, res) {
  try {
    const userId = req.user.userId || req.user.id;
    const { songId } = req.params;

    const existing = await favouritesRepo.getFavourite(userId, songId);

    if (!existing) {
      return res.status(404).json({ error: "Favourite not found" });
    }

    await favouritesRepo.removeFavourite(userId, songId);

    return res.status(200).json({
      message: "Song removed from favourites",
    });
  } catch (error) {
    console.error("Error removing favourite:", error);
    return res.status(500).json({ error: "Failed to remove favourite" });
  }
}

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};