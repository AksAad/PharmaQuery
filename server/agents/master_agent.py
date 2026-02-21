"""Master Agent - orchestrates workflow and coordinates worker agents."""
from typing import Dict, Any, List
import asyncio
from .market_agent import MarketAgent
from .patent_agent import PatentAgent
from .clinical_agent import ClinicalAgent
from .literature_agent import LiteratureAgent
from database import Database


class MasterAgent:
    """Master agent that interprets queries and orchestrates worker agents."""
    
    def __init__(self):
        self.status = "idle"
        self.workflow_memory = {}
        self.market_agent = MarketAgent()
        self.patent_agent = PatentAgent()
        self.clinical_agent = ClinicalAgent()
        self.literature_agent = LiteratureAgent()
    
    async def execute(self, query: str, analysis_id: str) -> Dict[str, Any]:
        """
        Execute the complete workflow:
        1. Interpret query
        2. Break into sub-tasks
        3. Assign to worker agents
        4. Aggregate results
        """
        self.status = "orchestrating"
        
        # Step 1: Interpret query and create workflow plan
        workflow_plan = self._interpret_query(query)
        self.workflow_memory = {
            "query": query,
            "plan": workflow_plan,
            "status": "orchestrating",
            "agents_assigned": []
        }
        
        # Save workflow state
        Database.save_master_workflow(analysis_id, self.workflow_memory)
        
        # Step 2: Execute worker agents in parallel (except market which needs other agents' data)
        self.status = "executing"
        
        # First, run patent, clinical, and literature agents
        # Pass (session_id=analysis_id, research_topic=query, context_data=workflow_plan)
        independent_agent_tasks = {
            "patent": self.patent_agent.execute(analysis_id, query, context_data=workflow_plan),
            "clinical": self.clinical_agent.execute(analysis_id, query, context_data=workflow_plan),
            "literature": self.literature_agent.execute(analysis_id, query, context_data=workflow_plan)
        }
        
        # Run independent agents concurrently
        independent_results = await asyncio.gather(*independent_agent_tasks.values())
        
        # Step 3: Save independent agent outputs
        agent_outputs = {}
        for i, (agent_type, result) in enumerate(zip(independent_agent_tasks.keys(), independent_results)):
            agent_outputs[agent_type] = result
            Database.save_agent_output(analysis_id, agent_type, result)
            self.workflow_memory["agents_assigned"].append({
                "agent": agent_type,
                "status": "complete"
            })
        
        # Step 4: Run market agent with context from other agents
        market_context = {
            **workflow_plan,
            "agent_outputs": agent_outputs  # Pass other agents' data
        }
        market_result = await self.market_agent.execute(analysis_id, query, context_data=market_context)
        agent_outputs["market"] = market_result
        Database.save_agent_output(analysis_id, "market", market_result)
        self.workflow_memory["agents_assigned"].append({
            "agent": "market",
            "status": "complete"
        })
        
        # Step 5: Aggregate results
        self.status = "aggregating"
        aggregated = self._aggregate_results(query, agent_outputs)
        
        # Update workflow memory
        self.workflow_memory["status"] = "complete"
        self.workflow_memory["aggregated_results"] = aggregated
        Database.save_master_workflow(analysis_id, self.workflow_memory)
        
        self.status = "complete"
        
        return {
            "query": query,
            "workflow": self.workflow_memory,
            "agent_outputs": agent_outputs,
            "aggregated": aggregated
        }
    
    def _interpret_query(self, query: str) -> Dict[str, Any]:
        """Interpret user query and create workflow plan."""
        query_lower = query.lower()
        
        # Extract key information
        drug_name = self._extract_drug_name(query)
        indication = self._extract_indication(query)
        
        # Determine which agents are needed
        tasks = {
            "market": "market data" in query_lower or "commercial" in query_lower or True,  # Always include
            "patent": "patent" in query_lower or "ip" in query_lower or "intellectual property" in query_lower or True,
            "clinical": "clinical" in query_lower or "trial" in query_lower or True,
            "literature": "literature" in query_lower or "regulatory" in query_lower or "safety" in query_lower or True
        }
        
        return {
            "drug_name": drug_name,
            "indication": indication,
            "tasks": tasks,
            "priority": "high" if "urgent" in query_lower else "normal"
        }
    
    def _extract_drug_name(self, query: str) -> str:
        """Extract drug name from query."""
        query_lower = query.lower()
        common_drugs = ["metformin", "thalidomide", "propranolol", "aspirin", "sildenafil"]
        for drug in common_drugs:
            if drug in query_lower:
                return drug.capitalize()
        # Try to extract "Drug X" pattern
        if "drug" in query_lower:
            words = query.split()
            for i, word in enumerate(words):
                if word.lower() == "drug" and i + 1 < len(words):
                    return words[i + 1].capitalize()
        return "Drug X"
    
    def _extract_indication(self, query: str) -> str:
        """Extract indication from query."""
        query_lower = query.lower()
        if "oncology" in query_lower or "cancer" in query_lower:
            return "Oncology"
        elif "autoimmune" in query_lower:
            return "Autoimmune Diseases"
        elif "anxiety" in query_lower:
            return "Anxiety Disorders"
        elif "diabetes" in query_lower:
            return "Diabetes"
        elif "cardiovascular" in query_lower or "cardiac" in query_lower:
            return "Cardiovascular"
        return "General"
    
    def _aggregate_results(self, query: str, agent_outputs: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate results from all agents into unified opportunities."""
        # Extract all opportunities from agents
        all_opportunities = []
        
        for agent_type, output in agent_outputs.items():
            # Agent outputs are nested: {"status": "success", "data": {"top_opportunities": [...]}}
            agent_data = output.get("data", {})
            opportunities = agent_data.get("top_opportunities", [])
            for opp in opportunities:
                opp["source_agent"] = agent_type
                opp["agent_scores"] = agent_data.get("scores", {})
                all_opportunities.append(opp)
        
        # Group similar opportunities
        grouped = self._group_opportunities(all_opportunities)
        
        return {
            "total_opportunities": len(grouped),
            "opportunities": grouped,
            "agent_summary": {
                agent_type: {
                    "status": "complete",
                    "opportunities_found": len(output.get("data", {}).get("top_opportunities", [])),
                    "scores": output.get("data", {}).get("scores", {})
                }
                for agent_type, output in agent_outputs.items()
            }
        }
    
    def _group_opportunities(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Group similar opportunities together."""
        # Simple grouping by title similarity
        grouped = []
        seen_titles = set()
        
        for opp in opportunities:
            title_key = opp.get("title", "").lower()
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                grouped.append(opp)
            else:
                # Merge with existing opportunity
                for existing in grouped:
                    if existing.get("title", "").lower() == title_key:
                        # Merge evidence
                        if "sources" not in existing:
                            existing["sources"] = []
                        existing["sources"].append(opp.get("source_agent"))
                        break
        
        return grouped[:10]  # Return top 10

