import { useEffect, useRef, useState } from "react";
import big from "../../assets/big-w-big.png";
import medium from "../../assets/box-w-medium.png";
import small from "../../assets/box-w-small.png";
import "./Catagories.css";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { showUndoToast } from "../../utils/toast.jsx";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  CreatCategoriesStyle,
} from "../../api/categoryApi.js";
import { getCategories } from "../../api/categoryApi";

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
  const [selectedColumnClass, setSelectedColumnClass] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    bg: "",
    heightClass: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
         setLoading(true);
      try {
        const res = await getCategories();
        setCategories(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to fetch categories");
      }finally {
      setLoading(false); // Stop loader
    }
    };

    fetchData();
  }, []);
  //new
  const openModal = (cat = null) => {
    setEditCat(cat);
    setFormData({
      label: cat?.label || "",
      description: cat?.description || "",
      bg: cat?.bg || "",
      heightClass: cat?.heightClass || "",
      image: null,
    });
    setImagePreview(cat?.imageUrl || null);
    setModalOpen(true);
  };

  const closeModal = async () => {
    if (!editCat && selectedColumnClass) {
    try {
      await deleteCategory(selectedColumnClass._id);
      setCategories((prev) => prev.filter(c => c._id !== selectedColumnClass));
    } catch (err) {
      console.error("Failed to delete column after cancel", err);
    }
  }
    setEditCat(null);
    setModalOpen(false);
    setImagePreview(null);
  };
  // column style
  const handleStyleSelect = async (columnClass) => {
    console.log(columnClass);
    
  try {
     const response = await CreatCategoriesStyle(columnClass);
    const newCategory = response.data;
    setCategories((prev) => [...prev, newCategory]);
    setSelectedColumnClass(newCategory);
    console.log('Created new column:', newCategory);
    setStyleModalOpen(false);
    openModal();
  } catch (err) {
    toast.error("Failed to create category style", err);
  }
};


  const handleDelete = (id) => {
    const itemToDelete = categories.find((c) => c._id === id);
    if (!itemToDelete) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${itemToDelete.label}"?`
      )
    )
      return;

    setCategories((prev) => prev.filter((c) => c._id !== id));
    let undone = false;

    showUndoToast(`Category "${itemToDelete.label}" deleted`, () => {
      undone = true;
      setCategories((prev) => [...prev, itemToDelete]);
    });

    setTimeout(async () => {
      if (!undone) {
        try {
          await deleteCategory(id);
        } catch (err) {
          toast.error("Failed to delete on server");
          setCategories((prev) => [...prev, itemToDelete]);
          console.error(err);
        }
      }
    }, 5000);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const form = new FormData();
  form.append("label", formData.label);
  form.append("description", formData.description);
  form.append("bg", formData.bg);
  form.append("heightClass", formData.heightClass);
  if (fileInputRef.current.files[0]) {
    form.append("image", fileInputRef.current.files[0]);
  }

  try {
    let res;
    if (editCat) {
      res = await updateCategory(editCat._id, form);
      setCategories((prev) =>
        prev.map((c) => (c._id === editCat._id ? res.data : c))
      );
    } else {
      form.append("columnClass", selectedColumnClass);
      res = await createCategory(form);
      setCategories((prev) => [...prev, res.data]);
    }
    closeModal();
  } catch (err) {
    console.error("Submission failed:", err);
    toast.error(
      err.response?.data?.message || "An error occurred during submission."
    );

    // Delete created column if this was a failed create
    if (!editCat && selectedColumnClass) {
      try {
        await deleteCategory(selectedColumnClass._id);
        setCategories((prev) =>
          prev.filter((c) => c._id !== selectedColumnClass)
        );
      } catch (deleteErr) {
        console.error("Failed to delete after failed submission:", deleteErr);
      }
      setSelectedColumnClass("");
    }
  } finally {
    setSubmitting(false);
  }
};


 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

