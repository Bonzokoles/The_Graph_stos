"""
Research & Scraping Tools dla CHATboxJIMBO
Integracja z Tavily API do wyszukiwania i scrapowania
"""

import os
import json
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta

# Konfiguracja z .env
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")

class ResearchTools:
    """Narzędzia do wyszukiwania i scrapowania"""
    
    def __init__(self):
        self.tavily_api_key = TAVILY_API_KEY
        self.serper_api_key = SERPER_API_KEY
        self.tavily_base = "https://api.tavily.com"
        self.serper_base = "https://google.serper.dev/search"
    
    def search(
        self, 
        query: str, 
        max_age_days: int = 120, 
        num_results: int = 10,
        search_depth: str = "advanced"
    ) -> Dict:
        """
        Wyszukiwanie w Tavily z filtrowaniem daty
        
        Args:
            query: Zapytanie wyszukiwania
            max_age_days: Maksymalny wiek informacji (domyślnie 4 miesiące)
            num_results: Liczba wyników
            search_depth: 'basic' lub 'advanced'
        
        Returns:
            Dict z wynikami wyszukiwania
        """
        if not self.tavily_api_key:
            return self._mock_search(query, max_age_days)
        
        import time
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.tavily_base}/search",
                headers={
                    "Authorization": f"Bearer {self.tavily_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "query": query,
                    "max_age_days": max_age_days,
                    "num_results": num_results,
                    "search_depth": search_depth,
                    "include_answer": True
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                response_time = round((time.time() - start_time) * 1000, 2)
                
                # Filtrowanie wyników według daty
                cutoff_date = datetime.now() - timedelta(days=max_age_days)
                filtered_results = []
                
                for result in data.get("results", []):
                    pub_date = result.get("published_date")
                    if pub_date:
                        try:
                            result_date = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                            if result_date >= cutoff_date:
                                filtered_results.append(result)
                        except:
                            filtered_results.append(result)
                    else:
                        filtered_results.append(result)
                
                return {
                    "success": True,
                    "query": query,
                    "results": filtered_results[:num_results],
                    "total_found": len(filtered_results),
                    "filtered_by_date": len(filtered_results) < len(data.get("results", [])),
                    "response_time_ms": response_time,
                    "answer": data.get("answer", "")
                }
            else:
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "message": response.text
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Błąd połączenia z Tavily API"
            }
    
    def scrape(self, url: str, only_main_content: bool = True) -> Dict:
        """
        Scrapowanie strony przez Tavily
        
        Args:
            url: URL strony do scrapowania
            only_main_content: Tylko główna treść (bez reklam, nawigacji)
        
        Returns:
            Dict z treścią strony
        """
        if not self.tavily_api_key:
            return self._mock_scrape(url)
        
        try:
            response = requests.post(
                f"{self.tavily_base}/scrape",
                headers={
                    "Authorization": f"Bearer {self.tavily_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "url": url,
                    "only_main_content": only_main_content,
                    "output_format": "markdown"
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "url": url,
                    "content": data.get("content", data.get("markdown", "")),
                    "title": self._extract_title(data.get("content", "")),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "url": url
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "url": url
            }
    
    def search_and_scrape(self, query: str, max_age_days: int = 120) -> Dict:
        """
        Wyszukiwanie + scrapowanie pierwszych wyników
        """
        search_results = self.search(query, max_age_days=max_age_days, num_results=5)
        
        if not search_results.get("success"):
            return search_results
        
        scraped = []
        for result in search_results.get("results", [])[:3]:
            url = result.get("url")
            scrape_result = self.scrape(url)
            scraped.append({
                "url": url,
                "title": result.get("title"),
                "content": scrape_result.get("content", "")[:2000],
                "success": scrape_result.get("success", False)
            })
        
        return {
            "success": True,
            "query": query,
            "search_results": search_results.get("results", []),
            "scraped_pages": scraped,
            "total_scraped": len(scraped)
        }
    
    def deep_research(
        self, 
        query: str, 
        sources: Optional[List[str]] = None,
        max_age_days: int = 120
    ) -> Dict:
        """
        Głębokie wyszukiwanie w wielu źródłach
        """
        if sources is None:
            sources = ["tavily"]
        
        all_results = []
        
        if "tavily" in sources:
            tavily_results = self.search(query, max_age_days=max_age_days, num_results=10)
            if tavily_results.get("success"):
                all_results.extend(tavily_results.get("results", []))
        
        # Usuń duplikaty
        seen_urls = set()
        unique_results = []
        for r in all_results:
            url = r.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(r)
        
        return {
            "success": True,
            "query": query,
            "results": unique_results[:15],
            "total_unique": len(unique_results),
            "sources_checked": sources,
            "timestamp": datetime.now().isoformat()
        }
    
    def _extract_title(self, content: str) -> str:
        """Ekstrakcja tytułu z treści"""
        lines = content.strip().split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("# "):
                return line[2:].strip()
        return "Brak tytułu"
    
    def _mock_search(self, query: str, max_age_days: int) -> Dict:
        """Symulowane wyniki gdy brak API key"""
        return {
            "success": True,
            "query": query,
            "results": [
                {
                    "url": f"https://example.com/article-{query.replace(' ', '-')}",
                    "title": f"Wynik 1 dla: {query}",
                    "content": f"Symulowany wynik wyszukiwania dla '{query}'. Informacja nie starsza niż {max_age_days} dni.",
                    "published_date": (datetime.now() - timedelta(days=7)).isoformat(),
                    "score": 0.95
                }
            ],
            "total_found": 1,
            "filtered_by_date": False,
            "response_time_ms": 50,
            "mock": True,
            "message": "Brak TAVILY_API_KEY - używam symulowanych wyników"
        }
    
    def _mock_scrape(self, url: str) -> Dict:
        """Symulowany scrape gdy brak API key"""
        return {
            "success": True,
            "url": url,
            "content": f"# Symulowana treść\n\nTo jest symulowany wynik scrapowania dla: {url}\n\n## Informacje\n- URL: {url}\n- Data: {datetime.now().isoformat()}\n\nTreść strony zostałaby pobrana przez Tavily API gdyby klucz był skonfigurowany.",
            "title": f"Symulowana strona: {url}",
            "timestamp": datetime.now().isoformat(),
            "mock": True
        }
    
    def get_status(self) -> Dict:
        """Status narzędzi badawczych"""
        return {
            "tavily_configured": bool(self.tavily_api_key),
            "serper_configured": bool(self.serper_api_key),
            "features": ["search", "scrape", "search_and_scrape", "deep_research"],
            "default_max_age_days": 120,
            "note": "Ustaw TAVILY_API_KEY w .env aby włączyć prawdziwe wyszukiwanie"
        }


# Singleton instance
research_tools = ResearchTools()
