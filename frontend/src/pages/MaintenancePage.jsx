import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleAdminLogin = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <section className="order-2 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur-xl sm:p-8 lg:order-1 lg:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200 sm:text-sm">
              Scheduled Downtime
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20 sm:h-16 sm:w-16">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3.75m0 3.75h.008v.008H12v-.008Zm8.25-.75c0 2.485-3.694 4.5-8.25 4.5s-8.25-2.015-8.25-4.5 3.694-4.5 8.25-4.5 8.25 2.015 8.25 4.5Zm-1.794-7.53-5.25-5.25a1.5 1.5 0 0 0-2.122 0l-5.25 5.25a1.5 1.5 0 0 0 1.06 2.56h10.5a1.5 1.5 0 0 0 1.062-2.56Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Site Is Under Maintenance
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7 lg:text-lg">
                    We are applying updates to improve reliability, speed, and the overall shopping experience.
                    Public access is temporarily paused while maintenance is active.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-bold text-amber-300">Maintenance Active</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Access</p>
                  <p className="mt-2 text-lg font-bold text-white">Admins Only</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Experience</p>
                  <p className="mt-2 text-lg font-bold text-white">Returning Soon</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                <p className="text-sm leading-6 text-slate-300 sm:text-base">
                  Only administrators can continue from here. If you are managing the platform, use the admin login
                  button below to authenticate and access the dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 sm:px-7 sm:text-base"
                >
                  Login As Administrator
                </button>
                <p className="text-xs leading-5 text-slate-400 sm:max-w-xs sm:text-sm">
                  This route is reserved for administrators while maintenance mode remains enabled.
                </p>
              </div>
            </div>
          </section>

          <aside className="order-1 lg:order-2">
            <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur-xl sm:max-w-lg sm:p-7 lg:max-w-none lg:p-8">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl sm:h-36 sm:w-36" />
                <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl sm:h-36 sm:w-36" />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">System Window</p>
                      <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Temporary Service Hold</h2>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      Protected
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-300">
                        <span>Platform checks</span>
                        <span>Running</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Security</p>
                        <p className="mt-2 text-base font-bold text-white">Admin access enabled</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Public traffic</p>
                        <p className="mt-2 text-base font-bold text-white">Temporarily restricted</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-dashed border-slate-700/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17 15 12l-5.25-5M21 12H3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Admin route stays available</p>
                        <p className="text-xs leading-5 text-slate-400 sm:text-sm">
                          Use administrator login to continue into the dashboard during maintenance mode.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
