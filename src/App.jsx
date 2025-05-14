import React from "react";
import { Routes, Route } from "react-router-dom";
import SetGoldRatePage from "./pages/SetGoldRatePage";
import DashboardLayout from "./components/DashboardLayout";
import ProductListPage from "./pages/ProductListPage";
import EditProduct from "./pages/EditProduct";
import AddProduct from "./pages/AddProduct";
import ShopByCategoryManager from "./components/ShopByCategoryManager/ShopByCategoryManager";
import { Toaster } from "react-hot-toast";
import Aanalytics from "./pages/Aanalytics";

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{ duration: 5000, className: "custom-toast" }}
        reverseOrder={false}
      />
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Aanalytics />} />
          <Route path="category" element={<ShopByCategoryManager />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="allproduct" element={<ProductListPage />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="update-goldrate" element={<SetGoldRatePage/>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
