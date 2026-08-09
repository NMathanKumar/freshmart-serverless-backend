import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export const PickListScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pick List</h1>
        <p className="text-sm text-slate-500">Generate and print pick lists for allocated orders.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Pick List Screen Placeholder
        </CardContent>
      </Card>
    </div>
  );
};
