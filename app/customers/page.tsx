import React from 'react';
import CustomersList from "@/components/CustomersList";

export default function CustomersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
      </div>
      <CustomersList />
    </div>
  );
}