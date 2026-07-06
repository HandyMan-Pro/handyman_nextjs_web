'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, ClipboardCheck, UserMinus, Percent } from 'lucide-react';

export function HandymenTabs() {
  const pathname = usePathname();
  const tabs = [
    { label: 'Active Team', href: '/dashboard/handymen', icon: Users },
    { label: 'Join Requests', href: '/dashboard/handymen/requests', icon: ClipboardCheck },
    { label: 'Unassigned Handymen', href: '/dashboard/handymen/unassigned', icon: UserMinus },
    { label: 'Commission Rules', href: '/dashboard/handymen/commissions', icon: Percent },
  ];

  return (
    <div className="flex border-b border-zinc-800/60 mb-6 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              isActive
                ? 'border-[#5E5CE6] text-white bg-gradient-to-t from-[#5E5CE6]/5 to-transparent'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${isActive ? 'text-[#5E5CE6]' : 'text-zinc-500'}`} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