//   const handleMove = async (catId, itemIndex, direction) => {
//     try {
//       const res = await axios.put(`/api/categories/${catId}/items/reorder`, {
//         from: itemIndex,
//         direction,
//       });
//       setCategories((prev) =>
//         prev.map((cat) => (cat._id === catId ? res.data : cat))
//       );
//     } catch (err) {
//       console.error("Reorder failed", err);
//     }
//   };
 if (loading) return (
        <div className="d-flex justify-content-center align-items-center py-3">
      <div className="spinner-border text-warning" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-2 small text-muted">Fetching Category Data...</span>
    </div>
    );
    if (error) return <p className="text-danger">{error}</p>;

  // new end
  return (
    <>
      <div className="mt-5 d-flex justify-content-between align-items-center w-100 ">
        <div>
          <h1
            className="my-3 fade-slide-up d-inline"
            ref={(el) => ref.current.push(el)}
          >
            Shop By Category
          </h1>
          <p
            className="my-3 fade-slide-up"
            ref={(el) => ref.current.push(el)}
            style={{ transitionDelay: "0.2s" }}
          >
            Edit a category
          </p>
        </div>
        <div>
          <button
            className="btn btn-small btn-primary"
            onClick={() => setStyleModalOpen(true)}
          >
            <i className="bi bi-plus"></i> Add Category
          </button>
        </div>
      </div>
      <div className="shopByCategoryWrapper user-select-none">
        <button className="shop-by-cat-nav slide-back" onClick={scrollLeft}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div id="shopByCategorySlider">
          {categories.map((col, index) => (
            <div className={`category-card-col ${col.columnClass}`} key={index}>
              {col.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`category-card ${item.bg} ${item.heightClass}`}
                  style={{
                    backgroundImage: `url(${item.imageUrl})`,
                    cursor: "pointer",
                  }}
                >
                  <div className="category-name">{item.label}</div>
                  <div className="category-actions text-end bg-dark p-1  bg-opacity-25">
                    <button className="btn btn-sm btn-warning mx-1 mt-1" onClick={() => openModal(item)} style={{color:'white'}}><i className="bi bi-pencil-fill"></i></button>
                    <button className="btn btn-sm btn-danger mx-1 mt-1" onClick={() => handleDelete(item._id)}><i className="bi bi-trash-fill"></i></button>
                    {/* <button className="btn btn-sm btn-light mx-1 mt-1" onClick={() => handleMove(col._id, idx, 'up')}><i className="bi bi-chevron-up"></i></button>
                    <button className="btn btn-sm btn-light mx-1 mt-1" onClick={() => handleMove(col._id, idx, 'down')}><i className="bi bi-chevron-down"></i></button> */}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button className="shop-by-cat-nav slide-next" onClick={scrollRight}>
          <i className="bi bi-arrow-right"></i>
        </button>
      </div>
      <Modal
        isOpen={styleModalOpen}
        onRequestClose={() => setStyleModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h6>Step 1</h6>
        <h3>Select a Category Style</h3>
        <div className="d-flex gap-2 flex-wrap">
          {column.map((style) => (
            <button
              key={style.value}
              onClick={() => handleStyleSelect(style.value)}
              className="btn btn-outline-primary d-flex flex-column"
            >
              {style.name}
              <img
                src={style.value}
                alt={style.value}
                srcSet={style.img}
                height={"300px"}
              />
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>{editCat ? "Edit Category" : "New Category"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label>
                  Name<span className="text-danger small ms-1">*Required</span>
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label>Background Class</label>
                <select
                  name="bg"
                  value={formData.bg}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                >
                  <option value="" disabled>
                    Select Background
                  </option>
                  {bgOptions.map(({ value, color }) => (
                    <option
                      key={value}
                      value={value}
                      style={{ backgroundColor: color, color: "white" }}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label>Height Class</label>
                <select
                  name="heightClass"
                  value={formData.heightClass}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="h-50">50% Height</option>
                  <option value="card-h-33">33% Height</option>
                  <option value="card-h-66">66% Height</option>
                  <option value="h-30">30% Height</option>
                </select>
              </div>

              <div className="mb-3">
                <label>Image</label>
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
                <div className="mt-2">
                  <p>Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    width="100"
                    style={{ borderRadius: "5px" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions mt-3">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : editCat ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Category;
