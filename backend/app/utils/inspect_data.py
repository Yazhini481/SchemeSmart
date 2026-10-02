import pandas as pd
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

df = pd.read_csv('dataset/Schemes.csv', encoding='utf-8')
print(f"Total schemes in CSV: {len(df)}")
for idx, r in df.head(15).iterrows():
    sid = r['scheme_id']
    name = r['scheme_name']
    cat = r['category']
    elig = str(r['eligibility_en'])
    docs = str(r['required_documents_en'])
    print(f"[{sid}] {name} ({cat})")
    print(f"   Elig: {elig}")
    print(f"   Docs: {docs[:80]}")
