import json
import os
from flask import Blueprint, request, jsonify
from flask_cors import CORS

admin_bp = Blueprint('admin', __name__)
CORS(admin_bp)  # Habilita CORS para todas as rotas deste blueprint

# Caminhos para os arquivos de dados
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
AGENDA_FILE = os.path.join(DATA_DIR, 'agenda.json')
PROCESSOS_FILE = os.path.join(DATA_DIR, 'processos.json')

def load_json_file(filepath):
    """Carrega um arquivo JSON"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_json_file(filepath, data):
    """Salva dados em um arquivo JSON"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Erro ao salvar arquivo {filepath}: {e}")
        return False

# Rotas para Funcionários
@admin_bp.route('/funcionarios', methods=['GET'])
def get_funcionarios():
    """Retorna todos os funcionários"""
    data = load_json_file(AGENDA_FILE)
    return jsonify(data.get('funcionarios', []))

@admin_bp.route('/funcionarios', methods=['POST'])
def add_funcionario():
    """Adiciona um novo funcionário"""
    funcionario_data = request.json
    
    # Validação básica
    required_fields = ['id', 'nome', 'horarioInicio', 'horarioFim', 'cor']
    for field in required_fields:
        if field not in funcionario_data:
            return jsonify({'error': f'Campo obrigatório: {field}'}), 400
    
    data = load_json_file(AGENDA_FILE)
    
    # Verifica se o ID já existe
    for funcionario in data.get('funcionarios', []):
        if funcionario['id'] == funcionario_data['id']:
            return jsonify({'error': 'ID do funcionário já existe'}), 400
    
    # Adiciona o novo funcionário
    if 'funcionarios' not in data:
        data['funcionarios'] = []
    data['funcionarios'].append(funcionario_data)
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Funcionário adicionado com sucesso'}), 201
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

@admin_bp.route('/funcionarios/<funcionario_id>', methods=['PUT'])
def update_funcionario(funcionario_id):
    """Atualiza um funcionário existente"""
    funcionario_data = request.json
    data = load_json_file(AGENDA_FILE)
    
    # Encontra e atualiza o funcionário
    for i, funcionario in enumerate(data.get('funcionarios', [])):
        if funcionario['id'] == funcionario_id:
            # Mantém o ID original
            funcionario_data['id'] = funcionario_id
            data['funcionarios'][i] = funcionario_data
            
            if save_json_file(AGENDA_FILE, data):
                return jsonify({'message': 'Funcionário atualizado com sucesso'})
            else:
                return jsonify({'error': 'Erro ao salvar dados'}), 500
    
    return jsonify({'error': 'Funcionário não encontrado'}), 404

@admin_bp.route('/funcionarios/<funcionario_id>', methods=['DELETE'])
def delete_funcionario(funcionario_id):
    """Remove um funcionário"""
    data = load_json_file(AGENDA_FILE)
    
    # Remove o funcionário
    funcionarios = data.get('funcionarios', [])
    funcionarios_filtrados = [f for f in funcionarios if f['id'] != funcionario_id]
    
    if len(funcionarios_filtrados) == len(funcionarios):
        return jsonify({'error': 'Funcionário não encontrado'}), 404
    
    data['funcionarios'] = funcionarios_filtrados
    
    # Remove também as tarefas agendadas para este funcionário
    agenda = data.get('agenda', [])
    data['agenda'] = [item for item in agenda if item['funcionario'] != funcionario_id]
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Funcionário removido com sucesso'})
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

# Rotas para Tarefas
@admin_bp.route('/tarefas', methods=['GET'])
def get_tarefas():
    """Retorna todas as tarefas"""
    data = load_json_file(AGENDA_FILE)
    return jsonify(data.get('tarefas', []))

@admin_bp.route('/tarefas', methods=['POST'])
def add_tarefa():
    """Adiciona uma nova tarefa"""
    tarefa_data = request.json
    
    # Validação básica
    required_fields = ['id', 'nome', 'categoria', 'tempoEstimado', 'descricao', 'prioridade']
    for field in required_fields:
        if field not in tarefa_data:
            return jsonify({'error': f'Campo obrigatório: {field}'}), 400
    
    data = load_json_file(AGENDA_FILE)
    
    # Verifica se o ID já existe
    for tarefa in data.get('tarefas', []):
        if tarefa['id'] == tarefa_data['id']:
            return jsonify({'error': 'ID da tarefa já existe'}), 400
    
    # Adiciona a nova tarefa
    if 'tarefas' not in data:
        data['tarefas'] = []
    data['tarefas'].append(tarefa_data)
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Tarefa adicionada com sucesso'}), 201
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

