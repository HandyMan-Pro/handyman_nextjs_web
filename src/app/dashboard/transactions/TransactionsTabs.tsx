'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Banknote, CircleDollarSign, BadgeDollarSign } from 'lucide-react';

export function TransactionsTabs() {
  const pathname = usePathname();
  const tabs = [
    { label: 'Payments', href: '/dashboard/transactions/payments', icon: CreditCard },
    { label: 'Cash Payments', href: '/dashboard/transactions/cash-payments', icon: Banknote },
    { label: 'Withdrawals', href: '/dashboard/transactions/withdrawals', icon: CircleDollarSign },
    { label: 'Handyman Earnings', href: '/dashboard/transactions/handyman-earnings', icon: BadgeDollarSign },
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
