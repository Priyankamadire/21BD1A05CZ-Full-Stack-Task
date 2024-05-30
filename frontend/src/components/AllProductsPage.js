import React, { useState, useEffect } from "react";
import axios from "axios";

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/categories/AMZ/products`)
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-5">Products of AMZ in Laptop Category</h1>
      <div className="row">
        {products.map((product, index) => (
          <div key={index} className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <img
                src="http://3.bp.blogspot.com/-Cs3L8dGH9jA/Tnfw4I4CT4I/AAAAAAAAAH8/4zq0yTDNE_4/s1600/Dell-XPS-Laptop.jpg"
                alt={product.productName}
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">{product.productName}</h5>
                <p className="card-text">Price: ${product.price}</p>
                <p className="card-text">Rating: {product.rating}</p>
                <p className="card-text">Discount: {product.discount}%</p>
                <p className="card-text">
                  Availability: {product.availability}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProductsPage;
