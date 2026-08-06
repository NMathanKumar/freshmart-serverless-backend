import { useMemo, useState } from 'react';
import { BadgePercent, CheckCircle2, CircleDollarSign, Clock3, History, MoreVertical, PlusCircle, Search, Ticket, TrendingUp, UsersRound } from 'lucide-react';
import { AdminShell } from '../components/admin-shell.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { CouponDialog } from '../components/coupon-dialog.js';
import type { CouponDialogKind, CouponRecord, CouponStatus } from '../components/coupon-dialog.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { createCoupon, deleteCoupon as apiDeleteCoupon, fetchAdminCoupons, updateCouponStatus } from '../api/admin-api.js';

const CouponsPage = () => {
  const { data: couponData, retry, state } = useApiResource(fetchAdminCoupons);
  const couponList = couponData?.data ?? [];

  const coupons: CouponRecord[] = useMemo(() => {
    return couponList.map((item: any) => {
      const data = item.data as Record<string, unknown>;
      return {
        id: item.adminItemId,
        code: String(data.code || item.adminItemId),
        campaign: `Campaign ${item.adminItemId}`,
        description: `FreshMart promotion coupon ${data.code}`,
        discountType: 'Percentage',
        discountValue: `${data.discountPercentage || 10}%`,
        startsDate: 'Always',
        expiryDate: 'Dec 31, 2026',
        usage: Number(data.currentUses || 0),
        usageLimit: Number(data.maxUses || 500),
        status: (item.status === 'ACTIVE' ? 'Active' : 'Inactive') as CouponStatus
      };
    });
  }, [couponList]);

  const [dialog, setDialog] = useState<{ coupon?: CouponRecord; kind: CouponDialogKind }>();
  const [menuId, setMenuId] = useState<string>();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visibleCoupons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return coupons
      .filter((coupon) => status === 'all' || coupon.status === status)
      .filter((coupon) => !normalized || `${coupon.code} ${coupon.campaign}`.toLowerCase().includes(normalized));
  }, [coupons, query, status]);

  const couponSummary = [
    { icon: Ticket, label: 'Total Coupons', note: 'Live total', tone: 'primary', value: String(coupons.length) },
    { icon: CheckCircle2, label: 'Active Coupons', note: 'Active', tone: 'success', value: String(coupons.filter((c) => c.status === 'Active').length) },
    { icon: History, label: 'Expired Coupons', note: 'Inactive', tone: 'danger', value: String(coupons.filter((c) => c.status !== 'Active').length) },
    { icon: Clock3, label: 'Scheduled Promotions', note: 'Upcoming', tone: 'scheduled', value: '0' },
    { icon: UsersRound, label: 'Total Redemptions', note: 'Redemptions', tone: 'redemptions', value: '1,240' },
    { icon: CircleDollarSign, label: 'Discount Value', note: 'Revenue Impact', tone: 'revenue', value: '$84K' }
  ] as const;

  const openDialog = (kind: CouponDialogKind, coupon?: CouponRecord) => {
    setDialog({ coupon, kind });
    setMenuId(undefined);
  };

  const saveCouponHandler = async (coupon: CouponRecord) => {
    await createCoupon({ code: coupon.code, discountPercentage: 20 });
    retry();
    setDialog(undefined);
  };

  const toggleStatusHandler = async (coupon: CouponRecord) => {
    const newStatus = coupon.status === 'Active' ? 'INACTIVE' : 'ACTIVE';
    await updateCouponStatus(coupon.id, newStatus);
    retry();
  };

  const deleteCouponHandler = async (coupon: CouponRecord) => {
    await apiDeleteCoupon(coupon.id);
    retry();
    setDialog(undefined);
  };

  return (
    <AdminShell precision precisionVariant="coupons" searchPlaceholder="Search promotions..." user="main">
      <main className="coupons-screen">
        <header className="coupons-heading">
          <div>
            <h1>Coupons &amp; Promotions</h1>
            <p>Manage your customer loyalty programs and seasonal discount campaigns.</p>
          </div>
          <button type="button" onClick={() => openDialog('details')}><PlusCircle aria-hidden="true" />Create Coupon</button>
        </header>

        <section className="coupon-summary" aria-label="Coupon summary">
          {couponSummary.map(({ icon: Icon, label, note, tone, value }) => (
            <article className={tone} key={label}>
              <div><span><Icon aria-hidden="true" /></span><small>{label}</small></div>
              <strong>{value}</strong>
              <p>{note}</p>
            </article>
          ))}
        </section>

        <section className="coupon-toolbar" aria-label="Coupon filters">
          <label><Search aria-hidden="true" /><input aria-label="Search coupons" placeholder="Search Coupons" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <select aria-label="Coupon status filter" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="primary" type="button" onClick={() => openDialog('details')}><PlusCircle aria-hidden="true" />Create Coupon</button>
        </section>

        <section className="coupon-list-card" aria-label="Recent coupons">
          <header><h2>Recent Coupons ({coupons.length})</h2></header>
          {state === 'loading' ? (
            <div className="p-8 text-center">Loading coupons...</div>
          ) : visibleCoupons.length > 0 ? (
            <div className="coupon-table-scroll">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Promotion Name</th>
                    <th>Discount Value</th>
                    <th>Usage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCoupons.map((coupon) => (
                    <tr className={coupon.status === 'Inactive' ? 'inactive' : ''} key={coupon.id}>
                      <td><button className={`coupon-code ${coupon.status.toLowerCase()}`} type="button" onClick={() => openDialog('details', coupon)}>{coupon.code}</button></td>
                      <td><strong>{coupon.campaign}</strong><small>{coupon.description}</small></td>
                      <td className="coupon-value">{coupon.discountValue}</td>
                      <td><strong>{coupon.usage.toLocaleString()}</strong><small>/ {coupon.usageLimit?.toLocaleString()}</small></td>
                      <td><span className={`coupon-status ${coupon.status.toLowerCase()}`}>{coupon.status}</span></td>
                      <td className="coupon-actions-cell">
                        <button type="button" aria-label={`Actions for ${coupon.code}`} onClick={() => setMenuId((current) => current === coupon.id ? undefined : coupon.id)}><MoreVertical aria-hidden="true" /></button>
                        {menuId === coupon.id ? (
                          <div className="coupon-action-menu">
                            <button type="button" onClick={() => toggleStatusHandler(coupon)}>{coupon.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                            <button className="danger" type="button" onClick={() => deleteCouponHandler(coupon)}>Delete Coupon</button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <AdminResourceState className="coupon-table-state" emptyTitle="No coupons found" icon={Ticket} state="empty" />}
        </section>
      </main>
      <CouponDialog coupon={dialog?.coupon} kind={dialog?.kind ?? 'details'} onClose={() => setDialog(undefined)} onDelete={deleteCouponHandler} onSave={saveCouponHandler} open={Boolean(dialog)} />
    </AdminShell>
  );
};

export default CouponsPage;
