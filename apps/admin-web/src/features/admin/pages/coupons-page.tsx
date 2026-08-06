import { Ticket } from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';

const CouponsPage = () => {
  return (
    <AdminShell searchPlaceholder="Search promotions..." user="main">
      <main className="coupons-screen">
        <header className="coupons-heading">
          <div>
            <h1>Coupons &amp; Promotions</h1>
            <p>Manage your customer loyalty programs and seasonal discount campaigns.</p>
          </div>
        </header>

        <section className="coupon-list-card mt-6 h-[400px]" aria-label="Recent coupons">
          <AdminResourceState
            className="coupon-table-state"
            emptyTitle="Feature Coming Soon"
            emptyDescription="The promotions and coupons engine is currently being integrated into the backend services."
            icon={Ticket}
            state="empty"
          />
        </section>
      </main>
    </AdminShell>
  );
};

export default CouponsPage;
