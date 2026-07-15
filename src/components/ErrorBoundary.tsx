import * as React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught rendering error:", error, errorInfo);
    (this as any).setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    localStorage.removeItem("omran_azarestan_user");
    localStorage.removeItem("omran_azarestan_session_id");
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative overflow-hidden text-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
              <div className="p-4 bg-red-600/20 text-red-400 rounded-2xl shadow-lg border border-red-500/30 mb-4 animate-pulse">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <span className="bg-red-500/10 text-red-400 px-3 py-1 text-[10px] uppercase font-mono tracking-widest rounded-full border border-red-500/20 font-black mb-2">
                خطای بحرانی در بخش رابط کاربری (UI Crash)
              </span>
              <h2 className="text-base font-black text-white leading-relaxed">
                متاسفانه بخش رندرینگ سامانه با یک خطای غیرمنتظره مواجه شد
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed max-w-md">
                این خطا ممکن است ناشی از ناسازگاری لحظه‌ای داده‌های کش شده یا خطاهای رندر کامپوننت‌ها باشد. جزئیات فنی جهت عیب‌یابی در زیر درج شده است.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-left" dir="ltr">
                <div className="text-xs text-red-400 font-bold font-mono break-all mb-2">
                  Exception: {this.state.error?.toString() || "Unknown Error"}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-500 font-mono overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed border-t border-slate-900 pt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>

              <div className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                💡 <strong className="text-amber-400">راهکار رفع سریع:</strong> کلیک بر روی دکمه «بازنشانی کش و راه‌اندازی مجدد»، حافظه موقت برنامه در مرورگر شما را پاکسازی کرده و نشست جدیدی را با Active Directory راه‌اندازی می‌کند.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>بازنشانی کش و راه‌اندازی مجدد سامانه</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>بارگذاری مجدد صفحه</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
