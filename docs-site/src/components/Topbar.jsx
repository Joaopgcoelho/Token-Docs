import React, { useState, useEffect, useRef } from 'react';
import { Search } from '@lift/ds-assets/base/icons';
import liftLogo from '../assets/lift-ds-logo.svg';

export default function Topbar({ sections, onNavigate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  var filtered = (sections || []).filter(function (s) {
    if (!query.trim()) return false;
    var q = query.toLowerCase();
    return s.label.toLowerCase().indexOf(q) !== -1 || s.group.toLowerCase().indexOf(q) !== -1;
  });

  // Cmd+K keyboard shortcut
  useEffect(function () {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        if (inputRef.current) inputRef.current.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return function () {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Click outside detection
  useEffect(function () {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function () {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSelect(sectionId) {
    if (onNavigate) onNavigate(sectionId);
    setQuery('');
    setOpen(false);
  }

  // Group results by group name
  var groupedResults = {};
  filtered.forEach(function (s) {
    if (!groupedResults[s.group]) groupedResults[s.group] = [];
    groupedResults[s.group].push(s);
  });

  return (
    <div className="topbar">
      <img src={liftLogo} alt="Lift DS" className="topbar-logo-img" />
      <span className="topbar-title">Token Docs</span>

      <div className="topbar-search" ref={wrapperRef}>
        <div className="topbar-search-input-wrap">
          <span
            className="topbar-search-icon"
            dangerouslySetInnerHTML={{ __html: Search }}
          />
          <input
            ref={inputRef}
            className="topbar-search-input"
            type="text"
            placeholder="Buscar seção..."
            value={query}
            onChange={function (e) {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={function () { setOpen(true); }}
            aria-label="Buscar seção"
          />
          <kbd className="topbar-search-kbd">⌘K</kbd>
        </div>

        {open && filtered.length > 0 && (
          <div className="topbar-search-dropdown" role="listbox">
            {Object.entries(groupedResults).map(function (entry) {
              var group = entry[0];
              var items = entry[1];
              return (
                <div key={group}>
                  <div className="topbar-search-group">{group}</div>
                  {items.map(function (item) {
                    return (
                      <button
                        key={item.id}
                        className="topbar-search-result"
                        onClick={function () { handleSelect(item.id); }}
                        role="option"
                        type="button"
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