@admin_bp.route('/tarefas/<tarefa_id>', methods=['PUT'])
def update_tarefa(tarefa_id):
    """Atualiza uma tarefa existente"""
    tarefa_data = request.json
    data = load_json_file(AGENDA_FILE)
    
    # Encontra e atualiza a tarefa
    for i, tarefa in enumerate(data.get('tarefas', [])):
        if tarefa['id'] == tarefa_id:
            # Mantém o ID original
            tarefa_data['id'] = tarefa_id
            data['tarefas'][i] = tarefa_data
            
            if save_json_file(AGENDA_FILE, data):
                return jsonify({'message': 'Tarefa atualizada com sucesso'})
            else:
                return jsonify({'error': 'Erro ao salvar dados'}), 500
    
    return jsonify({'error': 'Tarefa não encontrada'}), 404

@admin_bp.route('/tarefas/<tarefa_id>', methods=['DELETE'])
def delete_tarefa(tarefa_id):
    """Remove uma tarefa"""
    data = load_json_file(AGENDA_FILE)
    
    # Remove a tarefa
    tarefas = data.get('tarefas', [])
    tarefas_filtradas = [t for t in tarefas if t['id'] != tarefa_id]
    
    if len(tarefas_filtradas) == len(tarefas):
        return jsonify({'error': 'Tarefa não encontrada'}), 404
    
    data['tarefas'] = tarefas_filtradas
    
    # Remove também os agendamentos desta tarefa
    agenda = data.get('agenda', [])
    data['agenda'] = [item for item in agenda if item['tarefa'] != tarefa_id]
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Tarefa removida com sucesso'})
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

# Rotas para Agenda/Cronograma
@admin_bp.route('/agenda', methods=['GET'])
def get_agenda():
    """Retorna toda a agenda"""
    data = load_json_file(AGENDA_FILE)
    return jsonify(data.get('agenda', []))

@admin_bp.route('/agenda', methods=['POST'])
def add_agendamento():
    """Adiciona um novo agendamento"""
    agendamento_data = request.json
    
    # Validação básica
    required_fields = ['horario', 'funcionario', 'tarefa']
    for field in required_fields:
        if field not in agendamento_data:
            return jsonify({'error': f'Campo obrigatório: {field}'}), 400
    
    data = load_json_file(AGENDA_FILE)
    
    # Verifica se funcionário e tarefa existem
    funcionario_existe = any(f['id'] == agendamento_data['funcionario'] for f in data.get('funcionarios', []))
    tarefa_existe = any(t['id'] == agendamento_data['tarefa'] for t in data.get('tarefas', []))
    
    if not funcionario_existe:
        return jsonify({'error': 'Funcionário não encontrado'}), 400
    if not tarefa_existe:
        return jsonify({'error': 'Tarefa não encontrada'}), 400
    
    # Adiciona o novo agendamento
    if 'agenda' not in data:
        data['agenda'] = []
    data['agenda'].append(agendamento_data)
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Agendamento adicionado com sucesso'}), 201
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

@admin_bp.route('/agenda/<int:index>', methods=['DELETE'])
def delete_agendamento(index):
    """Remove um agendamento pelo índice"""
    data = load_json_file(AGENDA_FILE)
    agenda = data.get('agenda', [])
    
    if index < 0 or index >= len(agenda):
        return jsonify({'error': 'Agendamento não encontrado'}), 404
    
    # Remove o agendamento
    agenda.pop(index)
    data['agenda'] = agenda
    
    if save_json_file(AGENDA_FILE, data):
        return jsonify({'message': 'Agendamento removido com sucesso'})
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

# Rotas para Processos
@admin_bp.route('/processos', methods=['GET'])
def get_processos():
    """Retorna todos os processos"""
    return jsonify(load_json_file(PROCESSOS_FILE))

@admin_bp.route('/processos/<processo_id>', methods=['PUT'])
def update_processo(processo_id):
    """Atualiza um processo existente"""
    processo_data = request.json
    data = load_json_file(PROCESSOS_FILE)
    
    # Atualiza o processo
    data[processo_id] = processo_data
    
    if save_json_file(PROCESSOS_FILE, data):
        return jsonify({'message': 'Processo atualizado com sucesso'})
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

@admin_bp.route('/processos/<processo_id>', methods=['DELETE'])
def delete_processo(processo_id):
    """Remove um processo"""
    data = load_json_file(PROCESSOS_FILE)
    
    if processo_id not in data:
        return jsonify({'error': 'Processo não encontrado'}), 404
    
    del data[processo_id]
    
    if save_json_file(PROCESSOS_FILE, data):
        return jsonify({'message': 'Processo removido com sucesso'})
    else:
        return jsonify({'error': 'Erro ao salvar dados'}), 500

# Rota para obter dados completos
@admin_bp.route('/dados-completos', methods=['GET'])
def get_dados_completos():
    """Retorna todos os dados da aplicação"""
    agenda_data = load_json_file(AGENDA_FILE)
    processos_data = load_json_file(PROCESSOS_FILE)
    
    return jsonify({
        'funcionarios': agenda_data.get('funcionarios', []),
        'tarefas': agenda_data.get('tarefas', []),
        'agenda': agenda_data.get('agenda', []),
        'processos': processos_data
    })

