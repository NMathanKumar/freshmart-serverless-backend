import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { freshmartSdk } from '../../../lib/sdk';
import { type Transfer, type TransferItem } from '@freshmart/api-sdk';

export function TransferForm() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [transfer, setTransfer] = useState<Partial<Transfer>>({
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    priority: 'MEDIUM',
    items: [],
  });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadMetadata();
    if (isEditing) {
      loadTransfer();
    }
  }, [id]);

  const loadMetadata = async () => {
    try {
      const [whRes, prRes] = await Promise.all([
        freshmartSdk.warehouse.listWarehouses(),
        freshmartSdk.inventory.listInventory(),
      ]);
      const mappedWarehouses = (whRes.data || []).map(w => ({
        warehouseId: w.warehouseId,
        warehouseName: w.warehouseName || w.warehouseCode || 'Unknown'
      }));
      setWarehouses(mappedWarehouses);
      setProducts(prRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTransfer = async () => {
    if (!id) return;
    try {
      const res = await freshmartSdk.inventory.getTransfer(id);
      setTransfer(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = () => {
    setTransfer({
      ...transfer,
      items: [
        ...(transfer.items || []),
        { productId: '', requestedQty: 1, reservedQty: 0, dispatchedQty: 0, receivedQty: 0, remainingQty: 1 } as TransferItem
      ]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(transfer.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setTransfer({ ...transfer, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...(transfer.items || [])];
    newItems.splice(index, 1);
    setTransfer({ ...transfer, items: newItems });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        // Assume update method exists or just submit
        await freshmartSdk.inventory.submitTransfer(id);
      } else {
        await freshmartSdk.inventory.createTransfer(transfer);
      }
      navigate({ to: '/transfers' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/transfers' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? `Edit Transfer ${transfer.transferNumber}` : 'Create Transfer'}
          </h1>
        </div>
        <Button 
          className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          onClick={handleSave}
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? 'Submit Transfer' : 'Save Draft'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h2 className="text-lg font-medium text-white">Route Details</h2>
          <div>
            <label className="text-sm text-gray-400">Source Warehouse</label>
            <Select
              value={transfer.sourceWarehouseId || ''}
              onChange={(val) => setTransfer({ ...transfer, sourceWarehouseId: val })}
              options={warehouses.map(w => ({ value: w.warehouseId, label: w.warehouseName }))}
              className="mt-1 w-full bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Destination Warehouse</label>
            <Select
              value={transfer.destinationWarehouseId || ''}
              onChange={(val) => setTransfer({ ...transfer, destinationWarehouseId: val })}
              options={warehouses.map(w => ({ value: w.warehouseId, label: w.warehouseName }))}
              className="mt-1 w-full bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Priority</label>
            <Select
              value={transfer.priority || 'MEDIUM'}
              onChange={(val) => setTransfer({ ...transfer, priority: val as any })}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
              className="mt-1 w-full bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Items</h2>
            <Button size="sm" variant="outline" onClick={addItem} className="border-indigo-500/50 text-indigo-400">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-4">
            {transfer.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="flex-1">
                  <Select
                    value={item.productId}
                    onChange={(val) => updateItem(index, 'productId', val)}
                    options={products.map(p => ({ value: p.productId, label: p.productId }))}
                    className="w-full bg-transparent border-white/10 text-white"
                  />
                </div>
                <div className="w-24">
                  <Input 
                    type="number" 
                    value={item.requestedQty}
                    onChange={(e) => updateItem(index, 'requestedQty', Number(e.target.value))}
                    className="bg-transparent border-white/10 text-white w-full"
                    min="1"
                  />
                </div>
                <Button variant="ghost" onClick={() => removeItem(index)} className="text-rose-400 hover:bg-rose-400/10 px-2 py-1">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {transfer.items?.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No items added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
