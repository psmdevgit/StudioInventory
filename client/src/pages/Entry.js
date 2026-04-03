// ...rest of your imports
import React, { useEffect, useState } from "react";
import "../style/Entry.css";
import API from "../axios";
import Select from "react-select";

const Entry = () => {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    weight: "",
    date: new Date().toISOString().split("T")[0],
    remark: "", // ✅ added remark field
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.empName || "";


  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getToken();
    getProducts();
  }, []);

  const getToken = async () => {
    const res = await API.get("/getToken");
    setToken(res.data.token);
  };

  const getProducts = async () => {
    const res = await API.get("/getProducts");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async () => {
  if (!form.newProduct || form.newProduct.trim() === "") {
    alert("Enter product name");
    return;
  }

   const confirmAdd = window.confirm(
    `Are you sure you want to add "${form.newProduct.trim()}" as a new product?`
  );
  
  if (!confirmAdd) return; // user cancelled
  
  try {
    const productName = form.newProduct.trim().toUpperCase();
    
    await API.post("/addProduct", { name: productName });
    
    alert("Product added successfully");
    
    // Refresh product list
    getProducts();
    
    // Select the new product automatically
    setForm({ ...form, product: productName, newProduct: "" });
  } catch (err) {
    console.error(err);
    alert("Error adding product");
  }
};

  const handleSubmit = async () => {
    if (!form.product || !form.weight) {
      alert("Fill all required fields");
      return;
    }

    if (!image) {
      alert("Please select or capture an image before submitting");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("product", form.product);
    formData.append("weight", form.weight);
    formData.append("date", form.date);
    formData.append("remark", form.remark); // ✅ send remark
    formData.append("image", image);
    formData.append("user", userName);

    try {
      await API.post("/saveEntry", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Saved Successfully");

      setForm({
        product: "",
        weight: "",
        date: new Date().toISOString().split("T")[0],
        remark: "",
      });
      setImage(null);
      setPreview(null);
      getToken(); // next token
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error saving entry. Try again!");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg p-4 rounded-4">
        <h3 className="text-center mb-4">Product Entry</h3>

        <div className="row">
          {/* LEFT FORM */}
          <div className="col-md-6">
            {/* Token */}
            <div className="mb-3">
              <label>Transfer ID</label>
              <input className="form-control" value={token} readOnly />
            </div>

            {/* Product */}
            {/* <div className="mb-3">
              <label>Product</label>
              <select
                name="product"
                className="form-control"
                onChange={handleChange}
                value={form.product}
              >
                <option value="">Select Product</option>
                {products.map((p, i) => (
                  <option key={i} value={p.counter}>
                    {p.counter}
                  </option>
                ))}
              </select>
            </div> */}


            <div className="mb-3">
              <label>Product</label>
              {/* <select
                name="product"
                className="form-control"
                onChange={handleChange}
                value={form.product}
              >
                <option value="">Select Product</option>
                {products.map((p, i) => (
                  <option key={i} value={p.counter}>
                    {p.counter}
                  </option>
                ))}
                <option value="__ADD_NEW__">+ Add New Product</option>
              </select> */}

              <Select
                options={[
                  ...products.map(p => ({ value: p.counter, label: p.counter })),
                  { value: "__ADD_NEW__", label: "+ Add New Product" }
                ]}
                value={
                  form.product
                    ? { value: form.product, label: form.product }
                    : null
                }
                onChange={(option) => setForm({ ...form, product: option.value })}
                isSearchable
              />

            </div>

            {/* Input field for new product */}
            {form.product === "__ADD_NEW__" && (
              <div className="mb-3">
                <label>New Product Name</label>
                <input
                  type="text"
                  name="newProduct"
                  className="form-control"
                  value={form.newProduct || ""}
                  onChange={handleChange}
                  placeholder="Enter new product name"
                />
                <button
                  className="btn btn-success mt-2"
                  onClick={handleAddProduct}
                >
                  Add Product
                </button>
              </div>
            )}


            {/* Weight */}
            <div className="mb-3">
              <label>Issued Weight</label>
              <input
                type="number"
                name="weight"
                className="form-control"
                onChange={handleChange}
                value={form.weight}
              />
            </div>

            {/* Date */}
            <div className="mb-3">
              <label>Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={form.date}
                readOnly
              />
            </div>

            {/* Remark */}
            <div className="mb-3">
              <label>Remark</label>
              <textarea
                name="remark"
                className="form-control"
                rows={3}
                placeholder="Enter remark or note..."
                value={form.remark}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Image Upload */}
            {/* <div className="mb-3">
              <label>Upload / Capture Image</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-control"
                onChange={handleImage}
              />
            </div> */}

            {/* Image Upload */}
            <div className="mb-3">
              <label>Upload / Capture Image</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="form-control"
                onChange={handleImage}
              />
              {/* Display file name if selected */}
              {/* {image && (
                <small className="text-muted d-block mt-1">
                  Selected File: {image.name}
                </small>
              )} */}

              {image && (
                <small className="text-muted d-block mt-1">
                  Selected File: {image.name.length > 30 
                    ? image.name.slice(0, 30) + "..." 
                    : image.name}
                </small>
              )}

            </div>


            
          </div>

          {/* RIGHT PREVIEW */}
          <div className="col-md-6 text-center">
            <h6>Image Preview</h6>
            {preview ? (
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div className="border p-5 text-muted">No Image Selected</div>
            )}
            <button className="btn btn-primary w-100 mt-lg-5 mt-2" onClick={handleSubmit}>
              Submit
            </button>

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Entry;