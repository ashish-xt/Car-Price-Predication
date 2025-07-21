import React, { useState } from "react";
import "./style.css";

const Form = () => {
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
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredictClick = (event) => {
    event.preventDefault();
    setIsLoading(true);

    fetch("https://car-price-predication.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        setResult(data.Prediction?.[0] || "Error in prediction");
        setShowSpan(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setResult("Error in prediction");
        setShowSpan(true);
        setIsLoading(false);
      });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Add warning state
  const [yearWarning, setYearWarning] = useState("");

  // Update handleChange to check year
  const handleChangeWithYearCheck = (event) => {
    const { name, value } = event.target;
    if (name === "Year") {
      if (value === "2019") {
        setYearWarning("Please enter a year less than 2019.");
      } else if (value && Number(value) < 2003) {
        setYearWarning("Please enter a year greater than 2003.");
      } else {
        setYearWarning("");
      }
    }
    handleChange(event);
  };

  return (
    <div
      className="flex justify-center items-center h-screen w-full bg-cover bg-center bg-no-repeat font-poppins"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      <div className="w-full max-w-4xl bg-white bg-opacity-90 p-6 rounded-lg shadow-xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-center mb-6">
          Car Price Prediction
        </h2>
        <form
          onSubmit={handlePredictClick}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block mb-1 font-medium">Year of Purchase</label>
            <input
              type="number"
              name="Year"
              value={formData.Year}
              onChange={handleChangeWithYearCheck}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter Year"
            />
            {yearWarning && (
              <span className="text-red-600 text-sm">{yearWarning}</span>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Kilometers Driven</label>
            <input
              type="number"
              name="Kms_Driven"
              value={formData.Kms_Driven}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter KM Driven"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Fuel Type</label>
            <select
              name="Fuel_Type"
              value={formData.Fuel_Type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Seller Type</label>
            <select
              name="Seller_Type"
              value={formData.Seller_Type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Dealer">Dealer</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Transmission</label>
            <select
              name="Transmission"
              value={formData.Transmission}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Number of Owners</label>
            <input
              type="number"
              name="Owner"
              value={formData.Owner}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter Number of Owners"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Brand Name</label>
            <input
              type="text"
              name="Brand_Name"
              value={formData.Brand_Name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter Brand Name"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              {isLoading ? "Predicting..." : "Predict Price"}
            </button>
          </div>
        </form>
        {showSpan && (
          <div className="mt-4 text-center text-lg font-semibold">
            {result && result !== "Error in prediction" ? (
              <p>The Predicted Price is {formatPrice(result)}</p>
            ) : (
              <p>Please fill out each field in the form completely</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
