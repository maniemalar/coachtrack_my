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
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#081F63] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-teal-400 fill-teal-400/20 animate-pulse" />
            <div>
              <h3 className="font-sans font-black text-base tracking-tight">{title}</h3>
              <p className="text-[10px] text-teal-200 font-medium">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider font-sans">New Notifications</span>
            <button 
              onClick={onClearAll}
              className="text-2xs font-black text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 cursor-pointer transition hover:bg-rose-100"
            >
              Clear All
            </button>
          </div>

          {/* Sample Log Feeds */}
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl text-left transition relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${stripeColor}`} />
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="block text-xs font-black text-slate-800 leading-tight mb-1">{notif.title}</span>
                      <span className="block text-2xs text-slate-500 font-medium leading-relaxed">{notif.body}</span>
                      <span className="block text-[9px] text-slate-400 font-mono font-bold mt-2">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">No new notifications.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
