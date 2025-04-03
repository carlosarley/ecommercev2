export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    description?: string;
    discount?: number;
    sales?: number;
    stock?: number;
    coupon?: string;
  }
  export interface BlogPost {
    id: string;
    title: string;
    slug: string; // URL amigable (por ejemplo, "armar-pc-gamer-colombia-2025")
    content: string; // Contenido del artículo en HTML o Markdown
    excerpt: string; // Resumen breve para la página de listado
    date: string; // Fecha de publicación (por ejemplo, "2025-04-01")
    author: string; // Nombre del autor
    image: string; // URL de la imagen principal
    keywords: string[]; // Palabras clave para SEO
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  export interface TransactionResponse {
    success: boolean;
    transactionId?: string;
    reference?: string;
    error?: string;
  }
  
  interface WompiWidget {
    new (config: {
      render: string;
      publicKey: string;
      currency: string;
      amountInCents: number;
      reference: string;
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
      onClose: () => void;
    }): {
      open: () => void;
    };
  }
  
  declare global {
    interface Window {
      WompiWidget: WompiWidget;
    }
  }