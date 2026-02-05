export const formatters = {
  // Format currency values
  currency: (amount: number, currency: string = 'ETH'): string => {
    return `${amount.toFixed(4)} ${currency}`;
  },

  // Format large numbers
  number: (num: number): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Format dates
  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  // Format time
  time: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Format relative time
  relativeTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return formatters.date(d);
  },

  // Format file sizes
  fileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Format wallet address
  address: (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Format percentage
  percentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  },

  // Truncate text
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  // Format code for display
  code: (code: string, language?: string): string => {
    // Simple formatting - in a real app you'd use a proper syntax highlighter
    return code.trim();
  },

  // Format subscription status
  subscriptionStatus: (expiry: Date | string): { 
    status: 'active' | 'expiring' | 'expired'; 
    daysLeft: number;
    message: string;
  } => {
    const expiryDate = typeof expiry === 'string' ? new Date(expiry) : expiry;
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return {
        status: 'expired',
        daysLeft: 0,
        message: 'Subscription expired'
      };
    } else if (daysLeft <= 7) {
      return {
        status: 'expiring',
        daysLeft,
        message: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
      };
    } else {
      return {
        status: 'active',
        daysLeft,
        message: `Active for ${daysLeft} more days`
      };
    }
  },
};