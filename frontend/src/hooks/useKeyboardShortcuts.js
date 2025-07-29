import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Create a key combination string
    let combination = '';
    if (ctrl) combination += 'ctrl+';
    if (shift) combination += 'shift+';
    if (alt) combination += 'alt+';
    combination += key;

    // Check if this combination exists in shortcuts
    const shortcut = shortcuts.find(s => s.key === combination);
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;

