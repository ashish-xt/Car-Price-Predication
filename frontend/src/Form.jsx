import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

const Form2 = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    Year: "",
    Kms_Driven: "",
    Fuel_Type: "",
    Seller_Type: "",
    Transmission: "",
    Owner: "",
    Brand_Name: "",
  });

  const [result, setResult] = useState("");
  const [showSpan, setShowSpan] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;
    const name = event.target.name;
    let inputData = { ...formData };
    inputData[name] = value;
    setFormData(inputData);
  };

  const handlePredictClick = (event) => {
    event.preventDefault();
    setIsLoading(true);
    // http://localhost:5000/predict
    fetch("https://car-price-predication.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year: formData.Year,
        km_driven: formData.Kms_Driven,
        fuel: formData.Fuel_Type,
        seller_type: formData.Seller_Type,
        transmission: formData.Transmission,
        owner: formData.Owner,
        name: formData.Brand_Name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.Prediction) {
          setResult(data.Prediction[0]);
        } else {
          setResult("Error in prediction");
        }
        setIsLoading(false);
        setShowSpan(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setResult("Error in prediction");
        setIsLoading(false);
        setShowSpan(true);
      });
  };

  // Function to format the result in Indian price format
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };
  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        backgroundImage: `url(
          "https://www.motortrend.com/uploads/sites/5/2020/11/2021-MotorTrend-Car-of-the-Year-group-shot-1.jpg?w=768&width=768&q=75&format=webp"
        )`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        fontFamily: "Work Sans, sans-serif", // Applying Work Sans font globally
      }}
    >
      <div
        className="p-5 shadow-lg rounded"
        style={{
          background: "rgba(0, 0, 0, 0.5)", // Transparent Black Background
          width: "90%",
          maxWidth: "500px", // Increased form width
          color: "white",
          fontFamily: "Work Sans, sans-serif", // Work Sans applied
        }}
      >
        <h2 className="text-center mb-4">Car Price Prediction</h2>
        <form method="post" acceptCharset="utf-8" name="Modelform">
          <div className="mb-3">
            <label className="form-label">Year of Purchase</label>
            <input
              type="number"
              className="form-control"
              id="Year"
              name="Year"
              value={formData.Year}
              onChange={handleChange}
              placeholder="Enter Year of Purchase "
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Kilometers Driven</label>
            <input
              type="number"
              className="form-control"
              id="Kms_Driven"
              name="Kms_Driven"
              value={formData.Kms_Driven}
              onChange={handleChange}
              placeholder="Enter the kilometres driven "
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fuel Type</label>
            <select
              className="form-select"
              id="Fuel_Type"
              name="Fuel_Type"
              value={formData.Fuel_Type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Seller Type</label>
            <select
              className="form-select"
              id="Seller_Type"
              name="Seller_Type"
              value={formData.Seller_Type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Dealer">Dealer</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Transmission Type</label>
            <select
              className="form-select"
              id="Transmission"
              name="Transmission"
              value={formData.Transmission}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Number of Owners</label>
            <input
              type="number"
              className="form-control"
              id="Owner"
              name="Owner"
              value={formData.Owner}
              onChange={handleChange}
              placeholder="Enter the number of Owner "
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Brand Name</label>
            <input
              type="text"
              className="form-control"
              id="Brand_Name"
              name="Brand_Name"
              value={formData.Brand_Name}
              onChange={handleChange}
              placeholder="Enter Brand Name"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
            onClick={!isLoading ? handlePredictClick : null}
          >
            Predict Price
          </button>
        </form>
        <br />
        <h4>
          {showSpan && (
            <span id="prediction">
              {result && result !== "Error in prediction" ? (
                <p> The Predicted Price is {formatPrice(result)}</p>
              ) : (
                <p>Please fill out each field in the form completely</p>
              )}
            </span>
          )}
        </h4>
      </div>
    </div>
  );
};

export default Form2;
