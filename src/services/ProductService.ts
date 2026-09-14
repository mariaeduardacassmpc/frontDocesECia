import { Product } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:44309';

export type ProductForm = Omit<Product, "id">;

type SaveProductParams = {
  form: ProductForm;
  editing: Product | null;
  addProduct: (data: ProductForm) => Promise<any>;
  updateProduct: (data: Product) => Promise<any>;
};

type DeleteProductParams = {
  id: number | undefined;
  deleteProduct: (id: number) => Promise<any>;
};

export function validateProduct(form: ProductForm): string | null {
  if (!form.name.trim()) return "Nome obrigatório";
  return null;
}

export function getProductForm(product: Product): ProductForm {
  return {
    active: product.active !== false,
    name: product.name,
    category: product.category,
    price: product.price,
    cost: product.cost,
    description: product.description,
    stock: product.stock,
    image: product.image || "",
  };
}

export function getProductImageSrc(image?: string): string {
  if (!image) return "";
  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `${API_URL}${image}`;
  return image;
}

export function cropProductImage(
  imageSrc: string,
  zoom: number,
  positionX = 50,
  positionY = 50,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 800;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight) * zoom;
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Não foi possível ajustar a imagem"));
        return;
      }

      const horizontalOffset = (size - width) * (positionX / 100);
      const verticalOffset = (size - height) * (positionY / 100);
      context.drawImage(image, horizontalOffset, verticalOffset, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
    image.src = imageSrc;
  });
}

export async function saveProduct({
  form,
  editing,
  addProduct,
  updateProduct,
}: SaveProductParams) {
  if (editing?.id) {
    return await updateProduct({
      id: editing.id,
      ...form,
    });
  }

  return await addProduct(form);
}

export async function removeProduct({ id, deleteProduct }: DeleteProductParams) {
  if (!id) {
    throw new Error("ID inválido");
  }

  await deleteProduct(id);
}
