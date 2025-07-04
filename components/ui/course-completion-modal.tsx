'use client';

import { Award, CheckCircle, Trophy, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { useConfetti } from './confetti';

interface CourseCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    courseDuration?: string;
    totalLessons?: number;
}

export function CourseCompletionModal({
    isOpen,
    onClose,
    courseTitle,
    courseDuration,
    totalLessons,
}: CourseCompletionModalProps) {
    const { celebrate } = useConfetti();
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Delay the celebration to make it more dramatic
        const timer = setTimeout(() => {
            celebrate();
            setShowCelebration(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [isOpen, celebrate]);

    const handleClose = () => {
        setShowCelebration(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <Trophy className="h-16 w-16 text-yellow-500" />
                                {showCelebration && (
                                    <div className="absolute -top-2 -right-2 animate-bounce">
                                        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-center">
                            🎉 Congratulations! 🎉
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-lg font-semibold">Course Completed!</span>
                        </div>

                        <div className="text-muted-foreground">
                            You've successfully completed
                        </div>

                        <div className="text-xl font-bold text-primary">
                            {courseTitle}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 py-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                                <Award className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="text-sm text-muted-foreground">Achievement</div>
                            <div className="font-semibold">Course Master</div>
                        </div>

                        {totalLessons && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {totalLessons}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Lessons Completed
                                </div>
                            </div>
                        )}

                        {courseDuration && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {courseDuration}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Course Duration
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
                        <div className="text-center space-y-2">
                            <div className="font-semibold text-lg">
                                What's Next?
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Continue your learning journey with more courses, connect with mentors,
                                or share your achievement with the community!
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Close
                    </Button>
                    <Button
                        onClick={handleClose}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        Continue Learning
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 