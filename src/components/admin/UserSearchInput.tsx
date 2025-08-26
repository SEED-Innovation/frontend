import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Search,
    User,
    Mail,
    Phone,
    Check,
    ChevronsUpDown,
    X,
    Loader2
} from 'lucide-react';

import { UserResponse } from '@/types/user';
import { userService } from '@/services';
import { cn } from '@/lib/utils';

interface UserSearchInputProps {
    onUserSelect: (user: UserResponse) => void;
    selectedUser?: UserResponse | null;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

interface UserSearchState {
    open: boolean;
    loading: boolean;
    searchTerm: string;
    users: UserResponse[];
    recentUsers: UserResponse[];
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({
    onUserSelect,
    selectedUser = null,
    placeholder = "Search for a user...",
    className = "",
    disabled = false,
    allowClear = true
}) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [state, setState] = useState<UserSearchState>({
        open: false,
        loading: false,
        searchTerm: '',
        users: [],
        recentUsers: []
    });

    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    // ================================
    // 🔄 EFFECTS
    // ================================
    
    useEffect(() => {
        // Load recent users on component mount
        loadRecentUsers();
        
        // Cleanup timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Debounced search when search term changes
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (state.searchTerm.trim().length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                searchUsers(state.searchTerm);
            }, 300);
        } else {
            setState(prev => ({ ...prev, users: [] }));
        }
    }, [state.searchTerm]);

    // ================================
    // 🔧 DATA LOADING FUNCTIONS
    // ================================
    
    const loadRecentUsers = async () => {
        try {
            console.log('📋 Loading recent users...');
            
            // Load recently active users or frequently booked users
            const recentUsers = await userService.getRecentUsers();
            
            setState(prev => ({ 
                ...prev, 
                recentUsers: recentUsers.slice(0, 5) // Limit to 5 recent users
            }));
            
            console.log('✅ Recent users loaded:', recentUsers);
            
        } catch (error) {
            console.error('❌ Failed to load recent users:', error);
            
            // Fallback to empty array
            setState(prev => ({ ...prev, recentUsers: [] }));
        }
    };

    const searchUsers = async (searchTerm: string) => {
        setState(prev => ({ ...prev, loading: true }));
        
        try {
            console.log('🔍 Searching users:', searchTerm);
            
            const users = await userService.searchUsers({
                query: searchTerm,
                limit: 10
            });
            
            setState(prev => ({ 
                ...prev, 
                users: users,
                loading: false 
            }));
            
            console.log('✅ Users found:', users);
            
        } catch (error) {
            console.error('❌ Failed to search users:', error);
            
            setState(prev => ({ 
                ...prev, 
                users: [],
                loading: false 
            }));
        }
    };

    // ================================
    // 🎯 EVENT HANDLERS
    // ================================
    
    const handleSearchChange = (value: string) => {
        setState(prev => ({ ...prev, searchTerm: value }));
    };

    const handleUserSelect = (user: UserResponse) => {
        console.log('👤 User selected:', user);
        
        onUserSelect(user);
        
        setState(prev => ({ 
            ...prev, 
            open: false,
            searchTerm: '',
            users: []
        }));

        // Add to recent users (avoid duplicates)
        setState(prev => ({
            ...prev,
            recentUsers: [
                user,
                ...prev.recentUsers.filter(u => u.id !== user.id)
            ].slice(0, 5)
        }));
    };

    const handleClearSelection = () => {
        console.log('🗑️ Clearing user selection');
        
        // Create empty user to clear selection
        onUserSelect({} as UserResponse);
        
        setState(prev => ({ 
            ...prev, 
            searchTerm: '',
            users: []
        }));
        
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleOpenChange = (open: boolean) => {
        setState(prev => ({ ...prev, open }));
        
        if (!open) {
            setState(prev => ({ 
                ...prev, 
                searchTerm: '',
                users: []
            }));
        }
    };

    // ================================
    // 🔧 HELPER FUNCTIONS
    // ================================
    
    const getUserDisplayName = (user: UserResponse) => {
        return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    };

    const getUserInitials = (user: UserResponse) => {
        const fullName = getUserDisplayName(user);
        return fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const highlightMatch = (text: string, searchTerm: string) => {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
                    {part}
                </span>
            ) : part
        );
    };

    // ================================
    // 🎨 RENDER METHODS
    // ================================
    
    const renderUserItem = (user: UserResponse, isRecent = false) => {
        const displayName = getUserDisplayName(user);
        const initials = getUserInitials(user);
        
        return (
            <CommandItem
                key={`${isRecent ? 'recent' : 'search'}-${user.id}`}
                value={`${user.id}-${displayName}-${user.email}`}
                onSelect={() => handleUserSelect(user)}
                className="flex items-center space-x-3 p-3 cursor-pointer"
            >
                <Avatar className="h-8 w-8">
                    <AvatarImage 
                        src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} 
                    />
                    <AvatarFallback className="text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm truncate">
                            {state.searchTerm ? 
                                highlightMatch(displayName, state.searchTerm) : 
                                displayName
                            }
                        </p>
                        {isRecent && (
                            <Badge variant="secondary" className="text-xs">
                                Recent
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate">
                            {state.searchTerm ? 
                                highlightMatch(user.email, state.searchTerm) : 
                                user.email
                            }
                        </span>
                    </div>
                    
                    {user.phone && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{user.phone}</span>
                        </div>
                    )}
                </div>
                
                <Check className={cn(
                    "ml-auto h-4 w-4",
                    selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                )} />
            </CommandItem>
        );
    };

    const renderSelectedUser = () => {
        if (!selectedUser || !selectedUser.id) return null;
        
        const displayName = getUserDisplayName(selectedUser);
        const initials = getUserInitials(selectedUser);
        
        return (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Avatar className="h-8 w-8">
                    <AvatarImage 
                        src={selectedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} 
                    />
                    <AvatarFallback className="text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-blue-900 truncate">
                        {displayName}
                    </p>
                    <div className="flex items-center text-xs text-blue-600 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate">{selectedUser.email}</span>
                    </div>
                </div>
                
                {allowClear && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>
        );
    };

    const renderSearchContent = () => {
        const hasResults = state.users.length > 0;
        const hasRecentUsers = state.recentUsers.length > 0;
        const isSearching = state.searchTerm.length >= 2;
        
        return (
            <Command>
                <CommandInput
                    ref={inputRef}
                    placeholder={placeholder}
                    value={state.searchTerm}
                    onValueChange={handleSearchChange}
                    className="h-9"
                />
                
                <CommandList className="max-h-[300px]">
                    {state.loading && (
                        <div className="flex items-center justify-center p-6">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Searching users...</span>
                        </div>
                    )}
                    
                    {!state.loading && isSearching && !hasResults && (
                        <CommandEmpty>
                            <div className="text-center p-6">
                                <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No users found</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Try searching with a different term
                                </p>
                            </div>
                        </CommandEmpty>
                    )}
                    
                    {hasResults && (
                        <CommandGroup heading={`Search Results (${state.users.length})`}>
                            {state.users.map(user => renderUserItem(user, false))}
                        </CommandGroup>
                    )}
                    
                    {!isSearching && hasRecentUsers && (
                        <CommandGroup heading="Recent Users">
                            {state.recentUsers.map(user => renderUserItem(user, true))}
                        </CommandGroup>
                    )}
                    
                    {!isSearching && !hasRecentUsers && (
                        <div className="text-center p-6">
                            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Start typing to search users</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Enter at least 2 characters
                            </p>
                        </div>
                    )}
                </CommandList>
            </Command>
        );
    };

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    // If user is selected, show selected user display
    if (selectedUser && selectedUser.id) {
        return (
            <div className={className}>
                {renderSelectedUser()}
            </div>
        );
    }

    // Otherwise show search input
    return (
        <div className={className}>
            <Popover open={state.open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={state.open}
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        <div className="flex items-center">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <span className="truncate">
                                {selectedUser ? getUserDisplayName(selectedUser) : placeholder}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-full p-0" align="start">
                    {renderSearchContent()}
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default UserSearchInput;