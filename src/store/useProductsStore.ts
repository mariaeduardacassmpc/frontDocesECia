import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { productApi } from '@/services/productApi';

function mapProduct(p: unknown): Product {
  const product = p as Record<string, unknown>;
  return {
    id: Number(product.ProdutoId ?? product.ProductId ?? product.id ?? product.Id),
    active: product.Active ?? product.active ?? true,
    name: String(product.Name ?? product.Nome ?? product.name ?? 'Sem nome'),
    category: String(product.Category ?? product.Categoria ?? product.category ?? 'Sem categoria'),
    price: Number(product.SalePrice ?? product.PrecoDeVenda ?? product.price ?? 0),
    cost: Number(product.PurchasePrice ?? product.PrecoDeCompra ?? product.cost ?? 0),
    stock: Number(product.Stock ?? product.Estoque ?? product.stock ?? 0),
    description: String(product.Description ?? product.Descricao ?? product.description ?? 'Sem descrição'),
    image: String(product.Image ?? product.Imagem ?? product.image ?? ''),
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
