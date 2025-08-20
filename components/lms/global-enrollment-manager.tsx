'use client';

import { Users, Plus, Search, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { bulkEnrollStudents } from '@/actions/lms/manage-enrollment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsersForEnrollment } from '@/data/user/get-users-for-enrollment';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    role: string;
    cohort: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface Course {
    id: string;
    title: string;
    category: string;
    _count: {
        enrollments: number;
    };
}

interface GlobalEnrollmentManagerProps {
    courses: Course[];
}

export function GlobalEnrollmentManager({ courses }: GlobalEnrollmentManagerProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showBulkEnrollDialog, setShowBulkEnrollDialog] = useState(false);

    const loadAvailableUsers = async () => {
        try {
            const users = await getUsersForEnrollment();
            // Filter to only show students, alumni, etc. (non-staff)
            const students = users.filter(user => ['STUDENT', 'ALUMNI'].includes(user.role));
            setAvailableUsers(students);
        } catch {
            toast.error('Failed to load users');
        }
    };

    const handleBulkEnroll = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        if (!selectedCourse) {
            toast.error('Please select a course');
            return;
        }

        setIsLoading(true);
        try {
            const result = await bulkEnrollStudents(selectedUsers, selectedCourse);

            if (result.success) {
                toast.success(result.message);
                setSelectedUsers([]);
                setSelectedCourse('');
                setShowBulkEnrollDialog(false);
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

    const filteredUsers = availableUsers.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    const publishedCourses = courses.filter(course => course.title); // Assuming all fetched courses are available

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center space-x-2">
                            <UserPlus className="h-5 w-5" />
                            <span>Bulk Enrollment</span>
                        </CardTitle>
                        <CardDescription>
                            Enroll multiple students into courses at once
                        </CardDescription>
                    </div>
                    <Dialog open={showBulkEnrollDialog} onOpenChange={setShowBulkEnrollDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={loadAvailableUsers}>
                                <Plus className="mr-2 h-4 w-4" />
                                Bulk Enroll Students
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Bulk Enroll Students</DialogTitle>
                                <DialogDescription>
                                    Select students and a course to enroll them all at once.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Course Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Course</label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a course..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {publishedCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    <div className="flex items-center space-x-2">
                                                        <span>{course.title}</span>
                                                        <Badge variant="outline" className="ml-auto">
                                                            {course.category.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({course._count.enrollments} enrolled)
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Student Selection */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Select Students</label>
                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedUsers(filteredUsers.map(u => u.id))}
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedUsers([])}
                                            >
                                                Clear All
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search students..."
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                                        {filteredUsers.map((user) => (
                                            <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
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
                                                <div className="flex space-x-1">
                                                    <Badge variant="outline">{user.role}</Badge>
                                                    {user.cohort && (
                                                        <Badge variant="secondary">{user.cohort.name}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {filteredUsers.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                {availableUsers.length === 0
                                                    ? 'No students found'
                                                    : 'No students found matching your search'
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        {selectedUsers.length} students selected
                                        {selectedCourse && (
                                            <span className="ml-2">
                                                for {publishedCourses.find(c => c.id === selectedCourse)?.title}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" onClick={() => setShowBulkEnrollDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBulkEnroll}
                                            disabled={isLoading || selectedUsers.length === 0 || !selectedCourse}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {publishedCourses.map((course) => (
                        <div key={course.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold">{course.title}</h4>
                                    <Badge variant="outline" className="mt-1">
                                        {course.category.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    {course._count.enrollments} students enrolled
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCourse(course.id);
                                        setShowBulkEnrollDialog(true);
                                        loadAvailableUsers();
                                    }}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Enroll
                                </Button>
                            </div>
                        </div>
                    ))}

                    {publishedCourses.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No courses available for enrollment.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 