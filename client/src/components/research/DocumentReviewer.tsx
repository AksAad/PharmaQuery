import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, AlertTriangle, Lightbulb, Info } from 'lucide-react';

interface Annotation {
    tag: string;
    content: string;
    reasoning: string;
    position: { start: number; end: number };
}

interface DocumentReviewerProps {
    content: string;
    annotations: Annotation[];
}

export const DocumentReviewer: React.FC<DocumentReviewerProps> = ({ content, annotations }) => {
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'PLAGIARISED': return 'bg-destructive/20 text-destructive border-destructive/30';
            case 'SOUNDS LIKE AI GENERATED': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'WEAK ARGUMENT': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'STRONG INSIGHT': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'NOVEL CONTRIBUTION': return 'bg-primary/20 text-primary border-primary/30';
            default: return 'bg-secondary/20 text-secondary border-secondary/30';
        }
    };

    const getTagIcon = (tag: string) => {
        switch (tag) {
            case 'PLAGIARISED':
            case 'SOUNDS LIKE AI GENERATED': return <AlertTriangle className="h-3 w-3 mr-1" />;
            case 'STRONG INSIGHT':
            case 'NOVEL CONTRIBUTION': return <Lightbulb className="h-3 w-3 mr-1" />;
            default: return <Info className="h-3 w-3 mr-1" />;
        }
    };

    // Simple highlight renderer (for demo purposes)
    const renderContent = () => {
        let lastIndex = 0;
        const elements = [];

        // Sort annotations by position
        const sortedAnnotations = [...annotations].sort((a, b) => a.position.start - b.position.start);

        sortedAnnotations.forEach((anno, i) => {
            // Add text before highlight
            elements.push(content.substring(lastIndex, anno.position.start));

            // Add highlighted segment
            elements.push(
                <TooltipProvider key={`anno-${i}`}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span
                                className={`cursor-pointer underline decoration-dotted underline-offset-4 transition-colors ${getTagColor(anno.tag).split(' ')[0]} p-0.5 rounded`}
                                onClick={() => setSelectedAnnotation(anno)}
                            >
                                {content.substring(anno.position.start, anno.position.end)}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-4">
                            <div className="flex flex-col gap-2">
                                <Badge variant="outline" className={getTagColor(anno.tag)}>
                                    {getTagIcon(anno.tag)}
                                    {anno.tag}
                                </Badge>
                                <p className="text-sm font-medium">{anno.reasoning}</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );

            lastIndex = anno.position.end;
        });

        // Add remaining text
        elements.push(content.substring(lastIndex));

        return elements;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">
            <Card className="lg:col-span-2 p-8 overflow-y-auto bg-card/30 backdrop-blur-sm border-border/50">
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground">
                    <div className="whitespace-pre-wrap font-serif text-lg leading-loose selection:bg-primary/30">
                        {renderContent()}
                    </div>
                </div>
            </Card>

            <Card className="p-6 border-border/50 bg-card/20 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Detailed Review</h3>
                </div>

                {selectedAnnotation ? (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Badge variant="outline" className={`w-fit py-1 px-3 ${getTagColor(selectedAnnotation.tag)}`}>
                            {getTagIcon(selectedAnnotation.tag)}
                            {selectedAnnotation.tag}
                        </Badge>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Segment</h4>
                                <p className="text-foreground italic bg-accent/30 p-3 rounded-md border-l-4 border-primary">
                                    "{selectedAnnotation.content}"
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Academic Reasoning</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    {selectedAnnotation.reasoning}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    The evaluation engine detected this pattern with high statistical significance.
                                    Consider addressing this to improve your paper's IEEE-level publication rigor.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                        <Info className="h-10 w-10 mb-4 opacity-20" />
                        <p className="max-w-[200px]">Click a highlighted segment to see detailed academic reasoning.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
