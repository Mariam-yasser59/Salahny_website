import { NavLink } from 'react-router-dom';
import { nav } from '../data/navigation.js';

export default function MobileNav({ role }) {
  const items = nav[role] || [];
  return (
    <nav className="mobile-nav">
      {items.slice(0, 5).map(({ to, label, icon: Icon }) => (
        <NavLink end key={to} to={to}>
          <Icon size={18} />
          <span>{label.split(' ')[0]}</span>
        </NavLink>
      ))}
    </nav>
  );
}
