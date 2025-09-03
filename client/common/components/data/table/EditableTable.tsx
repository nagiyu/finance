'use client';

import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { KeyboardArrowUp, KeyboardArrowDown, Edit, Delete, Save, Cancel } from '@mui/icons-material';

import TextSkeleton from '../../feedback/skeleton/TextSkeleton';
import ContainedButton from '../../inputs/Buttons/ContainedButton';

export interface EditableColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  editable?: boolean;
  format?: (value: any) => React.ReactNode;
  editFormat?: (value: any) => string;
  parseValue?: (value: string) => any;
}

export interface ActionButtonConfig {
  showModify?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

interface EditableTableProps<T extends { id: string }> {
  columns: EditableColumn<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  pageIndex?: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  totalCount?: number;
  enableSorting?: boolean;
  actionButtons?: ActionButtonConfig;
  onModify?: (modifiedData: T[]) => Promise<void>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

interface CellEdit {
  rowId: string;
  columnId: string;
  value: string;
}

interface RowState<T> {
  data: T;
  originalIndex: number;
  currentIndex: number;
  hasChanges: boolean;
}

function EditableTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  pageSize = 10,
  pageIndex = 0,
  pageSizeOptions = [10, 25, 100],
  onPageChange,
  onPageSizeChange,
  totalCount = data.length,
  enableSorting = true,
  actionButtons = { showModify: true, showEdit: true, showDelete: true },
  onModify,
  onEdit,
  onDelete,
}: EditableTableProps<T>) {
  const [page, setPage] = useState(pageIndex);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  
  // State for managing editable data
  const [rowStates, setRowStates] = useState<RowState<T>[]>([]);
  const [editingCell, setEditingCell] = useState<CellEdit | null>(null);
  const [hasAnyChanges, setHasAnyChanges] = useState(false);

  // Initialize row states when data changes
  useEffect(() => {
    const initialRowStates: RowState<T>[] = data.map((item, index) => ({
      data: { ...item },
      originalIndex: index,
      currentIndex: index,
      hasChanges: false,
    }));
    setRowStates(initialRowStates);
    setHasAnyChanges(false);
    setEditingCell(null);
  }, [data]);

  // Update hasAnyChanges when rowStates change
  useEffect(() => {
    const anyChanges = rowStates.some(row => row.hasChanges || row.originalIndex !== row.currentIndex);
    setHasAnyChanges(anyChanges);
  }, [rowStates]);

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

  const handleCellEdit = (rowId: string, columnId: string, value: any) => {
    const column = columns.find(col => col.id === columnId);
    const displayValue = column?.editFormat ? column.editFormat(value) : String(value || '');
    
    setEditingCell({
      rowId,
      columnId,
      value: displayValue,
    });
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const { rowId, columnId, value } = editingCell;
    const column = columns.find(col => col.id === columnId);
    const parsedValue = column?.parseValue ? column.parseValue(value) : value;

    setRowStates(prev => prev.map(rowState => {
      if (rowState.data.id === rowId) {
        const updatedData = { ...rowState.data, [columnId]: parsedValue };
        const isChanged = JSON.stringify(updatedData) !== JSON.stringify(data.find(d => d.id === rowId));
        
        return {
          ...rowState,
          data: updatedData,
          hasChanges: isChanged,
        };
      }
      return rowState;
    }));

    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setRowStates(prev => {
      const newRowStates = [...prev];
      const [movedRow] = newRowStates.splice(fromIndex, 1);
      newRowStates.splice(toIndex, 0, movedRow);
      
      // Update current indices
      return newRowStates.map((rowState, index) => ({
        ...rowState,
        currentIndex: index,
      }));
    });
  };

  const handleMoveUp = (currentIndex: number) => {
    if (currentIndex > 0) {
      moveRow(currentIndex, currentIndex - 1);
    }
  };

  const handleMoveDown = (currentIndex: number) => {
    if (currentIndex < rowStates.length - 1) {
      moveRow(currentIndex, currentIndex + 1);
    }
  };

  const handleModify = async () => {
    if (!onModify || !hasAnyChanges) return;
    
    const modifiedData = rowStates.map(rowState => rowState.data);
    await onModify(modifiedData);
    
    // Reset change tracking after successful modify
    setRowStates(prev => prev.map((rowState, index) => ({
      ...rowState,
      originalIndex: index,
      hasChanges: false,
    })));
    setHasAnyChanges(false);
  };

  const handleCancel = () => {
    // Reset all changes
    const resetRowStates: RowState<T>[] = data.map((item, index) => ({
      data: { ...item },
      originalIndex: index,
      currentIndex: index,
      hasChanges: false,
    }));
    setRowStates(resetRowStates);
    setHasAnyChanges(false);
    setEditingCell(null);
  };

  const renderCell = (rowState: RowState<T>, column: EditableColumn<T>, rowIndex: number) => {
    const value = rowState.data[column.id];
    const isEditing = editingCell?.rowId === rowState.data.id && editingCell?.columnId === String(column.id);

    if (isEditing && column.editable) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TextField
            value={editingCell.value}
            onChange={(e) => setEditingCell(prev => prev ? { ...prev, value: e.target.value } : null)}
            size="small"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellSave();
              } else if (e.key === 'Escape') {
                handleCellCancel();
              }
            }}
          />
          <IconButton size="small" onClick={handleCellSave} color="primary">
            <Save />
          </IconButton>
          <IconButton size="small" onClick={handleCellCancel}>
            <Cancel />
          </IconButton>
        </div>
      );
    }

    const displayValue = column.format ? column.format(value) : (value as React.ReactNode);

    if (column.editable) {
      return (
        <div 
          style={{ cursor: 'pointer', minHeight: 24 }}
          onClick={() => handleCellEdit(rowState.data.id, String(column.id), value)}
        >
          {displayValue}
        </div>
      );
    }

    return displayValue;
  };

  const renderSortColumn = (rowIndex: number) => {
    if (!enableSorting) return null;

    return (
      <TableCell align="center" style={{ minWidth: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleMoveUp(rowIndex)}
            disabled={rowIndex === 0}
          >
            <KeyboardArrowUp />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleMoveDown(rowIndex)}
            disabled={rowIndex === rowStates.length - 1}
          >
            <KeyboardArrowDown />
          </IconButton>
        </div>
      </TableCell>
    );
  };

  const renderActionColumn = (rowState: RowState<T>) => {
    const { showModify, showEdit, showDelete } = actionButtons;
    
    if (!showModify && !showEdit && !showDelete) return null;

    return (
      <TableCell align="center" style={{ minWidth: 120 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {showEdit && (
            <IconButton size="small" onClick={() => onEdit?.(rowState.data)}>
              <Edit />
            </IconButton>
          )}
          {showDelete && (
            <IconButton size="small" onClick={() => onDelete?.(rowState.data)}>
              <Delete />
            </IconButton>
          )}
        </div>
      </TableCell>
    );
  };

  const paginatedRows = rowStates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper>
      {hasAnyChanges && (
        <div style={{ padding: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <ContainedButton
            label="Modify"
            onClick={handleModify}
            disabled={!hasAnyChanges || !onModify}
          />
          <ContainedButton
            label="Cancel"
            onClick={handleCancel}
          />
        </div>
      )}
      
      <TableContainer>
        <Table stickyHeader aria-label="editable table">
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
              {enableSorting && (
                <TableCell align="center" style={{ minWidth: 80 }}>
                  Sort
                </TableCell>
              )}
              {(actionButtons.showModify || actionButtons.showEdit || actionButtons.showDelete) && (
                <TableCell align="center" style={{ minWidth: 120 }}>
                  Action
                </TableCell>
              )}
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
                  {enableSorting && (
                    <TableCell align="center">
                      <TextSkeleton />
                    </TableCell>
                  )}
                  {(actionButtons.showModify || actionButtons.showEdit || actionButtons.showDelete) && (
                    <TableCell align="center">
                      <TextSkeleton />
                    </TableCell>
                  )}
                </TableRow>
              ))
              : paginatedRows.map((rowState, displayIndex) => {
                const actualIndex = page * rowsPerPage + displayIndex;
                return (
                  <TableRow 
                    hover 
                    role="checkbox" 
                    tabIndex={-1} 
                    key={rowState.data.id}
                    style={{ 
                      backgroundColor: rowState.hasChanges ? '#fff3cd' : 'inherit',
                      borderLeft: rowState.hasChanges ? '4px solid #ffc107' : 'none'
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.id)} align={column.align}>
                        {renderCell(rowState, column, actualIndex)}
                      </TableCell>
                    ))}
                    {renderSortColumn(actualIndex)}
                    {renderActionColumn(rowState)}
                  </TableRow>
                );
              })}
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

export default EditableTable;