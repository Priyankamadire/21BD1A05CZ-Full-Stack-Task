const express = require("express");
const axios = require("axios");
const cors = require("cors");
 
const app = express();

app.use(express.json());
app.use(cors());
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

app.get("/categories/:categoryname/products/:productid", async (req, res) => {
  try {
    const { categoryname, productid } = req.params;
    const accessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MDc0ODA0LCJpYXQiOjE3MTcwNzQ1MDQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImJhMzU1OGVhLTQ0NTgtNDU1Ni04NTJlLTBkYmEwOWZkYTNjMSIsInN1YiI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiVmVyY2VsQ29tcGFueSIsImNsaWVudElEIjoiYmEzNTU4ZWEtNDQ1OC00NTU2LTg1MmUtMGRiYTA5ZmRhM2MxIiwiY2xpZW50U2VjcmV0IjoiS0xBVW5rd29vaGtYTXJxcyIsIm93bmVyTmFtZSI6IlByaXlhbmthIiwib3duZXJFbWFpbCI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIiwicm9sbE5vIjoiMjFiZDFhMDVjeiJ9.CLI0TACKlsjHvj7drMOr65eZdHj0DXtxaHE7VU8pvO0";

    const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
    let productDetail = null;

    for (const company of companies) {
      try {
        const response = await axios.get(
          `http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products/${productid}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data) {
          productDetail = response.data;
          break;
        }
      } catch (error) {
        
      }
    }

    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "unauthorized. Please login again" });
    }

    res.json(productDetail);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get(
  "/test/companies/:companyname/categories/:category/products",
  async (req, res) => {
    try {
      const { companyname, categoryname } = req.params;
      const { top, minPrice, maxPrice } = req.query;

      const accessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MDc0ODA0LCJpYXQiOjE3MTcwNzQ1MDQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImJhMzU1OGVhLTQ0NTgtNDU1Ni04NTJlLTBkYmEwOWZkYTNjMSIsInN1YiI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiVmVyY2VsQ29tcGFueSIsImNsaWVudElEIjoiYmEzNTU4ZWEtNDQ1OC00NTU2LTg1MmUtMGRiYTA5ZmRhM2MxIiwiY2xpZW50U2VjcmV0IjoiS0xBVW5rd29vaGtYTXJxcyIsIm93bmVyTmFtZSI6IlByaXlhbmthIiwib3duZXJFbWFpbCI6Im1hZGlyZXByaXlhbmthMzdAZ21haWwuY29tIiwicm9sbE5vIjoiMjFiZDFhMDVjeiJ9.CLI0TACKlsjHvj7drMOr65eZdHj0DXtxaHE7VU8pvO0";

      const productsResponse = await axios.get(
        `http://20.244.56.144/test/companies/${companyname}/categories/${categoryname}/products`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            top,
            minPrice,
            maxPrice,
          },
        }
      );

      return res.json(productsResponse.data);
    } catch (error) {
      console.log("Unauthorized. Please login again");
      if (error.response && error.response.status === 401) {
        return res
          .status(401)
          .json({ message: "Unauthorized. Please login again." });
      }
      return res.status(500).json("Internal Server Error");
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
