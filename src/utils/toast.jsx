import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export const showUndoToast = (message, onUndo) => {
  toast.custom((t) => <UndoToast t={t} message={message} onUndo={onUndo} />, {
    duration: 5000,
  });
};

const UndoToast = ({ t, message, onUndo }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 5000; // ms
    const interval = 50; // update every 50ms
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #ccc',
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        minWidth: '320px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss(t.id);
          }}
          style={{
            marginLeft: '1rem',
            color: '#007bff',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Undo
        </button>
      </div>
      <div
        style={{
          height: '4px',
          background: '#007bff33',
          marginTop: '0.5rem',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#007bff',
            transition: 'width 50ms linear',
          }}
        />
      </div>
    </div>
  );
};
