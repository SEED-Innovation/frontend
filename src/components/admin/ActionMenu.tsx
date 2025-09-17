import React from 'react';
import { MoreVertical, UserCheck, UserX, Users, Trash2, Settings, Building, Edit, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionMenuProps {
  user: any;
  userType: 'user' | 'manager';
  onEnableDisable: (user: any) => void;
  onChangeRole?: (user: any) => void;
  onAssignCourts?: (user: any) => void;
  onEdit?: (user: any) => void;
  onDelete: (user: any) => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  user,
  userType,
  onEnableDisable,
  onChangeRole,
  onAssignCourts,
  onEdit,
  onDelete
}) => {
  const isActive = user.status === 'Active';

  return (
    <div className="flex items-center gap-2">
      {/* Primary Action - Enable/Disable */}
      <Button
        variant={isActive ? "destructive" : "default"}
        size="sm"
        onClick={() => onEnableDisable(user)}
      >
        {isActive ? (
          <>
            <UserX className="w-4 h-4 mr-1" />
            Disable
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 mr-1" />
            Enable
          </>
        )}
      </Button>

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit {userType === 'user' ? 'User' : 'Admin'}
            </DropdownMenuItem>
          )}
          {userType === 'user' && onChangeRole && (
            <DropdownMenuItem onClick={() => onChangeRole(user)}>
              <Users className="w-4 h-4 mr-2" />
              Change Plan
            </DropdownMenuItem>
          )}
          {userType === 'manager' && onChangeRole && (
            <DropdownMenuItem onClick={() => onChangeRole(user)}>
              <Shield className="w-4 h-4 mr-2" />
              Change Role
            </DropdownMenuItem>
          )}
          {userType === 'manager' && onAssignCourts && (
            <DropdownMenuItem onClick={() => onAssignCourts(user)}>
              <Building className="w-4 h-4 mr-2" />
              Assign Courts
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(user)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};