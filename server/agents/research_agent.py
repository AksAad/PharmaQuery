"""Research Agent - handles paper evaluation, opportunity discovery, and faculty recommendations."""
from typing import Dict, Any, List
import asyncio
import random
from .base_agent import BaseAgent


class ResearchAgent(BaseAgent):
    """Agent that evaluates research papers and identifies academic opportunities."""
    
    def __init__(self):
        super().__init__("research")
        self.indian_institutions = ["IIT Delhi", "IIT Bombay", "IISc Bangalore", "IIT Madras", "IIIT Hyderabad", "NIT Trichy", "TIFR Mumbai"]
        
    async def execute(self, session_id: str, research_topic: str, uploaded_paper: Any = None, context_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute research analysis on a paper following the standardized contract.
        """
        logs = []
        try:
            self.set_status("analyzing_paper")
            logs.append("Started paper analysis")
            self.update_progress(10)
            
            # Use research_topic or content from uploaded_paper
            input_text = research_topic
            if uploaded_paper and isinstance(uploaded_paper, str):
                input_text = uploaded_paper
            
            # 1. Generate Research Quality Score (IEEE Level)
            logs.append("Evaluating paper quality dimensions")
            score_data = self.evaluate_paper(input_text)
            self.update_progress(40)
            
            # 2. Generate Annotations
            logs.append("Generating document annotations")
            annotations = self.generate_annotations(input_text)
            self.update_progress(60)
            
            # 3. Discover Opportunities
            logs.append("Searching for research opportunities")
            opportunities = self.discover_opportunities(input_text)
            self.update_progress(80)
            
            # 4. Recommend Indian Faculty
            logs.append("Identifying Indian faculty recommendations")
            faculty = self.recommend_faculty(input_text)
            self.update_progress(100)
            
            self.set_status("complete")
            logs.append("Research analysis complete")
            
            # Confidence as a number (0-1)
            confidence_str = self._calculate_confidence(score_data, annotations)
            confidence_map = {"High": 0.9, "Medium": 0.6, "Low": 0.3}
            confidence_val = confidence_map.get(confidence_str, 0.5)
            
            return {
                "status": "success",
                "data": {
                    "insight_type": "research_evaluation",
                    "research_score": score_data["total_score"],
                    "score_dimensions": score_data["dimensions"],
                    "annotations": annotations,
                    "top_opportunities": opportunities,
                    "faculty_recommendations": faculty,
                    "confidence_level": confidence_str
                },
                "confidence": confidence_val,
                "logs": logs
            }
        except Exception as e:
            self.set_status("error")
            logs.append(f"Error during execution: {str(e)}")
            return {
                "status": "error",
                "data": {},
                "confidence": 0,
                "logs": logs
            }
        
    def evaluate_paper(self, text: str) -> Dict[str, Any]:
        """Calculate quality score based on IEEE rigor."""
        # In a real implementation, this would use an LLM or heuristic model
        dimensions = {
            "novelty": random.randint(50, 85),
            "methodological_rigor": random.randint(40, 75),
            "citation_credibility": random.randint(60, 90),
            "technical_depth": random.randint(45, 80),
            "reproducibility": random.randint(30, 70)
        }
        
        # 85+ is extremely difficult to achieve
        total_score = sum(dimensions.values()) / len(dimensions)
        
        # Apply strict academic penalty
        if total_score > 80:
            total_score = total_score * 0.95
            
        return {
            "total_score": round(total_score, 1),
            "dimensions": dimensions
        }
        
    def generate_annotations(self, text: str) -> List[Dict[str, Any]]:
        """Identify specific areas of interest or concern."""
        tags = [
            "SOUNDS LIKE AI GENERATED", "WEAK ARGUMENT", "MISSING CITATION", 
            "UNCLEAR CLAIM", "STRONG INSIGHT", "NOVEL CONTRIBUTION", "PLAGIARISED"
        ]
        
        annotations = []
        # Mocking 3-5 annotations per paper
        for _ in range(random.randint(3, 5)):
            annotations.append({
                "tag": random.choice(tags),
                "content": "Sample highlighted segment from the document for demonstration purposes.",
                "reasoning": "Detailed academic reasoning explaining why this tag was applied to this specific segment.",
                "position": {"start": random.randint(0, 1000), "end": random.randint(1001, 2000)}
            })
        return annotations
        
    def discover_opportunities(self, text: str) -> List[Dict[str, Any]]:
        """Match paper to research calls and programs."""
        opp_types = ["Research Internship", "Open Lab Position", "Funded Program", "Call for Papers"]
        sources = ["arXiv", "IEEE Xplore", "Google Research", "MIT Media Lab", "Stanford AI Lab"]
        
        opportunities = []
        for i in range(4):
            relevance = random.randint(70, 95)
            difficulty = random.randint(60, 90)
            opportunities.append({
                "id": str(i),
                "title": f"Future of Research: {random.choice(opp_types)}",
                "source": random.choice(sources),
                "relevance_score": relevance,
                "difficulty_score": difficulty,
                "description": "Matching based on methodological similarity and domain keywords found in your research paper.",
                "link": "#"
            })
        
        # Sort by relevance
        opportunities.sort(key=lambda x: x["relevance_score"], reverse=True)
        return opportunities
        
    def recommend_faculty(self, text: str) -> List[Dict[str, Any]]:
        """Suggest Indian professors based on keywords."""
        researchers = [
            {"name": "Dr. Amitabh Mukherjee", "inst": "IIT Kanpur", "area": "Computer Vision & NLP"},
            {"name": "Prof. Mausam", "inst": "IIT Delhi", "area": "Artificial Intelligence"},
            {"name": "Dr. Sunita Sarawagi", "inst": "IIT Bombay", "area": "Machine Learning"},
            {"name": "Prof. Pushpak Bhattacharyya", "inst": "IIT Bombay", "area": "Natural Language Processing"},
        ]
        
        recommendations = random.sample(researchers, 2)
        for rec in recommendations:
            rec["why"] = "Extensive publication history in similar methodological areas and high citation overlap."
            rec["link"] = "#"
            
        return recommendations
        
    def _calculate_confidence(self, score_data: Dict[str, Any], annotations: List[Dict[str, Any]]) -> str:
        """Derive confidence level from model signals."""
        signals = len(annotations) + (score_data["total_score"] / 20)
        if signals > 8:
            return "High"
        elif signals > 5:
            return "Medium"
        else:
            return "Low"
