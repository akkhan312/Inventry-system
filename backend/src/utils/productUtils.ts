import { PrismaClient } from '@prisma/client';

export const calculateTotalStockValue = (products: any[]) => {
    return products.reduce((sum: number, p: any) => sum + (p.quantity * (p.purchasePrice || 0)), 0);
};

export const calculateProductValuations = (products: any[]) => {
    return products.reduce((acc: any, prod: any) => {
        const purchaseValue = prod.quantity * (prod.purchasePrice || 0);
        const saleValue = prod.quantity * (prod.salePrice || 0);

        return {
            totalPurchaseValue: acc.totalPurchaseValue + purchaseValue,
            totalSaleValue: acc.totalSaleValue + saleValue,
            totalProfitPotential: acc.totalProfitPotential + (saleValue - purchaseValue)
        };
    }, { totalPurchaseValue: 0, totalSaleValue: 0, totalProfitPotential: 0 });
};
