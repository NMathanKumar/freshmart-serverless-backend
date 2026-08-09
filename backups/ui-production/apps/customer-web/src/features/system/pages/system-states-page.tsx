import { Suspense } from 'react';
import { Button, StateCard } from '@freshmart/design-system';
import { BellOff, RefreshCw } from 'lucide-react';
import { AccountShell } from '../../account/components/account-layout.js';

const stateCards = [
  {
    actionLabel: 'Start Shopping',
    description: "Your pantry is looking a bit lonely. Let's fill it with fresh organic produce today.",
    image: <img alt="Premium grocery bag empty state" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdzLxAvuesza4Su5jfEYwXfFAGHHu25gZByd6J106ZdFqweFiLQl8UO2BhACHT2sC9aZbp1pWzUQ4_-XOPrNRgZFgCKZJVKXDd2SH_S6DTuk_i2yEhhNm7YQDL6S2l6D6RvWfIH1myOdRfbte2zHrqx4URN7z1HuZpNa-zldgDcQp5NWrxZ_aDMjsw6GuDNFjtEOh704G1gPIJQ12NV1KvI5tBV7R_PwXqpStMry09gA8BLqIeZhsMZrxaYGXUfFT-R8kU9MHKkyTK" />,
    title: 'No Orders Yet'
  },
  {
    actionLabel: 'Browse Fresh Market',
    description: 'Discover the freshest seasonal harvests curated just for your kitchen.',
    image: <img alt="Empty grocery cart" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr3zN_qTVcqyfjYwEc1G-QZ-fJ0Oc6sj2m4VV96fADy0nyXeCcVW79s_01LKBAxeJPoA-lB1a80SjSUh8U5D7VGbKBRmE5UpFU3LfuCW6iLdu8_7g4XDPbNdkMNbN1GbRLuIo20v8g0hshKIMKH9-Pjo3k3ry81J_Z6tNJk8mfnvcluOqXY7j2cUvA2J-plTWsHgyONlIQf5y9mOh4haqt9DTidHuTobM9Cp55lSQNdRdJs4FuLTZTY-8C99TO_CvfgBPUhQjwq3Vm" />,
    title: 'Your Cart is Empty'
  },
  {
    actionLabel: 'Back to Home',
    description: "This page seems to have withered away. Let's get you back to the main garden.",
    eyebrow: '404 Error',
    image: <img alt="404 avocado illustration" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJM_02j3cScZnuM4lyeFbqCmFAmcDqtg5V6jizUorPh5PVnRa0BKbo4JbDoGv5_kWtrm3t98pE44-0_MHLUf-MfFL9ZsjIP9G4vu-MEJw5ZZOnEg99ex_NX2rn3Vo9vQf_7ebonhmbRifLNzxV8XN1P8pvcqrVx2iddPxZ-KLjG8DCW2G3NrJcSb8yr_HE4tRLyuV1JJgEK2FG62IFrmvJ9eLqpIKud09yEJuxInZEEZbV2rI5hNU-zmbKox61s97Rr2g32ieZyT4z" />,
    title: 'Page Not Found',
    tone: 'danger' as const
  },
  {
    actionLabel: 'Retry Connection',
    description: "Our digital systems are being polished. We'll be back to serving you in a few minutes.",
    eyebrow: '500 Error',
    image: <img alt="Maintenance illustration" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS6IMGK_ASSyia5VcmmSzAd3Ued0SLH5VK6Y7Ws23hu1Et5mpyn94bDvZnLmY9vUaC1EuFYWewOHZmDWjFvnwubJMsDs2lMsTbjRS8CI6kamDOe2imu_OpMkmwiZbBFQSZ9aaTWWSWMEP5ulCyVZUFCcUWXkWlxunUyYlN0CT4hMMsu4otNDW44AJ3RupsD5__oXfWl10__mEECP9DNJUAwFu-lgDxE8x3tiM7qV_pvJQssKXpVwiOHgicMel501iMj4lCQBJoPvsi" />,
    title: 'Server Error',
    tone: 'secondary' as const
  },
  {
    actionLabel: 'Manage Settings',
    description: 'No new notifications right now. Check back later for fresh deals and order updates.',
    image: <div className="rounded-3xl bg-white p-8 shadow-xl"><BellOff className="h-16 w-16 text-[#006b2c]" /></div>,
    title: 'All Caught Up'
  },
  {
    actionLabel: 'Refresh Page',
    description: 'It looks like your connection has gone off the grid. Please check your signal and try again.',
    image: <img alt="Network error illustration" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9g461R3SGQI-0LsYjBYRKD0HWidOxSKd_tdsIh8GRQ_Kptz59RPFtzH-upUQ4gZVz5YEF8BDUEu02vMYsaEGoC2-x5gbsdfR2lfS7uXQNbSyp25cejje66JarWBX2cDs7uLk5oTceBYk8wJnYCC4GsEElCS2-ee1F1Nbb2qVvgbmwJeUHq8oDe_QG_1XKQcyvF0VXsnXUM4NkGpYonsxzVFbkQs003Vc89fBayF9pPBjk7GPHlS6e3qxFVxzLVB2S8DGQqzYBOLwl" />,
    title: 'Connection Lost'
  }
];

