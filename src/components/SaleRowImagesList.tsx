import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Image, Loader2, AlertCircle } from 'lucide-react';
import type { WinfaktAppData, SaleRow } from '../types';
import { getSaleRowsWithImages } from '../services/api.service';

interface Props {
  appData: WinfaktAppData;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-BE');
}

export function SaleRowImagesList({ appData }: Props) {
  const [saleRows, setSaleRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadSaleRows() {
      try {
        setLoading(true);
        setError(null);
        const response = await getSaleRowsWithImages(
          appData.accessToken,
          appData.bookyear,
          appData.socketId
        );
        // Filter only rows with actual files
        const rowsWithImages = response.data.filter(
          (row) => row.CoverImageOverrideFile && row.CoverImageOverrideFile.ID > 0
        );
        setSaleRows(rowsWithImages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fout bij laden verkoopdocumenten');
      } finally {
        setLoading(false);
      }
    }

    loadSaleRows();
  }, [appData]);

  // Filter by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return saleRows;
    const term = searchTerm.toLowerCase();
    return saleRows.filter(
      (row) =>
        row.Sale?.ComputedFriendlyID?.toLowerCase().includes(term) ||
        row.Sale?.ContactName?.toLowerCase().includes(term) ||
        row.Description?.toLowerCase().includes(term) ||
        row.CoverImageOverrideFile?.Name?.toLowerCase().includes(term)
    );
  }, [saleRows, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalFiles = filteredRows.length;
    const totalSize = filteredRows.reduce(
      (sum, row) => sum + (row.CoverImageOverrideFile?.Size || 0),
      0
    );
    const uniqueSales = new Set(filteredRows.map((row) => row.SaleID)).size;
    return { totalFiles, totalSize, uniqueSales };
  }, [filteredRows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Verkoopdocumenten laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Verkoop Afbeeldingen</h1>
              <p className="text-sm text-gray-500">
                {totals.uniqueSales} documenten • {totals.totalFiles} afbeeldingen • {formatFileSize(totals.totalSize)} totaal
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoeken op document, klant of bestand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Omschrijving
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afbeelding
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grootte
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'Geen resultaten gevonden' : 'Geen detailregels met afbeeldingen gevonden'}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={`${row.SaleID}-${row.ID}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.Sale?.ComputedFriendlyID || row.SaleID}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(row.Sale?.Date || '')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {row.Sale?.ContactName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {row.Description || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {row.CoverImageOverrideFile?.Name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatFileSize(row.CoverImageOverrideFile?.Size || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {row.CoverImageOverrideFile?.Token && (
                          <a
                            href={`https://winfakt.app/files/${row.CoverImageOverrideFile.Token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Download afbeelding"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Version */}
        <div className="fixed bottom-2 right-4 text-xs text-gray-400 font-mono">
          v1
        </div>
      </div>
    </div>
  );
}
