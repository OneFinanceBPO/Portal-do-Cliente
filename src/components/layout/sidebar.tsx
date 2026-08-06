'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function Sidebar({ items, bottomItems }: { items: NavItem[]; bottomItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar" id="mainSidebar">
      <div className="brand">
        <Link href="/clientes">
          <Image src="/logo.png" alt="One Finance" width={36} height={36} />
        </Link>
      </div>
      <nav>
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <button className={`nav-btn ${pathname === item.href ? 'active' : ''}`} title={item.label}>
              {item.icon}
              <span className="nav-tooltip">{item.label}</span>
            </button>
          </Link>
        ))}
      </nav>
      <div className="bottom-nav">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <button className="nav-btn" title={item.label}>
              {item.icon}
              <span className="nav-tooltip">{item.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </aside>
  );
}