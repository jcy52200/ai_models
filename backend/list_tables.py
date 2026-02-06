from sqlalchemy import create_engine, inspect

engine = create_engine("sqlite:///./suju.db")
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables: {tables}")
