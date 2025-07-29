from src.database import db

class Tarefa(db.Model):
    __tablename__ = 'tarefas'
    
    id = db.Column(db.String(50), primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    tempo_estimado = db.Column(db.Integer, nullable=False)  # em minutos
    descricao = db.Column(db.Text, nullable=True)
    prioridade = db.Column(db.String(20), nullable=False)
    
    # Relacionamento com agenda
    agendas = db.relationship('Agenda', backref='tarefa_obj', lazy=True)
    
    def __repr__(self):
        return f'<Tarefa {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'categoria': self.categoria,
            'tempoEstimado': self.tempo_estimado,
            'descricao': self.descricao,
            'prioridade': self.prioridade
        }