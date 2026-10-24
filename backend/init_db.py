import asyncio
import asyncpg
import os

# Cadena de conexión a tu base de datos PostgreSQL local
DB_URL = "postgresql://postgres@localhost:5432/aemora_db"

async def create_tables():
    print("[*] Conectando a PostgreSQL...")
    try:
        conn = await asyncpg.connect(DB_URL)
        
        # Ubica el archivo schema.sql en la misma carpeta del backend
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        
        if not os.path.exists(schema_path):
            # Si el script está dentro de backend/, busca en la raíz
            schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "schema.sql")

        with open(schema_path, "r", encoding="utf-8") as file:
            sql_script = file.read()
            
        print("[*] Ejecutando schema.sql para crear las 6 tablas...")
        await conn.execute(sql_script)
        print("[✓] ¡Estructura de la base de datos sincronizada con éxito!")
        
        await conn.close()
    except Exception as e:
        print(f"[X] Error al ejecutar la creación de tablas: {e}")

if __name__ == "__main__":
    asyncio.run(create_tables())