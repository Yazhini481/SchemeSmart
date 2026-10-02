from app.utils.data_loader import load_all_schemes

schemes = load_all_schemes()
print(f"Successfully loaded: {len(schemes)} schemes")
s0 = schemes[0]
print(f"Scheme 0: {s0['scheme_id']} | {s0['name']}")
print(f"Category: {s0['category']} | Beneficiary: {s0['beneficiary_type']}")
print(f"Age: {s0['eligibility_age_min']}-{s0['eligibility_age_max']} | Gender: {s0['eligibility_gender']}")
print(f"Mode: {s0['application_mode']}")
