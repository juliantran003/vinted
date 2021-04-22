const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "juliantran",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const mongoose = require("mongoose");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  console.log("route : /offer/publish");
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { product_condition: condition },
        { product_city: city },
        { product_brand: brand },
        { product_size: size },
        { product_color: color },
      ],
      owner: req.user,
    });
    const picture = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });
    newOffer.product_image = picture;
    newOffer.save();
    res.status(200).json({
      _id: newOffer._id,
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      owner: req.user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/offer/update", isAuthenticated, async (req, res) => {
  console.log("route : /offer/update");

  try {
    if (req.fields.id) {
      const offerToUpdate = await Offer.findById(req.fields.id);
      if (req.fields.title) {
        offerToUpdate.product_name = req.fields.title;
      }
      if (req.fields.description) {
        offerToUpdate.product_description = req.fields.description;
      }
      if (req.fields.price) {
        offerToUpdate.product_price = req.fields.price;
      }
      if (req.fields.condition) {
        offerToUpdate.product_details[0] = {
          product_condition: req.fields.condition,
        };
      }
      if (req.fields.city) {
        offerToUpdate.product_details[1] = { product_city: req.fields.city };
      }
      if (req.fields.brand) {
        offerToUpdate.product_details[2] = {
          product_brand: req.fields.brand,
        };
      }
      if (req.fields.size) {
        offerToUpdate.product_details[3] = { product_size: req.fields.size };
      }
      if (req.fields.color) {
        offerToUpdate.product_details[4] = {
          product_color: req.fields.color,
        };
      }
      offerToUpdate.markModified("product_details");
      // product_image: picture,;
      await offerToUpdate.save();

      console.log(offerToUpdate);
      res.json(offerToUpdate);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.id) {
      await Offer.findByIdAndDelete(req.fields.id);
      res.json({ message: "Offer removed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = {
        product_name: new RegExp(req.query.title, "i"),
      };
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    let sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    const limit = Number(req.query.limit);
    let page;
    if (Number(req.query.page) > 0) {
      page = (Number(req.query.page) - 1) * limit;
    } else {
      page = 0;
    }

    const results = await Offer.find(filters)
      .sort(sort)
      // .populate("owner")
      .skip()
      .limit(limit)
      .select("product_name product_price");
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    if (req.params.id) {
      const result = await Offer.findById(req.params.id);
      return res.status(200).json(result);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
