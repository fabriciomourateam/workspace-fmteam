import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.database import db

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Database configuration
database_url = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Habilita CORS para toda a aplicação
CORS(app)

# Inicializa o banco
db.init_app(app)

# Importa modelos após inicializar o db
from src.models.user import User
from src.models.funcionario import Funcionario
from src.models.tarefa import Tarefa
from src.models.agenda import Agenda

# Importa e registra blueprints
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.agenda import agenda_bp

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(agenda_bp, url_prefix='/api')

# Cria tabelas e popula dados
def init_database():
    with app.app_context():
        db.create_all()
        
        # Popula o banco apenas se estiver vazio
        if Funcionario.query.count() == 0:
            from src.seed_data import seed_database
            seed_database()

# Inicializa o banco
init_database()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
