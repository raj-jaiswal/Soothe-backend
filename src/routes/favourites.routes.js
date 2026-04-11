const express = require("express");
const router = express.Router();

const favouritesController = require("../controllers/favourites.controller");
const verifyToken = require("../middleware/auth.middleware");

router.get("/", verifyToken, favouritesController.getFavourites);
router.post("/:songId", verifyToken, favouritesController.addFavourite);
router.delete("/:songId", verifyToken, favouritesController.removeFavourite);

module.exports = router;