const SystemStatesContent = () => (
  <AccountShell active="system">
    <div className="mb-10 text-center md:text-left">
      <h1 className="mb-2 text-3xl font-bold md:text-4xl">System State Showcase</h1>
      <p className="max-w-2xl text-[#3e4a3d]">A curated collection of error handling and empty state patterns designed for high-velocity premium retail experiences.</p>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stateCards.map((card) => <StateCard key={card.title} {...card} />)}
    </div>
  </AccountShell>
);

export const NotFoundPage = () => (
  <AccountShell active="system">
    <div className="mx-auto max-w-xl">
      <StateCard
        action={{ onClick: () => { window.location.href = '/'; } }}
        actionLabel="Back to Home"
        description="This page seems to have withered away. Let's get you back to the main garden."
        eyebrow="404 Error"
        image={<img alt="404 avocado illustration" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJM_02j3cScZnuM4lyeFbqCmFAmcDqtg5V6jizUorPh5PVnRa0BKbo4JbDoGv5_kWtrm3t98pE44-0_MHLUf-MfFL9ZsjIP9G4vu-MEJw5ZZOnEg99ex_NX2rn3Vo9vQf_7ebonhmbRifLNzxV8XN1P8pvcqrVx2iddPxZ-KLjG8DCW2G3NrJcSb8yr_HE4tRLyuV1JJgEK2FG62IFrmvJ9eLqpIKud09yEJuxInZEEZbV2rI5hNU-zmbKox61s97Rr2g32ieZyT4z" />}
        title="Page Not Found"
        tone="danger"
      />
    </div>
  </AccountShell>
);

export const GenericErrorPage = () => (
  <AccountShell active="system">
    <div className="mx-auto max-w-xl">
      <StateCard
        actionLabel="Retry"
        description="Something unexpected happened. Please retry the request or return home."
        eyebrow="Error"
        image={<RefreshCw className="h-16 w-16 text-[#006b2c]" />}
        title="Something went wrong"
      />
    </div>
  </AccountShell>
);

export const MaintenancePage = () => (
  <AccountShell active="system">
    <div className="mx-auto max-w-xl">
      <StateCard
        actionLabel="Check Again"
        description="FreshMarket is under scheduled maintenance while we polish the experience."
        eyebrow="Maintenance"
        image={<img alt="Maintenance illustration" className="h-40 w-40 object-contain drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS6IMGK_ASSyia5VcmmSzAd3Ued0SLH5VK6Y7Ws23hu1Et5mpyn94bDvZnLmY9vUaC1EuFYWewOHZmDWjFvnwubJMsDs2lMsTbjRS8CI6kamDOe2imu_OpMkmwiZbBFQSZ9aaTWWSWMEP5ulCyVZUFCcUWXkWlxunUyYlN0CT4hMMsu4otNDW44AJ3RupsD5__oXfWl10__mEECP9DNJUAwFu-lgDxE8x3tiM7qV_pvJQssKXpVwiOHgicMel501iMj4lCQBJoPvsi" />}
        title="Maintenance in Progress"
        tone="secondary"
      />
    </div>
  </AccountShell>
);

export default function SystemStatesPage() {
  return <Suspense fallback={<AccountShell active="system"><div className="h-96 rounded-3xl bg-white" /></AccountShell>}><SystemStatesContent /></Suspense>;
}
