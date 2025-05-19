import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../api/productApi";
import { getCategories } from "../api/categoryApi.js";
import { useNavigate } from "react-router-dom";
import { showUndoToast } from "../utils/toast.jsx";
import toast from 'react-hot-toast';
import "bootstrap-icons/font/bootstrap-icons.css";
import ModernTable from "../components/ModernTable/ModernTable.jsx"; // ✅ Import ModernTable

const itemsPerPage = 5;

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const getCategoryName = (id) => {
    const category = categories.find(c => c._id === id);
    return category ? category.name : "Unknown";
  };

  const uniqueCategoryNames = ["All", ...new Set(products.map(p => getCategoryName(p.category)).filter(name => name !== "Unknown"))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productid.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = getCategoryName(product.categoryId);
    const matchesCategory = categoryFilter === "All" || categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    const itemToDelete = products.find(p => p._id === id);
    if (!itemToDelete) return;

    if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"?`)) return;

    const originalIndex = products.findIndex(p => p._id === id);

    setProducts(prev => prev.filter(p => p._id !== id));

    let undone = false;

    showUndoToast(
      `Product "${itemToDelete.name}" deleted`,
      () => {
        undone = true;
        setProducts(prev => {
          const newProducts = [...prev];
          newProducts.splice(originalIndex, 0, itemToDelete);
          return newProducts;
        });
      }
    );

    setTimeout(async () => {
      if (!undone) {
        try {
          await deleteProduct(id);
        } catch (err) {
          toast.error('Failed to delete product on server');
          setProducts(prev => {
            const newProducts = [...prev];
            newProducts.splice(originalIndex, 0, itemToDelete);
            return newProducts;
          });
          console.error(err);
        }
      }
    }, 5000);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const headers = ["Product ID", "Category", "Name", "Karat", "Weight", "Actions"];
  const rows = currentProducts.map((p) => [
    p.productid,
    getCategoryName(p.categoryId),
    p.name,
    p.karat,
    `${p.weight}g`,
    (
      <div className="d-flex justify-content-center align-items-center">
        <button
          className="btn btn-sm btn-warning me-2"
          style={{ color: "white" }}
          onClick={() => navigate(`/edit-product/${p._id}`)}
        >
          <i className="bi bi-pencil-fill"></i> Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(p._id)}
        >
          <i className="bi bi-trash-fill"></i> Delete
        </button>
      </div>
    )
  ]);

  return (
    <div className="container my-4 bg-white p-4 rounded-4 shadow">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold responsive-heading">Product List</h2>
        <button className="btn btn-primary btn-sm btn-sm-none" onClick={() => navigate(`/add-product`)}>
          + Add Product
        </button>
      </div>

      <div className="mb-3 row">
        <div className="col-md-6 mb-2">
          <div className="input-group rounded-pill overflow-hidden">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Product ID"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        </div>

        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {uniqueCategoryNames.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading products...</span>
        </div>
      ) : currentProducts.length === 0 ? (
        <p>No products {searchTerm ? `found with Product ID: ${searchTerm}` : 'available'}.</p>
      ) : (
        <>
          <ModernTable headers={headers} rows={rows} /> {/* ✅ Use ModernTable */}

          <nav aria-label="Product pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {pageNumbers.map((number) => (
                <li
                  key={number}
                  className={`page-item ${currentPage === number ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => paginate(number)}>
                    {number}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === pageNumbers.length ? "disabled" : ""}`}
              >
                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
