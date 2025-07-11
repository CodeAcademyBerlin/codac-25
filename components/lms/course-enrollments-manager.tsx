'use client';

import { Users, Plus, UserMinus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { unenrollStudent, bulkEnrollStudents } from '@/actions/lms/manage-enrollment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getUsersForEnrollment } from '@/data/user/get-users-for-enrollment';

interface Course {
    id: string;
    title: string;
    enrollments: Array<{
        user: {
            id: string;
            name: string | null;
            email: string | null;
            avatar: string | null;
        };
    }>;
}

interface CourseEnrollmentsManagerProps {
    course: Course;
}

export function CourseEnrollmentsManager({ course }: CourseEnrollmentsManagerProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const loadAvailableUsers = async () => {
        try {
            const users = await getUsersForEnrollment();
            const enrolledUserIds = new Set(course.enrollments.map(e => e.user.id));
            const available = users.filter(user => !enrolledUserIds.has(user.id));
            setAvailableUsers(available);
        } catch {
            toast.error('Failed to load users');
        }
    };



    const handleBulkEnroll = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setIsLoading(true);
        try {
            const result = await bulkEnrollStudents(selectedUsers, course.id);

            if (result.success) {
                toast.success(result.message);
                setSelectedUsers([]);
                setShowAddDialog(false);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to enroll students');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnenrollStudent = async (userId: string) => {
        setIsLoading(true);
        try {
            const result = await unenrollStudent(userId, course.id);

            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to unenroll student');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEnrollments = course.enrollments.filter(enrollment => {
        const user = enrollment.user;
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    const filteredAvailableUsers = availableUsers.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Student Enrollments</span>
                        </CardTitle>
                        <CardDescription>
                            Manage student access to this course ({course.enrollments.length} enrolled)
                        </CardDescription>
                    </div>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={loadAvailableUsers}>
                                <Plus className="mr-2 h-4 w-4" />
                                Enroll Students
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Enroll Students</DialogTitle>
                                <DialogDescription>
                                    Select students to enroll in {course.title}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search students..."
                                        className="pl-10"
                                    />
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredAvailableUsers.map((user) => (
                                        <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedUsers([...selectedUsers, user.id]);
                                                    } else {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                    }
                                                }}
                                            />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar || undefined} />
                                                <AvatarFallback>
                                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="font-medium">{user.name || 'No Name'}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </div>
                                    ))}

                                    {filteredAvailableUsers.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {availableUsers.length === 0
                                                ? 'All students are already enrolled'
                                                : 'No students found matching your search'
                                            }
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        {selectedUsers.length} students selected
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBulkEnroll}
                                            disabled={isLoading || selectedUsers.length === 0}
                                        >
                                            {isLoading ? 'Enrolling...' : `Enroll ${selectedUsers.length} Students`}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search enrolled students..."
                            className="pl-10"
                        />
                    </div>

                    {/* Enrolled Students List */}
                    <div className="space-y-2">
                        {filteredEnrollments.map((enrollment) => (
                            <div key={enrollment.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src={enrollment.user.avatar || undefined} />
                                        <AvatarFallback>
                                            {enrollment.user.name?.charAt(0) || enrollment.user.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {enrollment.user.name || 'No Name'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {enrollment.user.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <UserMinus className="mr-2 h-4 w-4" />
                                                Unenroll
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Unenroll Student</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to unenroll {enrollment.user.name || enrollment.user.email} from {course.title}?
                                                    This will remove their access to the course and delete their progress.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleUnenrollStudent(enrollment.user.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Unenroll
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}

                        {filteredEnrollments.length === 0 && course.enrollments.length > 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No students found matching your search.
                            </div>
                        )}

                        {course.enrollments.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No students enrolled yet.</p>
                                <p className="text-sm">Use the &quot;Enroll Students&quot; button to add students to this course.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 