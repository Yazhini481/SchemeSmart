import re
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.database import db

class SemanticRetrievalEngine:
    def __init__(self):
        self.vectorizer = None
        self.scheme_vectors = None
        self.schemes_list: List[Dict[str, Any]] = []
        self._build_index()

    def _build_index(self):
        self.schemes_list = db.get_all_schemes()
        if not self.schemes_list:
            return

        corpus = []
        for s in self.schemes_list:
            doc = (
                f"{s.get('name', '')} {s.get('name_tamil', '')} "
                f"{s.get('description', '')} {s.get('description_tamil', '')} "
                f"{s.get('category', '')} {s.get('beneficiary_type', '')} "
                f"{s.get('eligibility_text', '')} {s.get('benefits', '')} "
                f"{s.get('documents_required', '')}"
            )
            corpus.append(doc)

        # Build sublinear TF-IDF index for fast, grounded semantic search
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english'
        )
        self.scheme_vectors = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str, top_k: int = 30) -> List[Tuple[Dict[str, Any], float]]:
        if not query or not query.strip():
            # If empty query, return top schemes with neutral score
            return [(s, 0.5) for s in self.schemes_list[:top_k]]

        if self.vectorizer is None or self.scheme_vectors is None:
            self._build_index()

        q_clean = query.strip()
        try:
            q_vec = self.vectorizer.transform([q_clean])
            sims = cosine_similarity(q_vec, self.scheme_vectors).flatten()

            # Rank by cosine similarity
            top_indices = np.argsort(sims)[::-1][:top_k]
            results = []
            for idx in top_indices:
                score = float(sims[idx])
                results.append((self.schemes_list[idx], score))
            return results
        except Exception as e:
            print(f"Retrieval error: {e}")
            return [(s, 0.1) for s in self.schemes_list[:top_k]]

retrieval_engine = SemanticRetrievalEngine()
