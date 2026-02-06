# Wrapper do Ollama API - lokalny LLM bez GPU requirements
import requests
import os

class LocalModel:
    def __init__(self, model_name="llama3.2:latest", ollama_url=None):
        """
        Integracja z Ollama - wymaga uruchomionego Ollama serwera
        Instalacja: https://ollama.com/download
        Pobierz model: ollama pull llama3.2
        """
        self.model_name = model_name
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        
        # Sprawdź czy Ollama działa
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get("models", [])
                print(f"✅ Ollama połączona - dostępne modele: {[m['name'] for m in models]}")
                
                # Jeśli model nie istnieje, użyj pierwszego dostępnego
                if models and not any(m['name'].startswith(model_name.split(':')[0]) for m in models):
                    self.model_name = models[0]['name']
                    print(f"⚠️ Model {model_name} nie znaleziony, używam {self.model_name}")
            else:
                print(f"⚠️ Ollama odpowiada ale status: {response.status_code}")
        except Exception as e:
            print(f"❌ Ollama niedostępna: {e}")
            print("💡 Uruchom: ollama serve")
            print("💡 Pobierz model: ollama pull llama3.2")
    
    def generate(self, prompt: str, max_tokens: int = 512, temperature: float = 0.7, top_p: float = 0.9):
        """Generuj tekst używając Ollama API"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature,
                        "top_p": top_p
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                return response.json().get("response", "Brak odpowiedzi z modelu")
            else:
                return f"❌ Błąd Ollama: {response.status_code} - {response.text}"
                
        except requests.exceptions.ConnectionError:
            return "❌ Nie mogę połączyć z Ollama. Uruchom: ollama serve"
        except Exception as e:
            return f"❌ Błąd generowania: {str(e)}"