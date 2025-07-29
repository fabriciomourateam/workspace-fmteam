from src.database import db

class Agenda(db.Model):
    __tablename__ = 'agenda'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    horario = db.Column(db.String(10), nullable=False)
    funcionario_id = db.Column(db.String(50), db.ForeignKey('funcionarios.id'), nullable=False)
    tarefa_id = db.Column(db.String(50), db.ForeignKey('tarefas.id'), nullable=False)
    data = db.Column(db.Date, nullable=True)  # Para agendamentos específicos
    
    def __repr__(self):
        return f'<Agenda {self.horario} - {self.funcionario_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'horario': self.horario,
            'funcionario': self.funcionario_id,
            'tarefa': self.tarefa_id,
            'data': self.data.isoformat() if self.data else None
        }