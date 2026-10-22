import { saudaService } from './saudaService';

export interface PartyWiseReportRow {
  partyId: number;
  partyName: string;
  totalOrders: number;
  totalQuantity: number;
  totalBillAmount: number;
  totalBrokerage: number;
  asSellerCount: number;
  asBuyerCount: number;
}

export const reportService = {
  async getPartyWiseBrokerageReport(companyId?: number, financialYear?: string): Promise<PartyWiseReportRow[]> {
    const orders = await saudaService.getAll({ companyId, financialYear });
    const reportMap: Record<number, PartyWiseReportRow> = {};

    for (const order of orders) {
      // Process Seller
      if (order.sellerId) {
        if (!reportMap[order.sellerId]) {
          reportMap[order.sellerId] = {
            partyId: order.sellerId,
            partyName: order.sellerName,
            totalOrders: 0,
            totalQuantity: 0,
            totalBillAmount: 0,
            totalBrokerage: 0,
            asSellerCount: 0,
            asBuyerCount: 0,
          };
        }
        const row = reportMap[order.sellerId];
        row.totalOrders += 1;
        row.asSellerCount += 1;
        row.totalQuantity += Number(order.quantity) || 0;
        row.totalBillAmount += Number(order.totalBillAmount) || 0;
        row.totalBrokerage += Number(order.sellerCommissionAmount) || 0;
      }

      // Process Buyer
      if (order.buyerId) {
        if (!reportMap[order.buyerId]) {
          reportMap[order.buyerId] = {
            partyId: order.buyerId,
            partyName: order.buyerName,
            totalOrders: 0,
            totalQuantity: 0,
            totalBillAmount: 0,
            totalBrokerage: 0,
            asSellerCount: 0,
            asBuyerCount: 0,
          };
        }
        const row = reportMap[order.buyerId];
        row.totalOrders += 1;
        row.asBuyerCount += 1;
        row.totalQuantity += Number(order.quantity) || 0;
        row.totalBillAmount += Number(order.totalBillAmount) || 0;
        row.totalBrokerage += Number(order.buyerCommissionAmount) || 0;
      }
    }

    return Object.values(reportMap).sort((a, b) => b.totalBrokerage - a.totalBrokerage);
  },
};
