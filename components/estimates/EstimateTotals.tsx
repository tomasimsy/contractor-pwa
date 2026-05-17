interface EstimateTotalsProps {
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    discount?: number;
    markup?: number;
    deposit?: number;
  };
}

export function EstimateTotals({ totals }: EstimateTotalsProps) {
  return (
    <div className="border-t pt-4 mt-6">
      <div className="flex justify-between mb-1">
        <span>Subtotal</span>
        <span>${totals.subtotal.toFixed(2)}</span>
      </div>

      {totals.markup && totals.markup > 0 && (
        <div className="flex justify-between mb-1">
          <span>Markup</span>
          <span>+${totals.markup.toFixed(2)}</span>
        </div>
      )}

      {totals.discount && totals.discount > 0 && (
        <div className="flex justify-between mb-1">
          <span>Discount</span>
          <span>-${totals.discount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between mb-1">
        <span>Tax</span>
        <span>${totals.tax.toFixed(2)}</span>
      </div>

      {totals.deposit && totals.deposit > 0 && (
        <div className="flex justify-between mb-1 text-blue-600">
          <span>Deposit Paid</span>
          <span>-${totals.deposit.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-xl mt-2 pt-2 border-t">
        <span>Total Due</span>
        <span>${totals.total.toFixed(2)}</span>
      </div>
    </div>
  );
}