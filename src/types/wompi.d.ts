// types/wompi.d.ts
interface Wompi {
    renderButton: (options: {
      publicKey: string;
      reference: string;
      amountInCents: number;
      currency: string;
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
      onClose: () => void;
    }) => void;
  }
  
  interface Window {
    Wompi: Wompi;
  }