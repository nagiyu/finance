import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MY_TICKER_DEAL_TYPE } from '@finance/types/MyTickerType';
import { MyTickerSummaryDataType } from '@/interfaces/data/MyTickerSummaryDataType';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

export default class MyTickerSummaryUtil {
  /**
   * Calculate current stock holdings summary from transaction history
   */
  public static calculateSummary(
    transactions: MyTickerDataType[],
    exchanges: ExchangeDataType[],
    tickers: TickerDataType[]
  ): MyTickerSummaryDataType[] {
    // Group transactions by ticker
    const tickerGroups = new Map<string, MyTickerDataType[]>();
    
    transactions.forEach(transaction => {
      const key = `${transaction.exchangeId}|${transaction.tickerId}`;
      if (!tickerGroups.has(key)) {
        tickerGroups.set(key, []);
      }
      tickerGroups.get(key)!.push(transaction);
    });

    const summary: MyTickerSummaryDataType[] = [];

    tickerGroups.forEach((tickerTransactions, key) => {
      const [exchangeId, tickerId] = key.split('|');
      
      // Calculate current holdings
      let totalQuantity = 0;
      let totalCost = 0;
      let remainingQuantity = 0;
      let totalPurchaseCost = 0;

      // Sort transactions by date to process in chronological order
      const sortedTransactions = [...tickerTransactions].sort((a, b) => a.date - b.date);

      // First pass: calculate net quantity
      sortedTransactions.forEach(transaction => {
        if (transaction.deal === MY_TICKER_DEAL_TYPE.PURCHASE) {
          totalQuantity += transaction.quantity;
        } else if (transaction.deal === MY_TICKER_DEAL_TYPE.SELL) {
          totalQuantity -= transaction.quantity;
        }
      });

      // If we have current holdings, calculate average purchase price
      if (totalQuantity > 0) {
        // Calculate weighted average using FIFO method
        let purchaseStack: Array<{ quantity: number; price: number }> = [];
        
        sortedTransactions.forEach(transaction => {
          if (transaction.deal === MY_TICKER_DEAL_TYPE.PURCHASE) {
            purchaseStack.push({
              quantity: transaction.quantity,
              price: transaction.price // transaction.price is already the total cost
            });
          } else if (transaction.deal === MY_TICKER_DEAL_TYPE.SELL) {
            let sellQuantity = transaction.quantity;
            
            while (sellQuantity > 0 && purchaseStack.length > 0) {
              const purchase = purchaseStack[0];
              const soldFromThisPurchase = Math.min(sellQuantity, purchase.quantity);
              
              // Proportionally reduce the price when selling partial quantity
              const pricePerShare = purchase.price / purchase.quantity;
              purchase.price -= soldFromThisPurchase * pricePerShare;
              purchase.quantity -= soldFromThisPurchase;
              sellQuantity -= soldFromThisPurchase;
              
              if (purchase.quantity === 0) {
                purchaseStack.shift();
              }
            }
          }
        });

        // Calculate remaining holdings and total cost
        remainingQuantity = purchaseStack.reduce((sum, purchase) => sum + purchase.quantity, 0);
        totalPurchaseCost = purchaseStack.reduce((sum, purchase) => sum + purchase.price, 0);

        if (remainingQuantity > 0) {
          const exchange = exchanges.find(ex => ex.id === exchangeId);
          const ticker = tickers.find(t => t.id === tickerId);
          
          summary.push({
            tickerId,
            exchangeId,
            tickerName: ticker?.name || 'Unknown',
            exchangeName: exchange?.name || 'Unknown',
            currentQuantity: remainingQuantity,
            totalCost: totalPurchaseCost,
            averagePrice: totalPurchaseCost / remainingQuantity
          });
        }
      }
    });

    return summary.sort((a, b) => a.tickerName.localeCompare(b.tickerName));
  }
}