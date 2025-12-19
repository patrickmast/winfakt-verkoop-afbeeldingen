import type { SaleRowsResponse } from '../types';

const API_BASE = '/api';

function getHeaders(accessToken: string, bookyear: number, socketId: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: accessToken,
    Bookyear: String(bookyear),
    SocketID: socketId,
  };
}

export async function getSaleRowsWithImages(
  accessToken: string,
  bookyear: number,
  socketId: string
): Promise<SaleRowsResponse> {
  const preloads = encodeURIComponent(JSON.stringify(['CoverImageOverrideFile', 'Sale']));
  // Filter: only rows where CoverImageOverrideFileID > 0
  const filter = encodeURIComponent(JSON.stringify({ CoverImageOverrideFileID: { '>': 0 } }));
  const url = `${API_BASE}/sale-row?limit=10000&preloads=${preloads}&filter=${filter}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(accessToken, bookyear, socketId),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
