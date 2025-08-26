// ================================
// 📅 DATE FORMATTING
// ================================

export const formatDateTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateOnly = (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatTimeOnly = (dateTime: string): string => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const formatTimeRange = (start: string, end: string): string => {
    const startTime = formatTimeOnly(start);
    const endTime = formatTimeOnly(end);
    return `${startTime} - ${endTime}`;
};

export const formatRelativeTime = (dateTime: string): string => {
    const now = new Date();
    const date = new Date(dateTime);
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
};

// ================================
// 📅 DATE CALCULATIONS
// ================================

export const isToday = (dateString: string): boolean => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
};

export const isTomorrow = (dateString: string): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(dateString);
    return date.toDateString() === tomorrow.toDateString();
};

export const isUpcoming = (dateString: string): boolean => {
    const now = new Date();
    const date = new Date(dateString);
    return date > now;
};

export const getWeekStart = (date: Date = new Date()): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
};

export const getWeekEnd = (date: Date = new Date()): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
};

export const getMonthStart = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getMonthEnd = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// ================================
// 🕐 TIME SLOTS
// ================================

export const generateTimeSlots = (
    startHour: number = 8,
    endHour: number = 22,
    intervalMinutes: number = 60
): string[] => {
    const slots: string[] = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }
    
    return slots;
};

export const isValidTimeSlot = (time: string, date: string): boolean => {
    const now = new Date();
    const slotDateTime = new Date(`${date}T${time}`);
    return slotDateTime > now;
};