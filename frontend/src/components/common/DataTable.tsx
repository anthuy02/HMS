import React, { useState } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Tìm kiếm nhanh...',
  searchFilter,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredData = query && searchFilter ? data.filter((item) => searchFilter(item, query)) : data;
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            width: '280px',
            fontSize: '14px',
          }}
        />
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Tổng cộng: <b>{filteredData.length}</b> bản ghi
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((c) => (
                <th key={c.key} style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', width: c.width }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy dữ liệu phù hợp.
                </td>
              </tr>
            ) : (
              pagedData.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '12px 16px' }}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: page === 1 ? '#f1f5f9' : '#fff' }}
          >
            Trang trước
          </button>
          <span style={{ alignSelf: 'center', fontSize: '13px', color: '#64748b' }}>
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: page === totalPages ? '#f1f5f9' : '#fff' }}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
