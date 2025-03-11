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