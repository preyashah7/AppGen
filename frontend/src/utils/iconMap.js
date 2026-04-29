import React from 'react';
import {
  Users, Folder, CheckSquare, FileText,
  LayoutDashboard, Settings, Database,
  Globe, BarChart2, Zap, List, Calendar,
  Building, ShoppingBag, Coffee, CalendarCheck, Loader,
  CheckCircle, PlusCircle, Trash2, Upload, Bell,
  Layers, Package, Briefcase, CreditCard,
  Clock, Star, Tag, Mail, Phone,
  AlertCircle, Activity, TrendingUp, UserCheck,
  Archive, Bookmark, Flag
} from 'lucide-react';

export const iconMap = {
  Users, Folder, CheckSquare, FileText,
  LayoutDashboard, Settings, Database,
  Globe, BarChart2, Zap, List, Calendar,
  Building, ShoppingBag, Coffee, CalendarCheck, Loader,
  CheckCircle, PlusCircle, Trash2, Upload, Bell,
  Layers, Package, Briefcase, CreditCard,
  Clock, Star, Tag, Mail, Phone,
  AlertCircle, Activity, TrendingUp, UserCheck,
  Archive, Bookmark, Flag,
};

// add lowercase aliases for case-insensitive lookup
Object.keys(iconMap).forEach((k) => {
  const lk = k.toLowerCase();
  if (!iconMap[lk]) iconMap[lk] = iconMap[k];
});

export function DynamicIcon({ name, size = 16, ...props }) {
  if (!name) return null;
  const key = String(name).toLowerCase().replace(/[^a-z]/g, '');
  const Icon = iconMap[name] || iconMap[key] || Layers;
  return React.createElement(Icon, { size, ...props });
}

export default DynamicIcon;
