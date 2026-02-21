import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trophy,
    MapPin,
    Users,
    Briefcase,
    GraduationCap,
    ArrowLeft,
    ShieldCheck,
    Download,
    Share2,
    ChevronRight,
    ExternalLink,
    Target
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { DocumentReviewer } from '@/components/research/DocumentReviewer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from 'sonner';

// Placeholder content for demo
const MOCK_PAPER_CONTENT = `ABSTRACT
This research explores the intersection of transformer architectures and drug discovery pipelines. 
We propose a novel attention-based mechanism for predicting binding affinity with higher accuracy.

INTRODUCTION
The pharmaceutical industry faces challenges in lead optimization. Traditional methods are computationally expensive. 
Our methodological rigor ensures reproducibility through extensive cross-validation on the ZINC dataset.

RESULTS
We achieved a mean absolute error of 0.23, which is a 15% improvement over baseline models. 
However, the citation credibility of previous works in this niche remains mixed, 
requiring a deeper technical depth in analysis.

CONCLUSION
The study signals a strong insight into how self-attention can capture spatial features of small molecules.`;

export default function ResearchEvaluation() {
    const { analysisId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        if (!analysisId) return;

        const fetchData = async () => {
            try {
                const result = await apiClient.getResearchStatus(analysisId);

                if (result.status === 'processing') {
                    // Poll after 2 seconds
                    setTimeout(fetchData, 2000);
                    return;
                }

                setData(result);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analysis:", error);
                toast.error("Failed to load analysis results. Please ensure the backend is running.");
            }
        };
        fetchData();
    }, [analysisId]);

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Running IEEE-Level Evaluation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Navbar />

            <main className="container pt-24 pb-20 px-4 md:px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-border/50">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 text-muted-foreground hover:text-foreground"
                            onClick={handleExit}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Exit Review
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Research Analysis Report</h1>
                        <p className="text-muted-foreground">Analysis ID: <span className="font-mono text-xs">{analysisId}</span></p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="group">
                            <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                            PDF Report
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Left Column: Scoring & Document View */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* Scoring Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="bg-primary/5 border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Trophy className="h-16 w-16" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quality Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-5xl font-black text-primary mb-2">{data.research_score}</div>
                                    <Progress value={data.research_score} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3 text-green-500" />
                                        IEEE Rigor Level: {data.research_score > 75 ? 'Excellent' : 'Strong'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Dimensions */}
                            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-1 text-xs font-semibold text-muted-foreground uppercase">Evaluation Dimensions</CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 py-4">
                                    {Object.entries(data.score_dimensions).map(([key, value]: [string, any]) => (
                                        <div key={key} className="space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="capitalize">{key.replace('_', ' ')}</span>
                                                <span className="font-medium">{value}%</span>
                                            </div>
                                            <Progress value={value} className="h-1" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Tabs for Analysis */}
                        <Tabs defaultValue="document" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/20 p-1">
                                <TabsTrigger value="document" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Document Review</TabsTrigger>
                                <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Opportunities</TabsTrigger>
                                <TabsTrigger value="faculty" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Suggested Faculty</TabsTrigger>
                            </TabsList>

                            <TabsContent value="document" className="animate-in fade-in duration-500">
                                <DocumentReviewer content={MOCK_PAPER_CONTENT} annotations={data.annotations} />
                            </TabsContent>

                            <TabsContent value="opportunities" className="animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {data.top_opportunities.map((opp: any) => (
                                        <Card key={opp.id} className="hover:border-primary/50 transition-colors group">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <Badge variant="secondary" className="mb-2">{opp.source}</Badge>
                                                    <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                                        <Target className="h-3 w-3" />
                                                        {opp.relevance_score}% Match
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{opp.title}</CardTitle>
                                                <CardDescription>{opp.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Difficulty: {opp.difficulty_score}</span>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                                                        View Details <ChevronRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="faculty" className="animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 gap-6">
                                    {data.faculty_recommendations.map((faculty: any, idx: number) => (
                                        <Card key={idx} className="flex flex-col md:flex-row p-0 overflow-hidden bg-card/50">
                                            <div className="md:w-1/3 bg-primary/5 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border">
                                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                    <Users className="h-10 w-10 text-primary" />
                                                </div>
                                                <h3 className="text-xl font-bold">{faculty.name}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                                    <MapPin className="h-3 w-3" /> {faculty.inst}
                                                </p>
                                            </div>
                                            <div className="flex-1 p-8">
                                                <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1">{faculty.area}</Badge>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Why Recommended?</h4>
                                                        <p className="text-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                                            "{faculty.why}"
                                                        </p>
                                                    </div>
                                                    <Button size="sm" variant="outline" asChild className="mt-4">
                                                        <a href={faculty.link} target="_blank" rel="noopener noreferrer">
                                                            View Lab Profile <ExternalLink className="ml-2 h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column: Confidence & Meta */}
                    <div className="space-y-6">
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Confidence Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold flex items-center gap-2 ${data.confidence_level === 'High' ? 'text-green-500' :
                                    data.confidence_level === 'Medium' ? 'text-yellow-500' : 'text-destructive'
                                    }`}>
                                    <ShieldCheck className="h-6 w-6" />
                                    {data.confidence_level}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    Derived from model certainty (89%), citation coverage, and scientific coherence signals.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Peer Review Logic</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <GraduationCap className="h-3 w-3 text-secondary" />
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        "Scoring philosophy aligns with IEEE Publication guidelines. 85+ represents top 0.1% of submissions."
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-4">
                                        This is a human feedback assistant. AI signals are intended to guide refinement, not serve as absolute final judgment.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Exit Confidence Modal */}
            <Dialog open={showExitModal} onOpenChange={setShowExitModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Review Confidence Level</DialogTitle>
                        <DialogDescription>
                            Based on the current evaluation, the system has {data.confidence_level.toLowerCase()} confidence in these findings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center gap-4 text-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${data.confidence_level === 'High' ? 'bg-green-500/10 text-green-500' :
                            data.confidence_level === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'
                            }`}>
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">{data.confidence_level} Confidence Tag</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This indicates the reliability of the AI's judgment based on the provided document clarity and data completeness.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExitModal(false)}>Continue Review</Button>
                        <Button onClick={confirmExit}>Confirm & Exit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
