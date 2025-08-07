'use client';

import { Bot, BookOpen, GraduationCap, HelpCircle, Lightbulb } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
    userName: string;
    onSuggestionClick: (suggestion: string) => void;
}

const welcomeSuggestions = [
    {
        icon: BookOpen,
        title: "Course Overview",
        question: "What courses are available in this program?",
        description: "Get an overview of all available courses and their structure"
    },
    {
        icon: GraduationCap,
        title: "Getting Started",
        question: "How do I get started with my learning journey?",
        description: "Learn about the best way to begin your studies"
    },
    {
        icon: Lightbulb,
        title: "Study Tips",
        question: "What are some effective study strategies for this program?",
        description: "Discover proven techniques to maximize your learning"
    },
    {
        icon: HelpCircle,
        title: "Assignment Help",
        question: "How do I approach the assignments in this course?",
        description: "Get guidance on tackling your coursework effectively"
    }
];

export function WelcomeScreen({ userName, onSuggestionClick }: WelcomeScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Bot className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-muted-foreground max-w-md">
                    I'm your AI learning assistant. I can help you with questions about your courses,
                    assignments, and learning materials. What would you like to know?
                </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {welcomeSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                        <Card
                            key={index}
                            className="cursor-pointer transition-all hover:shadow-md hover:scale-105 group"
                            onClick={() => onSuggestionClick(suggestion.question)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-sm mb-1">
                                            {suggestion.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {suggestion.description}
                                        </p>
                                        <p className="text-xs font-medium text-primary group-hover:text-primary/80 transition-colors">
                                            "{suggestion.question}"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Additional Info */}
            <div className="mt-8 max-w-md">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="h-1 w-1 rounded-full bg-green-500" />
                    <span>AI Assistant is online and ready to help</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    I have access to all your course materials, lessons, and assignments.
                    Feel free to ask specific questions or request explanations on any topic.
                </p>
            </div>
        </div>
    );
}
