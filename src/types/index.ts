export interface WinfaktAppData {
  accessToken: string;
  bookyear: number;
  dossier: number;
  userId: number;
  socketId: string;
}

export interface AWSFile {
  ID: number;
  Name: string;
  Size: number;
  ContentType: string;
  Token: string;
  Path: string;
}

export interface Sale {
  ID: number;
  FriendlyID: string;
  ComputedFriendlyID: string;
  Date: string;
  ContactID: number;
  ContactName: string;
}

export interface SaleRow {
  ID: number;
  SaleID: number;
  BookYear: number;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  ProductID: number;
  ProductSku: string;
  CoverImageOverrideFileID: number;
  CoverImageOverrideFile: AWSFile | null;
  Sale: Sale | null;
}

export interface SaleRowsResponse {
  data: SaleRow[];
  count: number;
}
