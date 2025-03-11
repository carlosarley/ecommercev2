export interface TransactionData {
    amountInCents: number;
    customerEmail: string;
    customerData: {
      full_name: string;
      email: string;
      phone_number: string;
      legal_id: string;
      legal_id_type: string;
    };
  }
  
  export interface TransactionResponse {
    success: boolean;
    transactionId?: string;
    reference?: string;
    error?: string;
  }