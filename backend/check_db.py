from sqlalchemy import create_engine, inspect

engine = create_engine("sqlite:///./suju.db")
inspector = inspect(engine)
columns = [c['name'] for c in inspector.get_columns("products")]
print(f"Product columns: {columns}")

if "is_top" not in columns:
    print("MISSING: is_top")
else:
    print("FOUND: is_top")

if "is_published" not in columns:
    print("MISSING: is_published")
else:
    print("FOUND: is_published")
