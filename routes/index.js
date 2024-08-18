const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const ScrapedData = require("../models/ScrapedData");

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/scrape", async (req, res) => {
  const { url } = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
    } catch (err) {
      throw new Error("Failed to navigate to the URL");
    }

    const data = await page.evaluate(() => {
      const title = document.title;

      const description =
        document.querySelector('meta[name="description"]')?.content ||
        "No description available";

      const paragraphs = Array.from(document.querySelectorAll("p")).map(
        (p) => p.innerText
      );

      const headers = {};
      for (let i = 1; i <= 6; i++) {
        headers[`h${i}`] = Array.from(document.querySelectorAll(`h${i}`)).map(
          (h) => h.innerText
        );
      }

      const links = Array.from(document.querySelectorAll("a")).map((a) => ({
        href: a.href,
        text: a.innerText,
      }));

      const images = Array.from(document.querySelectorAll("img")).map(
        (img) => img.src
      );

      return {
        title,
        description,
        paragraphs,
        headers,
        links,
        images,
      };
    });

    await browser.close();

    const scrapedData = new ScrapedData({ url, data });
    await scrapedData.save();

    res.render("result", { data });
  } catch (err) {
    console.error(err);
    res.render("error", { error: "Failed to scrape the website." });
  }
});

module.exports = router;
