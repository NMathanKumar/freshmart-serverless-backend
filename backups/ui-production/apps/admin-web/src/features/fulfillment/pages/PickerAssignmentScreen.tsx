import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

export const PickerAssignmentScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Picker Assignment</h1>
        <p className="text-sm text-slate-500">Assign pending orders to available pickers.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Picker Assignment Screen Placeholder
        </CardContent>
      </Card>
    </div>
  );
};
