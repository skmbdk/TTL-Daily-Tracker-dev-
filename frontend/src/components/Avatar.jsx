import { getInitials } from '../lib/utils';
import { User } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

const Avatar = ({ name, imageUrl, size = 'md', className }) => {
  const initials = getInitials(name);
  const { isLight } = useTheme();

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-12 w-12 text-base',
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'User avatar'}
        className={clsx(
          'rounded-full object-cover border',
          isLight ? 'border-slate-300' : 'border-slate-700',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-bold border transition-colors shrink-0',
        isLight
          ? 'border-slate-300 bg-slate-100 text-slate-700 shadow-sm'
          : 'border-slate-700 bg-slate-800 text-slate-200',
        sizeClasses[size],
        className
      )}
    >
      {initials ? initials : <User size={size === 'sm' ? 12 : 16} className="opacity-70" />}
    </div>
  );
};

export default Avatar;
