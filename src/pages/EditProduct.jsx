import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductsbyid, updateProductById } from '../api/productApi';
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import toast from 'react-hot-toast';
import { getCategoriesItems } from '../api/categoryApi';
import { showUndoToast } from "../utils/toast";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
   const videoInputRef = useRef(null);
   const [isUploading, setIsUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [uploading, setUploading] = useState(false);


  const [formData, setFormData] = useState({
    name: '',
    shortdiscription: '',
    productid: '',
    karat: '',
    weight: '',
    makingCostPercent: '',
    wastagePercent: '',
    images: [],
    video: '',
    categoryId: [],
  });

  const [fileError, setFileError] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductsbyid(id);
        setFormData({
          name: res.data.name || '',
          shortdiscription: res.data.shortdiscription || '',
          productid: res.data.productid || '',
          karat: res.data.karat || '',
          weight: res.data.weight || '',
          makingCostPercent: res.data.makingCostPercent || '',
          wastagePercent: res.data.wastagePercent || '',
          images: res.data.images || [],
          video: res.data.video || '',
          categoryId: Array.isArray(res.data.categoryId)
                      ? res.data.categoryId
                      : res.data.categoryId != null
                        ? [res.data.categoryId]
                        : [],
        });
        setPreviewImages(res.data.images || []);
      } catch (error) {
        console.error('Error fetching product', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await getCategoriesItems();
        setCategories(res.data || []);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFileError('');

    if (name === 'images' && files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let validImages = [];
      let imagePreviews = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (allowedTypes.includes(file.type)) {
          validImages.push(file);
          imagePreviews.push(URL.createObjectURL(file));
        } else {
          setFileError('Please upload valid image files (JPEG, PNG, GIF, or WebP).');
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: validImages,
      }));
      setPreviewImages(imagePreviews);
    } else if (name === 'video' && files && files.length > 0) {
      const file = files[0];
      
      setFormData((prev) => ({ ...prev, video: file }));
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortdiscription: '',
      karat: '',
      weight: '',
      makingCostPercent: '',
      wastagePercent: '',
      images: [],
      video: '',
      categoryId: [],
    });
    setPreviewImages([]);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    setVideoPreview(null);    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true)

    const data = new FormData();
    data.append('productid', formData.productid);

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'productid' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            data.append(key, item);
          });
        } else {
          data.append(key, value);
        }
      }
    });

    try {
      await updateProductById(id, data);
         toast.success("Product updated successfully!");
      navigate('/allproduct');
    } catch (err) {
      console.error('Update failed', err);
      toast.error(" Update failed. Please try again.");
    } finally{
      setIsUploading(false)
      resetForm();
    }
   
  };

  const handleMediaUpload = async () => {
  if (!formData.video && formData.images.length === 0) {
    setFileError("No media selected for upload.");
    return;
  }

  try {
    setUploading(true);
    setUploadProgress(0);

    // Upload images
    const uploadedImageUrls = [];
    for (let i = 0; i < formData.images.length; i++) {
      const url = await uploadToCloudinary(formData.images[i], "products/images", (progress) => {
        setUploadProgress(Math.round(progress));
      });
      uploadedImageUrls.push(url);
    }

    // Upload video if exists
    let uploadedVideoUrl = '';
    if (formData.video) {
      uploadedVideoUrl = await uploadToCloudinary(formData.video, "products/videos", (progress) => {
        setUploadProgress(Math.round(progress));
      });
    }

    // Update formData with uploaded URLs
    setFormData((prev) => ({
      ...prev,
      imageUrls: uploadedImageUrls,
      videoUrl: uploadedVideoUrl,
    }));

    toast.success("Media uploaded successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to upload media.");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="py-5 px-4">
      <div className="container bg-white p-4 rounded shadow">
        <h2 className="fw-bold mb-4">Edit Product</h2>

        <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="col-md-6">
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
              required
              placeholder="e.g. Gold Necklace"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="shortdiscription" className="form-label fw-semibold">
              Short Description
            </label>
            <input
              type="text"
              className="form-control"
              id="shortdiscription"
              name="shortdiscription"
              value={formData.shortdiscription}
              onChange={handleChange}
              required
              placeholder="e.g. Elegant handcrafted design"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="productid" className="form-label fw-semibold">
              Product ID
            </label>
            <input
              type="text"
              className="form-control"
              id="productid"
              name="productid"
              value={formData.productid}
              readOnly
              disabled
            />
          </div>

          <div className="col-md-6">
             <label htmlFor="categoryId" className="form-label fw-semibold">
              Categories
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
                  ? categories
                      .filter((cat) => formData.categoryId.includes(cat._id))
                      .map((cat) => cat.label)
                      .join(", ")
                  : "Select categories"}
              </button>

              <ul
                className="dropdown-menu p-2 w-100"
                aria-labelledby="dropdownCategory"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              >
                {categories.map((cat) => (
                  <li key={cat._id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat._id}`}
                      checked={formData.categoryId.includes(cat._id)}
                      onChange={() => {
                        setFormData((prev) => {
                          const selected = prev.categoryId.includes(cat._id)
                            ? prev.categoryId.filter((id) => id !== cat._id)
                            : [...prev.categoryId, cat._id];
                          return { ...prev, categoryId: selected };
                        });
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

          <div className="col-md-6">
            <label htmlFor="karat" className="form-label fw-semibold">
              Karat
            </label>
            <select
              id="karat"
              name="karat"
              className="form-select"
              value={formData.karat}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select karat</option>
              <option value="24k">24k</option>
              <option value="22k">22k</option>
              <option value="18k">18k</option>
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="weight" className="form-label fw-semibold">
              Weight (grams)
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              placeholder="e.g. 5.2"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="makingCostPercent" className="form-label fw-semibold">
              Making Cost (%)
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="makingCostPercent"
              name="makingCostPercent"
              value={formData.makingCostPercent}
              onChange={handleChange}
              required
              placeholder="e.g. 10"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="wastagePercent" className="form-label fw-semibold">
              Wastage (%)
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="wastagePercent"
              name="wastagePercent"
              value={formData.wastagePercent}
              onChange={handleChange}
              required
              placeholder="e.g. 2"
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="images" className="form-label fw-semibold">
              Product Images
            </label>
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

          <div className="col-md-6">
            <label htmlFor="video" className="form-label fw-semibold">
              Video URL
            </label>
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
              <button
              type="button"
              onClick={handleMediaUpload}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : "Upload Media"}
            </button>

          </div>

          <div className="col-12 mt-3">
                       <button
              type="submit"
              className="btn btn-primary me-2 px-4"
              disabled={isUploading}
            >
              {isUploading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/allproduct')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;