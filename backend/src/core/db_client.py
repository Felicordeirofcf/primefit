"""
Configuração do cliente de banco de dados PostgreSQL para Railway
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Obtém credenciais do PostgreSQL das variáveis de ambiente
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_URL = os.getenv("DATABASE_URL")  # Railway fornece esta variável automaticamente

def get_db_connection():
    """
    Cria e retorna uma conexão com o banco de dados PostgreSQL.
    Tenta usar DATABASE_URL primeiro (formato Railway), caso contrário usa parâmetros individuais.
    """
    try:
        if DB_URL:
            # Usar a URL de conexão diretamente (formato Railway)
            connection = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        else:
            # Usar parâmetros individuais
            if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
                raise ValueError("Credenciais do banco de dados não encontradas nas variáveis de ambiente")
            
            connection = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                cursor_factory=RealDictCursor
            )
        
        # Configurar a conexão para retornar dicionários em vez de tuplas
        connection.autocommit = True
        return connection
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        raise

def execute_query(query, params=None):
    """
    Executa uma consulta SQL e retorna os resultados.
    
    Args:
        query (str): A consulta SQL a ser executada
        params (tuple, optional): Parâmetros para a consulta SQL
        
    Returns:
        list: Lista de dicionários com os resultados da consulta
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            if cursor.description:  # Verifica se a consulta retorna resultados
                return cursor.fetchall()
            return None
    finally:
        connection.close()

def execute_transaction(queries):
    """
    Executa múltiplas consultas SQL em uma transação.
    
    Args:
        queries (list): Lista de tuplas (query, params)
        
    Returns:
        bool: True se a transação foi bem-sucedida
    """
    connection = get_db_connection()
    try:
        with connection:  # Isso cria um bloco de transação
            with connection.cursor() as cursor:
                for query, params in queries:
                    cursor.execute(query, params or ())
        return True
    except Exception as e:
        print(f"Erro na transação: {e}")
        return False
    finally:
        connection.close()

