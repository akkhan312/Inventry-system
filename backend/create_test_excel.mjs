import * as XLSX from 'xlsx';

const data = [
    { Name: 'Test Product 1', SKU: 'TEST-SKU-001', Category: 'Test', Quantity: 10, PurchasePrice: 100, SalePrice: 150 },
    { Name: 'Test Product 2', SKU: 'TEST-SKU-002', Category: 'Test', Quantity: 5, PurchasePrice: 200, SalePrice: 250 },
    { Name: 'Test Product 3', SKU: 'TEST-SKU-003', Category: 'Test', Quantity: 0, PurchasePrice: 50, SalePrice: 80 }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

XLSX.writeFile(wb, 'test_import.xlsx');
console.log('test_import.xlsx created');
