import React, { useState } from 'react';
import * as icons from '@lift/ds-assets/base/icons';

export default function Sidebar({ sections, active, onNavigate }) {
  var groups = {};
  sections.forEach(function (s) {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });

  var groupNames = Object.keys(groups);

  // Find which group the active section belongs to
  var activeGroup = null;
  sections.forEach(function (s) {
    if (s.id === active) activeGroup = s.group;
  });

  // Start with only the active group open, all others collapsed
  var [collapsed, setCollapsed] = useState(function () {
    var initial = {};
    groupNames.forEach(function (group) {
      if (group !== 'Sobre o Projeto') {
        initial[group] = true;
      }
    });
    return initial;
  });

  function toggleGroup(group) {
    setCollapsed(function (prev) {
      var next = Object.assign({}, prev);
      next[group] = !next[group];
      return next;
    });
  }

  return (
    <nav className="sidebar">
      {groupNames.map(function (group) {
        var items = groups[group];
        var isCollapsed = collapsed[group] && group !== activeGroup;

        return (
          <div className="nav-sec" key={group}>
            <button
              className="nav-sec-title"
              onClick={function () { toggleGroup(group); }}
              aria-expanded={!isCollapsed}
            >
              <span className="nav-sec-title-text">{group}</span>
              <span className={'nav-sec-chevron' + (isCollapsed ? ' nav-sec-chevron--collapsed' : '')}>
                &#9662;
              </span>
            </button>
            {!isCollapsed && items.map(function (item) {
              var iconSvg = item.icon && icons[item.icon] ? icons[item.icon] : null;
              return (
                <button
                  key={item.id}
                  className={'nav-link ' + (active === item.id ? 'active' : '')}
                  onClick={function () { onNavigate(item.id); }}
                >
                  {iconSvg ? (
                    <span
                      className="nav-icon"
                      dangerouslySetInnerHTML={{ __html: iconSvg }}
                    />
                  ) : (
                    <span className="nav-icon">•</span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
