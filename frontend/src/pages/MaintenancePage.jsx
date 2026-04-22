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
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="order-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:order-1 lg:p-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Scheduled Maintenance
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 9v3.75m0 3.75h.008v.008H12v-.008Zm8.25-.75c0 2.485-3.694 4.5-8.25 4.5s-8.25-2.015-8.25-4.5 3.694-4.5 8.25-4.5 8.25 2.015 8.25 4.5Zm-1.794-7.53-5.25-5.25a1.5 1.5 0 0 0-2.122 0l-5.25 5.25a1.5 1.5 0 0 0 1.06 2.56h10.5a1.5 1.5 0 0 0 1.062-2.56Z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
                    We&rsquo;re Currently Under Maintenance
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base lg:text-lg">
                    We are performing essential updates to improve platform stability, performance, and overall user
                    experience. Public access is temporarily unavailable while maintenance is in progress.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">Maintenance Active</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Access</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">Administrators Only</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Availability</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">Service Resuming Soon</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 sm:p-5">
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  If you are an administrator, you can continue by signing in through the admin portal. This route
                  remains available during the maintenance window.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:px-7 sm:text-base"
                >
                  Login as Administrator
                </button>

                <p className="text-xs leading-6 text-slate-500 dark:text-slate-400 sm:max-w-xs sm:text-sm">
                  Access is restricted to authorized administrators until maintenance is complete.
                </p>
              </div>
            </div>
          </section>

          <aside className="order-1 lg:order-2">
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:p-10">
              <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        Maintenance Window
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Temporary Service Pause
                      </h2>
                    </div>

                    <div className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      Secure Access
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                      <span>System checks</span>
                      <span>In progress</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-2 w-3/4 rounded-full bg-slate-800 dark:bg-slate-200" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Security</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Administrator access enabled</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        Public traffic
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Temporarily restricted</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M9.75 17 15 12l-5.25-5M21 12H3"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin portal remains available</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Authorized administrators can continue to the dashboard by logging in from this page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Thank you for your patience. We&rsquo;re working to restore full access as quickly as possible.
                  </p>
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
