import { useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook to handle undoable delete with toast.
 * 
 * @param {Array} data - Original list (e.g., categories)
 * @param {Function} setData - State updater for the list
 * @param {Function} onDelete - Actual delete callback (e.g., API call)
 * @returns {Function} triggerUndoDelete(id, message)
 */
const useUndoDeleteToast = (data, setData, onDelete) => {
  const originalRef = useRef([]);

  const triggerUndoDelete = (id, message = 'Item deleted') => {
    originalRef.current = [...data];
    const updated = data.filter(item => item._id !== id);
    setData(updated);

    const undo = () => {
      setData(originalRef.current);
    };

    toast((t) => (
      <span>
        {message}
        <button
          onClick={() => {
            undo();
            toast.dismiss(t.id);
          }}
          style={{
            marginLeft: '1rem',
            color: '#007bff',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Undo <i class="bi bi-arrow-counterclockwise"></i>
        </button>
      </span>
    ), { duration: 5000 });

    // Proceed with real delete after delay
    setTimeout(async () => {
      const stillDeleted = !data.find(item => item._id === id);
      if (stillDeleted) {
        try {
          await onDelete(id);
        } catch (err) {
          setData(originalRef.current); // rollback
          console.log({err});          
          toast.error('Failed to delete item.');
        }
      }
    }, 5000);
  };

  return triggerUndoDelete;
};

export default useUndoDeleteToast;
