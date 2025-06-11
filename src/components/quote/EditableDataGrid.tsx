import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  required?: boolean;
  width?: string;
}

interface EditableDataGridProps {
  title: string;
  data: any[];
  columns: Column[];
  onAdd: (item: any) => Promise<void>;
  onUpdate: (id: string, item: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  defaultNewItem: any;
  loading?: boolean;
}

const EditableDataGrid: React.FC<EditableDataGridProps> = ({
  title,
  data,
  columns,
  onAdd,
  onUpdate,
  onDelete,
  defaultNewItem,
  loading = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState(defaultNewItem);

  useEffect(() => {
    setNewItem(defaultNewItem);
  }, [defaultNewItem]);

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingItem({});
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(editingId!, editingItem);
      setEditingId(null);
      setEditingItem({});
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewItem(defaultNewItem);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItem(defaultNewItem);
  };

  const handleSaveAdd = async () => {
    try {
      await onAdd(newItem);
      setIsAdding(false);
      setNewItem(defaultNewItem);
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await onDelete(id);
        toast.success('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const renderCell = (column: Column, value: any, isEditing: boolean, onChange?: (value: any) => void) => {
    if (!isEditing) {
      return <span>{value || '-'}</span>;
    }

    switch (column.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            className="w-full"
            step="0.01"
          />
        );
      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full"
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {!isAdding && (
            <Button onClick={handleStartAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} style={{ width: column.width }}>
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add Row */}
              {isAdding && (
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(
                        column,
                        newItem[column.key],
                        true,
                        (value) => setNewItem({ ...newItem, [column.key]: value })
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSaveAdd}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelAdd}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Data Rows */}
              {data.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCell(
                        column,
                        editingId === item.id ? editingItem[column.key] : item[column.key],
                        editingId === item.id,
                        (value) => setEditingItem({ ...editingItem, [column.key]: value })
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {editingId === item.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty State */}
              {data.length === 0 && !isAdding && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                    No items added yet. Click "Add Row" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableDataGrid;
