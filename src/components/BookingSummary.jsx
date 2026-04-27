export default function BookingSummary({ validation, onProceed, loading, apiError, dateError, onRetry }) {
  const { isValid, totalBeds, totalPrice, nights, errors } = validation;

  // dateError is for inline date validation, apiError is for API failures
  const inlineError = dateError || '';

  return (
    <div className="booking-footer">
      <div className="booking-footer-content">
        <div>
          {errors.length > 0 ? (
            <div className="status-message status-error" style={{ margin: 0, padding: '8px 12px' }}>
              {errors[0]}
            </div>
          ) : inlineError ? (
            <div className="status-message status-warning" style={{ margin: 0, padding: '8px 12px' }}>
              {inlineError}
            </div>
          ) : (
            <>
              <div className="booking-total-label">Total Payable</div>
              <div className="booking-total-value">₹{totalPrice.toLocaleString()}</div>
              {totalBeds > 0 && (
                <div className="booking-summary-details">
                  {totalBeds} bed{totalBeds > 1 ? 's' : ''} for {nights} night{nights > 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>

        <div className="booking-actions" style={{ alignItems: 'flex-end' }}>
          {apiError ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
                {apiError}
              </div>
              <button className="btn btn-outline" onClick={onRetry ? onRetry : onProceed} disabled={loading}>
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!isValid || !!inlineError || loading}
              onClick={onProceed}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
