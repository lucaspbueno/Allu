import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Search from "./pages/Search";
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/search" element={<Search />} />
        <Route path="/produto/:id" element={<ProductPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
