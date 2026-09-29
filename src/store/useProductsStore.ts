import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { productApi } from '@/services/productApi';

function mapProduct(p: unknown): Product {
  const product = p as Record<string, any>;
  const rawCategory = product.category ?? product.Category;

  const categoryName =
    typeof rawCategory === 'string'
      ? rawCategory
      : rawCategory?.name ?? rawCategory?.Name ?? product.categoryName ?? product.CategoryName ?? '';

  return {
    id: Number(product.id ?? product.Id),
    active: (product.active ?? product.Active) !== false,
    name: String(product.name ?? product.Name ?? ''),
    categoryId: Number(product.categoryId ?? product.CategoryId ?? rawCategory?.id ?? rawCategory?.Id ?? 0),
    category: String(categoryName),
    salePrice: Number(product.salePrice ?? product.SalePrice ?? 0),
    purchasePrice: Number(product.purchasePrice ?? product.PurchasePrice ?? 0),
    description: String(product.description ?? product.Description ?? ''),
    image: String(product.image ?? product.Image ?? ''),
    stock: Number(product.stock ?? product.Stock ?? 0),
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productApi.getAll();
      setProducts(data.map(mapProduct));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleProduct = useCallback(async (id: number) => {
    try {
      const currentProduct = products.find((product) => product.id === id);
      if (!currentProduct) return;

      await productApi.update(id, {
        ...currentProduct,
        active: currentProduct.active !== false,
      });
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao inativar produto:', error);
      throw error;
    }
  }, [fetchProducts, products]);

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    try {
      await productApi.create({ ...p, image: p.image || '' });
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (p: Product) => {
    try {
      await productApi.update(p.id, { ...p, image: p.image || '' });
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await productApi.delete(id);
      await fetchProducts();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, addProduct, updateProduct, deleteProduct, toggleProduct, fetchProducts };
}
