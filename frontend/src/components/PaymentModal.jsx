import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, X, CheckCircle, CreditCard, Smartphone, Building, Loader2, Lock } from 'lucide-react';

export default function PaymentModal({ project, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handlePay = async () => {
    setProcessing(true);

    // Simulate escrow network latency
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
          },
          body: JSON.stringify({
            status: 'ACCEPTED',
            escrow_funded: 1
          })
        });
        const data = await res.json();
        if (data.success) {
          refreshUser();
          setSuccessReceipt({
            txnId: `TXN-ESC-${Date.now()}`,
            amount: project.budget,
            date: new Date().toLocaleString()
          });
          if (onSuccess) onSuccess(data.project);
        } else {
          alert(data.message || 'Payment processing failed');
        }
      } catch (err) {
        alert('Payment failed: ' + err.message);
      } finally {
        setProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Secure Escrow Checkout</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Funds are held safely in escrow until you approve final deliverables
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {successReceipt ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Escrow Payment Funded!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                ₹{successReceipt.amount} is securely locked for "{project.title}".
                Work can now proceed safely!
              </p>
              
              <div className="card" style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
                  <span style={{ fontWeight: 600 }}>{successReceipt.txnId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>
                  <span>{successReceipt.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>LOCKED IN ESCROW</span>
                </div>
              </div>

              <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
                Go to Project Workstation
              </button>
            </div>
          ) : (
            <div>
              {/* Summary Card */}
              <div className="card" style={{ background: 'var(--bg-surface-elevated)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project:</span>
                  <strong style={{ fontSize: '0.925rem' }}>{project.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Freelancer:</span>
                  <span>{project.freelancer?.name || 'Student Freelancer'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Total Escrow Amount:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{project.budget}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Select Simulated Payment Method:
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  
                  {/* UPI */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className="card"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderColor: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-color)',
                      background: paymentMethod === 'upi' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Smartphone size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Simulated UPI / QR Code</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm (Instant)</div>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'upi'} readOnly />
                  </div>

                  {/* Wallet */}
                  <div
                    onClick={() => setPaymentMethod('wallet')}
                    className="card"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderColor: paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border-color)',
                      background: paymentMethod === 'wallet' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CreditCard size={18} color="var(--accent-emerald)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>CampusGig Wallet Balance</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Available: ₹{user?.wallet?.balance || 0}</div>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'wallet'} readOnly />
                  </div>

                  {/* NetBanking / Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className="card"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderColor: paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)',
                      background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Building size={18} color="var(--secondary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Simulated Debit / NetBanking</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>All major student accounts supported</div>
                      </div>
                    </div>
                    <input type="radio" checked={paymentMethod === 'card'} readOnly />
                  </div>

                </div>
              </div>

              {/* Escrow Guarantee Notice */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-elevated)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <Lock size={15} color="var(--accent-emerald)" />
                <span>100% Student Protection: Freelancer is only paid when you mark completed.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {!successReceipt && (
          <div className="modal-footer">
            <button onClick={onClose} disabled={processing} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={processing}
              className="btn btn-success btn-sm"
              style={{ gap: '0.4rem', minWidth: 160 }}
            >
              {processing ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
              <span>{processing ? 'Locking Escrow...' : `Pay ₹${project.budget} to Escrow`}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
