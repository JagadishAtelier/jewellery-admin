import React, { useState, useRef, useEffect } from "react";
import { AddNewProduct } from "../api/productApi";
import { getCategoriesItems } from "../api/categoryApi";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { showUndoToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState("");
  const [categoriesId, setCategoriesId] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    shortdiscription: "",
    productid: "",
    karat: "",
    weight: "",
    makingCost: "",
    wastage: "",
    categoryId: [],
    images: [],
    video: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesItems();
        if (res.data && Array.isArray(res.data)) {
          setCategoriesId(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFileError("");

    if (name === "images") {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const validFiles = Array.from(files).filter((file) =>
        allowedTypes.includes(file.type)
      );

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validFiles],
        }));

        setPreviewImages((prev) => [
          ...prev,
          ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);
      } else {
        setFileError("Only image files (JPEG, PNG, GIF, WEBP) are allowed.");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (name === "video") {
      const videoFile = files[0];
      if (videoFile && videoFile.type.startsWith("video/")) {
        setFormData((prev) => ({ ...prev, video: videoFile }));
        setVideoPreview(URL.createObjectURL(videoFile));
      } else {
        setFileError("Please upload a valid video file.");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMediaUpload = async () => {
    const filesToUpload = formData.images.filter(item => item instanceof File);
    const videoFileToUpload = formData.video instanceof File ? formData.video : null;
    const totalItems = filesToUpload.length + (videoFileToUpload ? 1 : 0);
  
    if (totalItems === 0) {
      alert("No new media files selected to upload.");
      return;
    }
  
    setIsMediaUploading(true);
    setUploadProgress(0);
  
    try {
      let uploadedCount = 0;
      const newImageUrls = [];
  
      const updateProgress = (progress) => {
        const normalized = progress / 100;
        const overall = ((uploadedCount + normalized) / totalItems) * 100;
        setUploadProgress(Math.round(overall));
      };
  
      // Upload image files
      for (const file of filesToUpload) {
        const url = await uploadToCloudinary(file, "products/images", updateProgress);
        newImageUrls.push(url);
        uploadedCount++;
      }
  
      // Upload video file
      let finalVideoUrl = uploadedVideoUrl;
      let uploadedVideoFile = null;
  
      if (videoFileToUpload) {
        finalVideoUrl = await uploadToCloudinary(videoFileToUpload, "products/videos", updateProgress);
        uploadedVideoFile = videoFileToUpload;
        uploadedCount++;
      } else if (formData.video === null && uploadedVideoUrl !== null) {
        finalVideoUrl = null;
      }
  
      // Update formData with uploaded media URLs
      setFormData(prev => {
        const updatedImages = prev.images.map(item =>
          item instanceof File
            ? newImageUrls[filesToUpload.indexOf(item)] || item
            : item
        );
  
        let updatedVideo = prev.video;
        if (updatedVideo instanceof File && updatedVideo === uploadedVideoFile && finalVideoUrl) {
          updatedVideo = finalVideoUrl;
        } else if (prev.video === null) {
          updatedVideo = null;
        }
  
        return {
          ...prev,
          images: updatedImages,
          video: updatedVideo,
        };
      });
  
      // Update uploaded image/video URLs
      setUploadedImageUrls(prev => {
        const combined = [...prev, ...newImageUrls];
        return Array.from(new Set(combined));
      });
  
      setUploadedVideoUrl(
        formData.video === null
          ? null
          : typeof formData.video === "string"
          ? formData.video
          : finalVideoUrl
      );
  
      alert("Media uploaded successfully.");
    } catch (err) {
      console.error("Media upload failed", err);
      alert("Failed to upload images or video.");
    } finally {
      setIsMediaUploading(false);
      setUploadProgress(0);
    }
  };
  

  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.productid ||
      uploadedImageUrls.length === 0
    ) {
      alert("Please fill all required fields and upload media.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        shortdiscription: formData.shortdiscription.trim(),
        makingCostPercent: parseFloat(formData.makingCost),
        wastagePercent: parseFloat(formData.wastage),
        weight: parseFloat(formData.weight),
        images: uploadedImageUrls,
        video: uploadedVideoUrl,
        categoryId: formData.categoryId,
      };

      Object.entries(payload).forEach(([key, value]) => {
        // For arrays or objects, you might want to stringify them
        // to see the full content, otherwise, it might just show [Object] or [Array]
        const displayValue = (typeof value === 'object' && value !== null)
                               ? JSON.stringify(value) : value;
      
        console.log(`${key}: ${displayValue}`);
      });

      const res = await AddNewProduct(payload);
      if (res.data && res.data._id) {
        alert("Product uploaded successfully!");
        resetForm();
        navigate(`/allproduct`)
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("An error occurred during submission.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      shortdiscription: "",
      productid: "",
      karat: "",
      weight: "",
      makingCost: "",
      wastage: "",
      categoryId: [],
      images: [],
      video: null,
    });
    setPreviewImages([]);
    setVideoPreview(null);
    setUploadedImageUrls([]);
    setUploadedVideoUrl(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    navigate(`/allproduct`)
  };

  const handleRemoveMedia = ({ type, index }) => {
    const isConfirmed = window.confirm(`Remove this ${type}?`);
    if (!isConfirmed) return;

    if (type === "image") {
      const deletedFile = formData.images[index];
      const deletedPreview = previewImages[index];

      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));

      setRecentlyDeleted({
        type,
        file: deletedFile,
        preview: deletedPreview,
        index,
      });

      showUndoToast("Image deleted, undo within 5s", () => {
        setFormData((prev) => {
          const newImages = [...prev.images];
          newImages.splice(index, 0, deletedFile);
          return { ...prev, images: newImages };
        });
        setPreviewImages((prev) => {
          const newPreviews = [...prev];
          newPreviews.splice(index, 0, deletedPreview);
          return newPreviews;
        });
        setRecentlyDeleted(null);
      });
    } else if (type === "video") {
      const deletedVideo = formData.video;
      const deletedPreview = videoPreview;

      setFormData((prev) => ({ ...prev, video: null }));
      setVideoPreview(null);

      setRecentlyDeleted({ type, file: deletedVideo, preview: deletedPreview });

      showUndoToast("Video deleted, undo within 5s", () => {
        setFormData((prev) => ({ ...prev, video: deletedVideo }));
        setVideoPreview(deletedPreview);
        setRecentlyDeleted(null);
      });
    }
  };

  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => setRecentlyDeleted(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [recentlyDeleted]);

  return (
    <div className="py-5 px-4">
      <div className="container bg-white p-4 rounded shadow">
        <h2 className="fw-bold mb-4">Add Product</h2>
        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6 d-flex flex-column justify-content-between form-fileds">
            <div className="col-12 mt-2">
              <label htmlFor="name" className="form-label fw-semibold">
                Product Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mt-2">
              <label
                htmlFor="shortdiscription"
                className="form-label fw-semibold"
              >
                Short Description
              </label>
              <input
                type="text"
                className="form-control"
                id="shortdiscription"
                name="shortdiscription"
                value={formData.shortdiscription}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mt-2">
              <label htmlFor="productid" className="form-label fw-semibold">
                Product ID
              </label>
              <input
                type="text"
                className="form-control"
                id="productid"
                name="productid"
                value={formData.productid}
                onChange={handleChange}
              />
            </div>

        <div className="col-12 mt-2">
          <label htmlFor="categoryId" className="form-label fw-semibold">
            Category
          </label>

          <div className="dropdown">
            <button
              className="form-select text-start"
              type="button"
              id="dropdownCategory"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {formData.categoryId.length > 0
                ? categoriesId
                    .filter((cat) => formData.categoryId.includes(cat._id))
                    .map((cat) => cat.label)
                    .join(", ")
                : "Select categories"}
            </button>

            <ul className="dropdown-menu p-2 w-100" aria-labelledby="dropdownCategory" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {categoriesId.map((cat) => (
                <li key={cat._id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={cat._id}
                    id={`cat-${cat._id}`}
                    checked={formData.categoryId.includes(cat._id)}
                    onChange={(e) => {
                      const selected = [...formData.categoryId];
                      if (e.target.checked) {
                        selected.push(cat._id);
                      } else {
                        const index = selected.indexOf(cat._id);
                        if (index > -1) selected.splice(index, 1);
                      }
                      setFormData((prev) => ({ ...prev, categoryId: selected }));
                    }}
                  />
                  <label className="form-check-label ms-2" htmlFor={`cat-${cat._id}`}>
                    {cat.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>



            <div className="col-12 mt-2">
              <label htmlFor="karat" className="form-label fw-semibold">
                Karat
              </label>
              <select
                id="karat"
                name="karat"
                className="form-select"
                value={formData.karat}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select karat
                </option>
                <option value="24k">24k</option>
                <option value="22k">22k</option>
                <option value="18k">18k</option>
              </select>
            </div>

            <div className="col-12 mt-2">
              <label htmlFor="weight" className="form-label fw-semibold">
                Weight (grams)
              </label>
              <input
                type="number"
                className="form-control"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mt-2">
              <label htmlFor="makingCost" className="form-label fw-semibold">
                Making Cost (%)
              </label>
              <input
                type="number"
                className="form-control"
                id="makingCost"
                name="makingCost"
                value={formData.makingCost}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mt-2">
              <label htmlFor="wastage" className="form-label fw-semibold">
                Wastage (%)
              </label>
              <input
                type="number"
                className="form-control"
                id="wastage"
                name="wastage"
                value={formData.wastage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6 form-fileds">
            <div className="col-12">
              <label htmlFor="images" className="form-label fw-semibold">Product Images</label>
              <input
                type="file"
                className="form-control"
                id="images"
                name="images"
                multiple
                onChange={handleChange}
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/gif, image/webp"
              />
              {fileError && <div className="text-danger mt-1">{fileError}</div>}
              <div className="d-flex flex-wrap gap-3 mt-3">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="position-relative">
                    <img src={src} alt={`Preview ${idx}`} style={{ maxWidth: 100, maxHeight: 100 }} className="rounded" />
                    <button type="button" onClick={() => handleRemoveMedia({ type: "image", index: idx })} className="btn btn-sm btn-dark position-absolute top-0 end-0">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Section */}
            <div className="col-12 mt-4">
              <label htmlFor="video" className="form-label fw-semibold">Product Video</label>
              <input
                type="file"
                className="form-control"
                id="video"
                name="video"
                onChange={handleChange}
                ref={videoInputRef}
                accept="video/*"
              />
              {videoPreview && (
                <div className="position-relative mt-2" style={{ maxWidth: "200px" }}>
                  <video src={videoPreview} autoPlay loop muted className="w-100 rounded" />
                  <button
                    type="button"
                    className="btn btn-sm position-absolute start-50 translate-middle-x"
                    style={{ bottom: "-12px", background: "#000", color: "#fff" }}
                    onClick={() => handleRemoveMedia({ type: "video" })}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="col-12 mt-4">
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={handleMediaUpload}
                disabled={isMediaUploading || formData.images.length === 0}
              >
                {isMediaUploading ? "Uploading..." : "Upload Media"}
              </button>
            </div>
            {isMediaUploading && (
          <div className="progress my-3">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        )}
          </div>

          


          {/* Submit */}
          <div className="col-12 mt-3">
            <button
              type="submit"
              className="btn btn-primary me-2 px-4"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}