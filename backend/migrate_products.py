import sqlite3

def migrate():
    conn = sqlite3.connect('suju.db')
    cursor = conn.cursor()
    
    # Check existing columns
    cursor.execute("PRAGMA table_info(products)")
    columns = [row[1] for row in cursor.fetchall()]
    
    print(f"Current columns: {columns}")
    
    # Add columns if missing
    if 'is_top' not in columns:
        print("Adding is_top...")
        cursor.execute("ALTER TABLE products ADD COLUMN is_top BOOLEAN DEFAULT 0")
        
    if 'is_published' not in columns:
        print("Adding is_published...")
        cursor.execute("ALTER TABLE products ADD COLUMN is_published BOOLEAN DEFAULT 1")
        
    if 'sales_count' not in columns:
        print("Adding sales_count...")
        cursor.execute("ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0")
        
    if 'view_count' not in columns:
        print("Adding view_count...")
        cursor.execute("ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
