const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const NodeCache = require("node-cache");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT;

const TEST_SERVER_URL = "http://20.244.56.144/test/companies";
app.use(cors());
const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MDc0ODA0LCJpYXQiOjE3MTcwNzQ1MDQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImJhMzU1OGVhLTQ0NTgtNDU1Ni04NTJlLTBkYmEwOWZkYTNjMSIsInN1YiI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiVmVyY2VsQ29tcGFueSIsImNsaWVudElEIjoiYmEzNTU4ZWEtNDQ1OC00NTU2LTg1MmUtMGRiYTA5ZmRhM2MxIiwiY2xpZW50U2VjcmV0IjoiS0xBVW5rd29vaGtYTXJxcyIsIm93bmVyTmFtZSI6IlByaXlhbmthIiwib3duZXJFbWFpbCI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIiwicm9sbE5vIjoiMjFiZDFhMDVjeiJ9.CLI0TACKlsjHvj7drMOr65eZdHj0DXtxaHE7VU8pvO0";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const generateProductId = () => uuidv4();

const fetchProducts = async (
  company,
  categoryname,
  top,
  minPrice,
  maxPrice
) => {
  try {
    const response = await axios.get(
      `${TEST_SERVER_URL}/${company}/categories/${categoryname}/products`,
      {
        params: { top, minPrice, maxPrice },
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${company}:`, error.message);
    return [];
  }
};

app.get("/categories/:categoryname/products", async (req, res) => {
  try {
    const { categoryname } = req.params;
    const {
      n = 10,
      minPrice = 0,
      maxPrice = Infinity,
      page = 1,
      sortBy,
      sortOrder = "asc",
    } = req.query;

    const top = parseInt(n);
    const pageNum = parseInt(page);
    const cacheKey = `${categoryname}_${top}_${minPrice}_${maxPrice}_${pageNum}_${sortBy}_${sortOrder}`;

    if (cache.has(cacheKey)) {
      console.log("Cache hit");
      return res.json(cache.get(cacheKey));
    }

    const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    let products = [];

    for (const company of companies) {
      const companyProducts = await fetchProducts(
        company,
        categoryname,
        top,
        minPrice,
        maxPrice
      );
      products = products.concat(companyProducts);
    }

    if (products.length === 0) {
      console.log("No products found");
      return res.json({ products: [] });
    }

    if (sortBy) {
      products.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    const startIndex = (pageNum - 1) * top;
    const endIndex = startIndex + top;
    const paginatedProducts = products.slice(startIndex, endIndex);

    paginatedProducts.forEach((product) => {
      product.id = generateProductId();
    });

    const response = { products: paginatedProducts };
    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/categories/:categoryname/products/:productid", (req, res) => {
  const { categoryname, productid } = req.params;

  const productDetail = {
    id: productid,
    name: "Sample Product",
    category: categoryname,
    price: 99.99,
    rating: 4.5,
    company: "Sample Company",
    discount: 10,
    availability: "yes",
  };

  res.json(productDetail);
});

app.get(
  "/test/companies/:companyname/categories/:category/products",
  async (req, res) => {
    try {
      const { companyname, category } = req.params;

      const url = `${TEST_SERVER_URL}/test/companies/${companyname}/categories/${category}/products`;

      const response = await axios.get(url);

      res.json(response.data);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
