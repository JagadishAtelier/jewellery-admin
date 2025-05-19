import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../api/categoryApi.js';
import { showUndoToast } from "../../utils/toast.jsx";
import ModernTable from '../../components/ModernTable/ModernTable.jsx'; // adjust path if different

Modal.setAppElement('#root');

const bgClassOptions = [
    { value: 'background-black', color: '#000000' },
    { value: 'background-pink', color: '#FF66B2' },
    { value: 'background-blue', color: '#007BFF' },
];

const ShopByCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bgClass: '',
        heightClass: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (cat = null) => {
        setEditCat(cat);
        setFormData({
            name: cat?.name || '',
            description: cat?.description || '',
            bgClass: cat?.bgClass || '',
            heightClass: cat?.heightClass || '',
            image: null,
        });
        setImagePreview(cat?.imageUrl || null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setEditCat(null);
        setModalOpen(false);
        setImagePreview(null);
    };

    const handleDelete = (id) => {
        const itemToDelete = categories.find(c => c._id === id);
        if (!itemToDelete) return;

        if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"?`)) return;

        setCategories(prev => prev.filter(c => c._id !== id));
        let undone = false;

        showUndoToast(
            `Category "${itemToDelete.name}" deleted`,
            () => {
                undone = true;
                setCategories(prev => [...prev, itemToDelete]);
            }
        );

        setTimeout(async () => {
            if (!undone) {
                try {
                    await deleteCategory(id);
                } catch (err) {
                    toast.error('Failed to delete on server');
                    setCategories(prev => [...prev, itemToDelete]);
                    console.error(err);
                }
            }
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const form = new FormData();
        form.append('name', formData.name);
        form.append('description', formData.description);
        form.append('bgClass', formData.bgClass);
        form.append('heightClass', formData.heightClass);
        if (fileInputRef.current.files[0]) {
            form.append('image', fileInputRef.current.files[0]);
        }

        try {
            let res;
            if (editCat) {
                res = await updateCategory(editCat._id, form);
                setCategories(prev =>
                    prev.map(c => (c._id === editCat._id ? res.data : c))
                );
            } else {
                res = await createCategory(form);
                setCategories(prev => [...prev, res.data]);
            }
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

    const headers = ['Name', 'Description', 'Background', 'Image', 'Actions'];
    const rows = categories.map(cat => [
        cat.name,
        cat.description,
        <span
            style={{
                backgroundColor: bgClassOptions.find(b => b.value === cat.bgClass)?.color,
                padding: '8px',
                borderRadius: '4px',
                color: 'white',
            }}
        >
            {cat.bgClass}
        </span>,
        cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} width="60" style={{ borderRadius: "4px" }} /> : '',
        <div className="d-flex justify-content-center align-items-center">
            <button
                className="btn btn-sm btn-warning me-2"
                style={{ color: "white" }}
                onClick={() => openModal(cat)}
            >
                <i className="bi bi-pencil-fill"></i> Edit
            </button>
            <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(cat._id)}
            >
                <i className="bi bi-trash-fill"></i> Delete
            </button>
        </div>
    ]);

    if (loading) return <p>Loading categories…</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container my-4 bg-white p-4 rounded-4 shadow">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className='fw-bold me-sm-2 responsive-heading'>Categories</h2>
                <button onClick={() => openModal()} className="btn btn-primary btn-sm btn-sm-none">
                    + Add Category
                </button>
            </div>

            <ModernTable headers={headers} rows={rows} />

            <Modal
                isOpen={modalOpen}
                onRequestClose={closeModal}
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h3>{editCat ? 'Edit Category' : 'New Category'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label>Name<span className="text-danger small ms-1">*Required</span></label>
                                <input
                                    name="name"
                                    value={formData.name}
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
                                    name="bgClass"
                                    value={formData.bgClass}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="" disabled>Select Background</option>
                                    {bgClassOptions.map(({ value, color }) => (
                                        <option key={value} value={value} style={{ backgroundColor: color, color: "white" }}>
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
                        <button type="button" onClick={closeModal} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : editCat ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ShopByCategoryManager;
