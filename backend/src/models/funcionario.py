from src.database import db

class Funcionario(db.Model):
    __tablename__ = 'funcionarios'
    
    id = db.Column(db.String(50), primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    horario_inicio = db.Column(db.String(10), nullable=True)
    horario_fim = db.Column(db.String(10), nullable=True)
    cor = db.Column(db.String(7), nullable=False)  # Hex color
    
    # Relacionamento com agenda
    agendas = db.relationship('Agenda', backref='funcionario_obj', lazy=True)
    
    def __repr__(self):
        return f'<Funcionario {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'horarioInicio': self.horario_inicio,
            'horarioFim': self.horario_fim,
            'cor': self.cor
        }