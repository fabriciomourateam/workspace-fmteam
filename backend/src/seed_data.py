import json
import os
from src.database import db
from src.models.funcionario import Funcionario
from src.models.tarefa import Tarefa
from src.models.agenda import Agenda

def seed_database():
    """Popula o banco de dados com os dados iniciais"""
    try:
        # Carrega dados do JSON
        data_path = os.path.join(os.path.dirname(__file__), 'data', 'agenda.json')
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("Populando banco de dados...")
        
        # Insere funcionários
        for func_data in data['funcionarios']:
            funcionario = Funcionario(
                id=func_data['id'],
                nome=func_data['nome'],
                horario_inicio=func_data['horarioInicio'],
                horario_fim=func_data['horarioFim'],
                cor=func_data['cor']
            )
            db.session.add(funcionario)
        
        # Insere tarefas
        for tarefa_data in data['tarefas']:
            tarefa = Tarefa(
                id=tarefa_data['id'],
                nome=tarefa_data['nome'],
                categoria=tarefa_data['categoria'],
                tempo_estimado=tarefa_data['tempoEstimado'],
                descricao=tarefa_data['descricao'],
                prioridade=tarefa_data['prioridade']
            )
            db.session.add(tarefa)
        
        # Insere agenda
        for agenda_data in data['agenda']:
            agenda = Agenda(
                horario=agenda_data['horario'],
                funcionario_id=agenda_data['funcionario'],
                tarefa_id=agenda_data['tarefa']
            )
            db.session.add(agenda)
        
        # Salva todas as mudanças
        db.session.commit()
        print("✅ Banco de dados populado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao popular banco: {e}")
        db.session.rollback()