import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Plus,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Smartphone,
  CreditCard,
  Building,
  Loader2
} from 'lucide-react';

export default function WalletPage({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Top-up Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${localStorage.getItem('campusgig_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('campusgig_token')}`
        },
        body: JSON.stringify({
          amount: Number(topupAmount),
          payment_method: paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        refreshUser();
        setShowTopupModal(false);
      } else {
        alert(data.message || 'Top-up failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading wallet balance & escrow ledger...
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Wallet size={16} />
              <span>SIMULATED PAYMENT & ESCROW WALLET</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Campus Financial Ledger</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Track available funds, escrow-locked deposits, project earnings, and transaction history
            </p>
          </div>

          <button onClick={() => setShowTopupModal(true)} className="btn btn-success btn-md" style={{ gap: '0.4rem' }}>
            <Plus size={16} />
            <span>Add Funds to Wallet</span>
          </button>
        </div>

        {/* 1. Wallet Balance Cards */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          
          {/* Available Balance */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Balance</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              ₹{wallet?.balance || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Ready for hiring peers or instant payout
            </div>
          </div>

          {/* Locked in Escrow */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Locked in Escrow</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
              ₹{wallet?.escrow_balance || 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Safely held until deliverable approval
            </div>
          </div>

          {/* Total Earned / Spent */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime Metrics</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Earned (Freelancing):</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>₹{wallet?.total_earned || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Spent (Hiring):</span>
              <strong style={{ color: 'var(--primary)' }}>₹{wallet?.total_spent || 0}</strong>
            </div>
          </div>

        </div>

        {/* 2. Transaction Ledger */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Transaction Ledger History</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time simulated debits, credits, and escrow locks</p>
            </div>
          </div>

          {wallet?.transactions && wallet.transactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reference</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.transactions.map((t) => {
                    const isCredit = t.amount > 0;
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge ${t.type === 'TOPUP' ? 'badge-verified' : t.type === 'ESCROW_RELEASE' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>{t.description}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.reference_id}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: isCredit ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {isCredit ? '+' : ''}₹{t.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No transactions recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* TOP-UP MODAL */}
      {showTopupModal && (
        <div className="modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Simulated Wallet Recharge</h3>
              <button onClick={() => setShowTopupModal(false)} className="btn btn-sm btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>✕</button>
            </div>
            <form onSubmit={handleTopup}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Recharge Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    max="50000"
                    step="100"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="input"
                    style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopupAmount(amt)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Simulated Payment Gateway</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div
                      onClick={() => setPaymentMethod('upi')}
                      className="card"
                      style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderColor: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-color)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Smartphone size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem' }}>Simulated UPI / QR Code (Instant)</span>
                      </div>
                      <input type="radio" checked={paymentMethod === 'upi'} readOnly />
                    </div>

                    <div
                      onClick={() => setPaymentMethod('card')}
                      className="card"
                      style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderColor: paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} color="var(--accent-emerald)" />
                        <span style={{ fontSize: '0.85rem' }}>Simulated Debit / Credit Card</span>
                      </div>
                      <input type="radio" checked={paymentMethod === 'card'} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowTopupModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={processing} className="btn btn-success btn-sm" style={{ minWidth: 140 }}>
                  {processing ? <Loader2 size={16} className="spin" /> : `Add ₹${topupAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
