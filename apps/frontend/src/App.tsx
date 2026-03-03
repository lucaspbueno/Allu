import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Search from "./pages/Search";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/search" element={<Search />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Layout>
  );
}

export default App;
