import React from 'react';
import { Send, CheckCircle2, Clock, PackageCheck, RotateCcw, Award, XCircle } from 'lucide-react';

export default function StatusStepper({ status }) {
  const steps = [
    { key: 'REQUESTED', label: 'Requested', icon: Send },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
    { key: 'SUBMITTED', label: 'Submitted', icon: PackageCheck },
    { key: 'REVISION', label: 'Revision', icon: RotateCcw },
    { key: 'COMPLETED', label: 'Completed', icon: Award }
  ];

  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#f43f5e',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        margin: '1.25rem 0'
      }}>
        <XCircle size={22} />
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem' }}>Project {status}</strong>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            {status === 'CANCELLED' ? 'This project was cancelled and escrow funds have been refunded.' : 'This project request was declined by the freelancer.'}
          </span>
        </div>
      </div>
    );
  }

  // Calculate active index
  let currentIndex = 0;
  if (status === 'ACCEPTED') currentIndex = 1;
  if (status === 'IN_PROGRESS') currentIndex = 2;
  if (status === 'SUBMITTED') currentIndex = 3;
  if (status === 'REVISION') currentIndex = 4;
  if (status === 'COMPLETED') currentIndex = 5;

  const progressPercent = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ margin: '1.5rem 0 2rem' }}>
      <div className="stepper-container">
        
        {/* Track Line */}
        <div className="stepper-track">
          <div className="stepper-progress" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Steps */}
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isRevision = isCurrent && status === 'REVISION';

          let stateClass = '';
          if (isPassed || (isCurrent && status === 'COMPLETED')) stateClass = 'completed';
          else if (isCurrent) stateClass = 'active';

          return (
            <div key={s.key} className={`step-item ${stateClass}`}>
              <div className="step-circle" style={isRevision ? { background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#fff' } : {}}>
                {isRevision ? <RotateCcw size={18} /> : <Icon size={18} />}
              </div>
              <span className="step-label">
                {isRevision ? 'Revision' : s.label}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
