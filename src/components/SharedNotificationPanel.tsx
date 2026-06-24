import { Bell, X } from 'lucide-react';
import { motion } from 'motion/react';

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  type: string;
}

interface SharedNotificationPanelProps {
  onClose: () => void;
  onClearAll: () => void;
  notifications: NotificationItem[];
  theme: 'trainer' | 'trainee';
  title?: string;
  subtitle?: string;
}

export function SharedNotificationPanel({
  onClose,
  onClearAll,
  notifications,
  theme,
  title = "Recent Activity Alerts",
  subtitle = theme === 'trainer' ? "Synchronized with Trainee Profile" : "Synchronized with Coach Sarah Tan",
}: SharedNotificationPanelProps) {
  const stripeColor = theme === 'trainer' ? 'bg-[#081F63]' : 'bg-teal-500';

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10, x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, y: -10, x: '-50%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden text-left"
        style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          width: 'min(92vw, 430px)',
          maxHeight: 'calc(100vh - 110px)',
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-[#081F63] text-white shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400 fill-teal-400/20 animate-pulse" />
            <div>
              <h3 className="font-sans font-black text-xs sm:text-sm tracking-tight">{title}</h3>
              <p className="text-[9px] text-teal-200 font-medium">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">New Notifications</span>
            <button 
              onClick={onClearAll}
              className="text-[10px] font-black text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100 cursor-pointer transition hover:bg-rose-100"
            >
              Clear All
            </button>
          </div>

          {/* Sample Log Feeds */}
          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl text-left transition relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${stripeColor}`} />
                  <div className="flex justify-between items-start gap-2.5 pl-1.5">
                    <div>
                      <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight mb-0.5">{notif.title}</span>
                      <span className="block text-[10px] sm:text-[11px] text-slate-500 font-medium leading-relaxed">{notif.body}</span>
                      <span className="block text-[8px] text-slate-400 font-mono font-bold mt-1">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 py-6 text-center font-medium">No new notifications.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
