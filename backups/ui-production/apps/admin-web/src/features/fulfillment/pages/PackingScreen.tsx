import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

export const PackingScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Packing</h1>
        <p className="text-sm text-slate-500">Scan and pack picked items into boxes.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Packing Screen Placeholder
        </CardContent>
      </Card>
    </div>
  );
};
