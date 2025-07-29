from flask import Blueprint, jsonify
from src.database import db
from src.models.funcionario import Funcionario
from src.models.tarefa import Tarefa
from src.models.agenda import Agenda

agenda_bp = Blueprint('agenda', __name__)

@agenda_bp.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    """Retorna todos os funcionários"""
    funcionarios = Funcionario.query.all()
    return jsonify([func.to_dict() for func in funcionarios])

@agenda_bp.route('/tarefas', methods=['GET'])
def get_tarefas():
    """Retorna todas as tarefas"""
    tarefas = Tarefa.query.all()
    return jsonify([tarefa.to_dict() for tarefa in tarefas])

@agenda_bp.route('/agenda', methods=['GET'])
def get_agenda():
    """Retorna toda a agenda"""
    agenda_items = Agenda.query.all()
    return jsonify([item.to_dict() for item in agenda_items])

@agenda_bp.route('/agenda/funcionario/<funcionario_id>', methods=['GET'])
def get_agenda_funcionario(funcionario_id):
    """Retorna agenda de um funcionário específico"""
    agenda_items = Agenda.query.filter_by(funcionario_id=funcionario_id).all()
    return jsonify([item.to_dict() for item in agenda_items])

@agenda_bp.route('/funcionarios/<funcionario_id>', methods=['GET'])
def get_funcionario(funcionario_id):
    """Retorna um funcionário específico"""
    funcionario = Funcionario.query.get_or_404(funcionario_id)
    return jsonify(funcionario.to_dict())

@agenda_bp.route('/tarefas/<tarefa_id>', methods=['GET'])
def get_tarefa(tarefa_id):
    """Retorna uma tarefa específica"""
    tarefa = Tarefa.query.get_or_404(tarefa_id)
    return jsonify(tarefa.to_dict())