#!/usr/bin/env python3
"""
Script simples para testar se o backend está funcionando
"""
import sys
import os

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    print("🔄 Testando importações...")
    
    # Testa importação do database
    from src.database import db
    print("✅ Database importado")
    
    # Testa importação dos modelos
    from src.models.funcionario import Funcionario
    from src.models.tarefa import Tarefa
    from src.models.agenda import Agenda
    print("✅ Modelos importados")
    
    # Testa importação do app
    from src.main import app
    print("✅ App importado")
    
    # Testa se o app consegue inicializar
    with app.app_context():
        print("✅ App context funcionando")
        
        # Testa se as tabelas foram criadas
        db.create_all()
        print("✅ Tabelas criadas")
        
        # Testa contagem de funcionários
        count = Funcionario.query.count()
        print(f"✅ Funcionários no banco: {count}")
        
        if count > 0:
            # Lista alguns funcionários
            funcionarios = Funcionario.query.limit(3).all()
            print("📋 Primeiros funcionários:")
            for func in funcionarios:
                print(f"  - {func.nome} ({func.id})")
    
    print("\n🎉 Backend está funcionando corretamente!")
    print("🚀 Execute: py src/main.py")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()