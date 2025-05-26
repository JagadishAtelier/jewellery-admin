import { useEffect, useRef, useState } from "react";
import big from "../../assets/big-w-big.png";
import medium from "../../assets/box-w-medium.png";
import small from "../../assets/box-w-small.png";
import "./Catagories.css";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { showUndoToast } from "../../utils/toast.jsx";

import {
  createCategory, // Used for adding new items to a category (or creating column with first item)
  deleteCategory, // Used for deleting entire columns
  CreatCategoriesStyle, // Used to create the initial column
  getCategories, // Used for fetching all categories
  deleteCategoryItem, // Used for deleting individual items
  updateCategoryItem, // NEW: Used for updating individual items
} from "../../api/categoryApi.js";

Modal.setAppElement("#root");

const bgOptions = [
  { value: "background-black", color: "#000000" },
  { value: "background-pink", color: "#FF66B2" },
  { value: "background-blue", color: "#007BFF" },
];

const column = [
  { value: "box-w-big", name: "Big", img: big },
  { value: "box-w-medium", name: "Medium", img: medium },
  { value: "box-w-small", name: "Small", img: small },
];

const Category = () => {
  const ref = useRef([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- State Management for Editing/Adding Items ---
  const [activeCategoryId, setActiveCategoryId] = useState(null); // ID of the column being affected
  const [isEditing, setIsEditing] = useState(false); // True if editing an existing item, false if adding new
  const [itemToEdit, setItemToEdit] = useState(null); // Stores the item object if in editing mode

  const [formData, setFormData] = useState({
    label: "",
    description: "",
    link: "",
    bg: "background-black", // Default background
    heightClass: "", // Default height
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(); // Ref for file input to clear it if needed

  // --- Scroll Functions for Category Slider ---
  const scrollLeft = () => {
    document
      .getElementById("shopByCategorySlider")
      .scrollBy({ left: -900, behavior: "smooth" });
  };

  const scrollRight = () => {
    document
      .getElementById("shopByCategorySlider")
      .scrollBy({ left: 900, behavior: "smooth" });
  };

  // --- Intersection Observer for Animations ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 }
    );
    ref.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]); // Rerun on categories change to observe new elements

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Run once on component mount

  // --- Modal Open/Close Logic ---
  const openModal = (item = null, category = null) => {
    // If an item and category are passed, it's an edit operation
    if (item && category) {
      setIsEditing(true);
      setItemToEdit(item);
      setActiveCategoryId(category._id);
      setFormData({
        label: item.label || "",
        description: item.description || "",
        link: item.link || "",
        bg: item.bg || "background-black",
        heightClass: item.heightClass || "",
        image: null, // Image input is cleared on edit; user must re-upload
      });
      setImagePreview(item.imageUrl || null); // Show current image preview
    } else if (category) {
      // If only a category is passed, it's an add new item operation
      setIsEditing(false);
      setItemToEdit(null);
      setActiveCategoryId(category._id);
      setFormData({
        // Reset form for new item
        label: "",
        description: "",
        link: "",
        bg: "background-black",
        heightClass: "",
        image: null,
      });
      setImagePreview(null); // Clear image preview for new item
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    // Logic to ask user to discard new column if no item was added
    const activeCategory = categories.find((c) => c._id === activeCategoryId);
    if (!isEditing && activeCategory && activeCategory.items.length === 0) {
      if (
        window.confirm(
          "You haven't added an item to this new column. Do you want to discard the column?"
        )
      ) {
        handleDelete(activeCategoryId, true); // true indicates deleting the whole column
      }
    }
    setModalOpen(false);
    // Reset all modal-related states
    setIsEditing(false);
    setActiveCategoryId(null);
    setItemToEdit(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
    setFormData({
      // Reset form data to initial empty state
      label: "",
      description: "",
      link: "",
      bg: "background-black",
      heightClass: "h-50",
      image: null,
    });
  };

  // --- Handle Column Style Selection (New Column Creation) ---
  const handleStyleSelect = async (columnClassValue) => {
    try {
      const response = await CreatCategoriesStyle(columnClassValue);
      const newCategory = response.data;
      setCategories((prev) => [...prev, newCategory]);
      setStyleModalOpen(false);
      // Immediately open the modal to add the first item to this new column
      openModal(null, newCategory);
    } catch (err) {
      toast.error(
        "Failed to create category style: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // --- Handle Deletion (Column or Item) ---
  const handleDelete = async (idToDelete, isColumn = false, categoryId = null) => {
    if (isColumn) {
      if (
        !window.confirm(
          "Are you sure you want to delete this entire column and all its items?"
        )
      )
        return;

      const deletedColumn = categories.find((c) => c._id === idToDelete);
      if (!deletedColumn) return;

      // Optimistically remove column from UI
      setCategories((prev) => prev.filter((c) => c._id !== idToDelete));

      let undoCalled = false;
      const undo = () => {
        undoCalled = true;
        setCategories((prev) => [...prev, deletedColumn].sort((a, b) => a._id.localeCompare(b._id))); // Re-add and re-sort
      };

      showUndoToast(`Column "${deletedColumn.columnClass}" deleted`, undo);

      setTimeout(async () => {
        if (!undoCalled) {
          try {
            await deleteCategory(idToDelete);
            // No need to update state again if successful server deletion
          } catch (err) {
            toast.error("Failed to delete column on server.");
            console.error(err);
            // Revert UI if server deletion fails
            setCategories((prev) => [...prev, deletedColumn].sort((a, b) => a._id.localeCompare(b._id)));
          }
        }
      }, 5000); // 5 seconds for undo
    } else {
      // Deleting a single item with undo functionality
      if (!window.confirm("Are you sure you want to delete this item?")) return;

      const categoryToUpdate = categories.find((cat) => cat._id === categoryId);
      if (!categoryToUpdate) return;

      const deletedItem = categoryToUpdate.items.find((item) => item._id === idToDelete);

      if (!deletedItem) return;

      // Optimistically remove item from UI
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId
            ? {
                ...cat,
                items: cat.items.filter((item) => item._id !== idToDelete),
              }
            : cat
        )
      );

      let undoCalled = false;
      const undo = () => {
        undoCalled = true;
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === categoryId
              ? {
                  ...cat,
                  // Re-insert the deleted item. Consider order if important.
                  // For simplicity, adding to end.
                  items: [...cat.items, deletedItem],
                }
              : cat
          )
        );
      };

      showUndoToast("Item deleted", undo);

      setTimeout(async () => {
        if (!undoCalled) {
          try {
            await deleteCategoryItem(categoryId, idToDelete);
            // No need to setCategories again here as it's already removed optimistically
          } catch (err) {
            toast.error("Failed to delete item on server.");
            console.error(err);
            // Revert UI if server deletion fails
            setCategories((prev) =>
              prev.map((cat) =>
                cat._id === categoryId
                  ? {
                      ...cat,
                      items: [...cat.items, deletedItem],
                    }
                  : cat
              )
            );
          }
        }
      }, 5000); // 5 seconds for undo
    }
  };


  // --- Handle Form Submission (Create or Update Item) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCategoryId) {
      toast.error("No active category selected. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);

    const formPayload = new FormData();
    formPayload.append("label", formData.label);
    formPayload.append("description", formData.description);
    formPayload.append("link", formData.link);
    formPayload.append("bg", formData.bg);
    formPayload.append("heightClass", formData.heightClass);

    if (formData.image) {
      formPayload.append("image", formData.image);
    }

    try {
      let res;
      if (isEditing && itemToEdit) {
        // Call the new update API for existing items
        res = await updateCategoryItem(activeCategoryId, itemToEdit._id, formPayload);
        toast.success("Category item updated successfully!");
      } else {
        // Call the existing create API for new items (in an existing column)
        formPayload.append("id", activeCategoryId); // Pass category ID to backend
        res = await createCategory(formPayload);
        toast.success("Category item created successfully!");
      }

      console.log("API response:", res.data);

      // Update the state with the returned category data (which includes the updated/new item)
      setCategories((prev) =>
        prev.map((c) => (c._id === res.data._id ? res.data : c))
      );
      closeModal();
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error(err.response?.data?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle Form Input Changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle Image File Selection ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, image: null });
      setImagePreview(null);
    }
  };

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div
          className="spinner-border text-warning"
          role="status"
          style={{ width: "2rem", height: "2rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3 text-muted">Fetching Category Data...</span>
      </div>
    );
  if (error) return <p className="text-center text-danger p-5">{error}</p>;

  return (
    <>
      <div className="mt-5 d-flex justify-content-between align-items-center w-100 ">
        <div>
          <h1
            className="my-3 fade-slide-up d-inline"
            ref={(el) => (ref.current[0] = el)}
          >
            Shop By Category
          </h1>
          <p
            className="my-3 fade-slide-up"
            ref={(el) => (ref.current[1] = el)}
            style={{ transitionDelay: "0.2s" }}
          >
            Create, update, or manage your categories.
          </p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setStyleModalOpen(true)}>
            <i className="bi bi-plus-lg me-2"></i> Add Category Column
          </button>
        </div>
      </div>

      <div className="shopByCategoryWrapper user-select-none">
        <button className="shop-by-cat-nav slide-back" onClick={scrollLeft}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div id="shopByCategorySlider">
          {categories.map((col) => (
            <div className={`category-card-col ${col.columnClass}`} key={col._id}>
              {col.items.map((item) => (
                <div
                  key={item._id} // Use item._id for unique key
                  className={`category-card ${item.bg} ${item.heightClass}`}
                  style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="category-name">{item.label}</div>
                  <div className="category-actions text-end bg-dark p-1 bg-opacity-25">
                    <button
                      className="btn btn-sm btn-warning mx-1 mt-1"
                      onClick={() => openModal(item, col)}
                      style={{ color: "white" }}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger mx-1 mt-1"
                      onClick={() => handleDelete(item._id, false, col._id)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
              {/* Button to add more items to an existing column */}
              <button className="btn btn-light w-100 mt-2" onClick={() => openModal(null, col)}>
                <i className="bi bi-plus"></i> Add Item
              </button>
              <button
                className="btn btn-sm btn-danger mx-1 mt-1"
                onClick={() => handleDelete(col._id, true)}
              >
                <i className="bi bi-trash-fill"></i> Delete Column
              </button>
            </div>
          ))}
        </div>
        <button className="shop-by-cat-nav slide-next" onClick={scrollRight}>
          <i className="bi bi-arrow-right"></i>
        </button>
      </div>

      {/* Modal for Selecting Column Style */}
      <Modal
        isOpen={styleModalOpen}
        onRequestClose={() => setStyleModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h6>Step 1</h6>
        <h3>Select a Column Style</h3>
        <div className="d-flex gap-3 flex-wrap justify-content-center">
          {column.map((style) => (
            <button
              key={style.value}
              onClick={() => handleStyleSelect(style.value)}
              className="btn btn-outline-primary d-flex flex-column align-items-center p-3"
            >
              {style.name}
              <img src={style.img} alt={style.name} className="img-style mt-2" />
            </button>
          ))}
        </div>
      </Modal>

      {/* Modal for Adding/Editing Category Items */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>{isEditing ? "Edit Category Item" : "Add New Category Item"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Name<span className="text-danger small ms-1">*</span>
                </label>
                <input
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Link / URL<span className="text-danger small ms-1">*</span>
                </label>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="/shop/product-name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Description<span className="text-danger small ms-1">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Background Class<span className="text-danger small ms-1">*</span>
                </label>
                <select
                  name="bg"
                  value={formData.bg}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="" disabled>
                    Select Background
                  </option>
                  {bgOptions.map(({ value, color }) => (
                    <option key={value} value={value} style={{ backgroundColor: color, color: "white" }}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Height Class<span className="text-danger small ms-1">*</span>
                </label>
                <select
                  name="heightClass"
                  value={formData.heightClass}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="h-50">50% Height</option>
                  <option value="card-h-33">33% Height</option>
                  <option value="card-h-66">66% Height</option>
                  <option value="h-30">30% Height</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="form-control"
                />
              </div>
              {imagePreview && (
                <div className="mt-2 text-center">
                  <p className="mb-1">Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions mt-4 text-end">
            <button type="button" onClick={closeModal} className="btn btn-secondary me-2">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Category;