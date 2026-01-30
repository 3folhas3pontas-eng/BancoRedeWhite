
export enum View {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  PIX = 'PIX',
  EXTRATO = 'EXTRATO',
  PLANEJAR = 'PLANEJAR',
  SHOPPING = 'SHOPPING',
  CARTAO = 'CARTAO',
  LOJAS_ABERTAS = 'LOJAS_ABERTAS',
  TRANSFERIR = 'TRANSFERIR'
}

export interface Transaction {
  id: string;
  type: 'pix_enviado' | 'pix_recebido' | 'compra' | 'recompensa' | 'estorno';
  title: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  isNegative: boolean;
  cancelled?: boolean;
}

export interface PlayerData {
  nick: string;
  uuid: string;
  balance: number;
  creditLimit: number;
  currentInvoice: number;
}
