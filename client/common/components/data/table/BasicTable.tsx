'use client';

import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';

import TextSkeleton from '@client-common/components/feedback/skeleton/TextSkeleton';

export interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
}

interface BasicTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  pageIndex?: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  totalCount?: number;
}

function BasicTable<T>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  pageIndex = 0,
  pageSizeOptions = [10, 25, 100],
  onPageChange,
  onPageSizeChange,
  totalCount = data.length,
}: BasicTableProps<T>) {
  const [page, setPage] = useState(pageIndex);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  React.useEffect(() => {
    setPage(pageIndex);
  }, [pageIndex]);

  React.useEffect(() => {
    setRowsPerPage(pageSize);
  }, [pageSize]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    onPageChange && onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = +event.target.value;
    setRowsPerPage(newSize);
    setPage(0);
    onPageSizeChange && onPageSizeChange(newSize);
  };

  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={String(column.id)} align={column.align}>
                      <TextSkeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
              : data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={rowIndex}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={String(column.id)} align={column.align}>
                        {column.format ? column.format(value) : (value as React.ReactNode)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={pageSizeOptions}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default BasicTable;
