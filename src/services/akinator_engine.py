import numpy as np
from typing import List, Optional, Tuple
from src.schemas.entity import HeritageEntity, HeritageQuestion

class BayesianAkinatorEngine:
    def __init__(self, entities: List[HeritageEntity], questions: List[HeritageQuestion]):
        self.entities = entities
        self.questions = {q.id: q for q in questions}
        self.question_ids = list(self.questions.keys())
        self.num_entities = len(entities)

        self.matrix = np.zeros((self.num_entities, len(self.question_ids)))
        for i, entity in enumerate(self.entities):
            for j, q_id in enumerate(self.question_ids):
                self.matrix[i, j] = entity.attributes.get(q_id, 0.5)

    def calculate_entropy(self, probs : np.ndarray) ->float : 
        nonzero_probs = probs[probs > 1e-9] 
        entropy = -np.sum(nonzero_probs*np.log2(nonzero_probs))
        return float(entropy)
    
    def update_beliefs(self, probabilities: np.ndarray, question_id: str, user_answer: str) -> np.ndarray:
        weight_map = {
            "yes": 0.95,
            "probably": 0.75,
            "unknown": 0.5,
            "probably_not": 0.25,
            "no": 0.05
        }
        
        target_prob = weight_map.get(user_answer.lower(), 0.5)
        q_idx = self.question_ids.index(question_id)
        entity_traits = self.matrix[:, q_idx]
        
        likelihood = (target_prob * entity_traits) + ((1.0 - target_prob) * (1.0 - entity_traits))
        
        updated_probs = likelihood * probabilities
        total = np.sum(updated_probs)
        
        if total > 0:
            return updated_probs / total
        else:
            return np.full(self.num_entities, 1.0 / self.num_entities)
        
        
    def get_next_best_question(self, probabilities: np.ndarray, asked_q_ids: List[str]) -> Optional[HeritageQuestion]:
        current_h = self.calculate_entropy(probabilities)
        best_gain = -1.0
        best_q_id = None

        for j, q_id in enumerate(self.question_ids):
            if q_id in asked_q_ids:
                continue
            p_yes = float(np.sum(probabilities * self.matrix[:, j]))
            p_no = 1.0 - p_yes

            if p_yes < 1e-5 or p_no < 1e-5:
                continue

            post_yes = (probabilities * self.matrix[:, j]) / p_yes
            post_no = (probabilities * (1.0 - self.matrix[:, j])) / p_no

            expected_h = (p_yes * self.calculate_entropy(post_yes)) + (p_no * self.calculate_entropy(post_no))
            gain = current_h - expected_h

            if gain > best_gain:
                best_gain = gain
                best_q_id = q_id

        return self.questions.get(best_q_id) if best_q_id else None

    def get_top_prediction(self, probabilities: np.ndarray) -> Tuple[HeritageEntity, float]:
        top_idx = int(np.argmax(probabilities))
        return self.entities[top_idx], float(probabilities[top_idx])