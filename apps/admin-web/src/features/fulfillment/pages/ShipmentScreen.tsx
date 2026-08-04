import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

export const ShipmentScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Shipment</h1>
        <p className="text-sm text-slate-500">Manage dispatch and shipping labels for packed orders.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Shipment Screen Placeholder
        </CardContent>
      </Card>
    </div>
  );
};
