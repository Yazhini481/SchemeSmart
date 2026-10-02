from app.services.retrieval import retrieval_engine

results = retrieval_engine.retrieve('scholarship for students', top_k=5)
print("Query: scholarship for students")
for s, score in results:
    print(f"[{s['scheme_id']}] {s['name']} (Sim: {score:.3f})")

results_farmer = retrieval_engine.retrieve('organic farming and subsidy for agriculture', top_k=5)
print("\nQuery: organic farming and subsidy for agriculture")
for s, score in results_farmer:
    print(f"[{s['scheme_id']}] {s['name']} (Sim: {score:.3f})")
