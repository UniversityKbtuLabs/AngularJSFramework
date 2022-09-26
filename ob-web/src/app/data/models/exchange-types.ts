export interface IExchange {
  id: number;
  mainCurrency: string;
  counterCurrency: string;
  pairName: string;
  clientCode: string;
  buyPrice: number;
  sellPrice: number;
  buyChange: number;
  sellChange: number;
}
