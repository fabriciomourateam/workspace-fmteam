"""
Serviço de integração com Google Calendar API
Implementa sincronização bidirecional entre Workspace Visual e Google Calendar
"""

import os
import json
import datetime
from typing import Dict, List, Optional, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleCalendarService:
    """Serviço para integração com Google Calendar API"""
    
    # Escopos necessários para leitura e escrita no Google Calendar
    SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]
    
    def __init__(self):
        self.credentials_file = 'credentials.json'
        self.token_file = 'token.json'
        self.service = None
        
    def setup_oauth_flow(self, client_config: Dict[str, Any]) -> str:
        """
        Configura o fluxo OAuth 2.0 para autenticação
        
        Args:
            client_config: Configuração do cliente OAuth (credentials.json)
            
        Returns:
            URL de autorização para redirecionamento do usuário
        """
        try:
            # Cria o fluxo OAuth
            flow = Flow.from_client_config(
                client_config,
                scopes=self.SCOPES,
                redirect_uri='http://localhost:5000/oauth/callback'
            )
            
            # Gera a URL de autorização
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            
            # Salva o estado para validação posterior
            self._save_oauth_state(state, flow)
            
            return authorization_url
            
        except Exception as e:
            logger.error(f"Erro ao configurar fluxo OAuth: {e}")
            raise
    
    def handle_oauth_callback(self, authorization_code: str, state: str) -> bool:
        """
        Processa o callback do OAuth e obtém as credenciais
        
        Args:
            authorization_code: Código de autorização retornado pelo Google
            state: Estado para validação de segurança
            
        Returns:
            True se a autenticação foi bem-sucedida
        """
        try:
            # Recupera o fluxo OAuth salvo
            flow = self._load_oauth_state(state)
            if not flow:
                raise ValueError("Estado OAuth inválido")
            
            # Troca o código de autorização por credenciais
            flow.fetch_token(code=authorization_code)
            
            # Salva as credenciais
            credentials = flow.credentials
            self._save_credentials(credentials)
            
            # Inicializa o serviço
            self._initialize_service()
            
            return True
            
        except Exception as e:
            logger.error(f"Erro no callback OAuth: {e}")
            return False
    
    def _save_oauth_state(self, state: str, flow: Flow):
        """Salva o estado OAuth temporariamente"""
        # Em produção, isso deveria ser salvo em um cache/database
        # Por simplicidade, salvamos em arquivo temporário
        with open(f'oauth_state_{state}.json', 'w') as f:
            json.dump({
                'client_config': flow.client_config,
                'redirect_uri': flow.redirect_uri,
                'scopes': flow.scopes
            }, f)
    
    def _load_oauth_state(self, state: str) -> Optional[Flow]:
        """Carrega o estado OAuth salvo"""
        try:
            with open(f'oauth_state_{state}.json', 'r') as f:
                data = json.load(f)
            
            flow = Flow.from_client_config(
                data['client_config'],
                scopes=data['scopes'],
                redirect_uri=data['redirect_uri']
            )
            
            # Remove o arquivo temporário
            os.remove(f'oauth_state_{state}.json')
            
            return flow
            
        except FileNotFoundError:
            return None
    
    def _save_credentials(self, credentials: Credentials):
        """Salva as credenciais OAuth"""
        with open(self.token_file, 'w') as token:
            token.write(credentials.to_json())
    
    def _load_credentials(self) -> Optional[Credentials]:
        """Carrega as credenciais salvas"""
        if os.path.exists(self.token_file):
            return Credentials.from_authorized_user_file(self.token_file, self.SCOPES)
        return None
    
    def _initialize_service(self) -> bool:
        """Inicializa o serviço Google Calendar API"""
        try:
            credentials = self._load_credentials()
            
            if not credentials:
                return False
            
            # Atualiza as credenciais se necessário
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                self._save_credentials(credentials)
            
            # Constrói o serviço
            self.service = build('calendar', 'v3', credentials=credentials)
            return True
            
        except Exception as e:
            logger.error(f"Erro ao inicializar serviço: {e}")
            return False
    
    def is_authenticated(self) -> bool:
        """Verifica se o usuário está autenticado"""
        if self.service:
            return True
        return self._initialize_service()
    
    def get_calendars(self) -> List[Dict[str, Any]]:
        """
        Obtém lista de calendários do usuário
        
        Returns:
            Lista de calendários disponíveis
        """
        if not self.is_authenticated():
            return []
        
        try:
            calendar_list = self.service.calendarList().list().execute()
            calendars = []
            
            for calendar_item in calendar_list.get('items', []):
                calendars.append({
                    'id': calendar_item['id'],
                    'name': calendar_item['summary'],
                    'primary': calendar_item.get('primary', False),
                    'access_role': calendar_item.get('accessRole', 'reader')
                })
            
            return calendars
            
        except HttpError as e:
            logger.error(f"Erro ao obter calendários: {e}")
            return []
    
    def get_events(self, calendar_id: str = 'primary', 
                   time_min: Optional[datetime.datetime] = None,
                   time_max: Optional[datetime.datetime] = None,
                   max_results: int = 100) -> List[Dict[str, Any]]:
        """
        Obtém eventos de um calendário
        
        Args:
            calendar_id: ID do calendário (padrão: 'primary')
            time_min: Data/hora mínima para busca
            time_max: Data/hora máxima para busca
            max_results: Número máximo de resultados
            
        Returns:
            Lista de eventos
        """
        if not self.is_authenticated():
            return []
        
        try:
            # Define período padrão se não especificado
            if not time_min:
                time_min = datetime.datetime.now(tz=datetime.timezone.utc)
            if not time_max:
                time_max = time_min + datetime.timedelta(days=30)
            
            # Converte para formato ISO
            time_min_str = time_min.isoformat()
            time_max_str = time_max.isoformat()
            
            # Busca eventos
            events_result = self.service.events().list(
                calendarId=calendar_id,
                timeMin=time_min_str,
                timeMax=time_max_str,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = []
            for event in events_result.get('items', []):
                # Processa informações do evento
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                
                events.append({
                    'id': event['id'],
                    'title': event.get('summary', 'Sem título'),
                    'description': event.get('description', ''),
                    'start': start,
                    'end': end,
                    'location': event.get('location', ''),
                    'attendees': event.get('attendees', []),
                    'created': event.get('created'),
                    'updated': event.get('updated'),
                    'calendar_id': calendar_id
                })
            
            return events
            
        except HttpError as e:
            logger.error(f"Erro ao obter eventos: {e}")
            return []
    
    def create_event(self, calendar_id: str, event_data: Dict[str, Any]) -> Optional[str]:
        """
        Cria um novo evento no Google Calendar
        
        Args:
            calendar_id: ID do calendário
            event_data: Dados do evento
            
        Returns:
            ID do evento criado ou None se falhou
        """
        if not self.is_authenticated():
            return None
        
        try:
            # Monta o evento no formato do Google Calendar
            event = {
                'summary': event_data.get('title', 'Evento do Workspace Visual'),
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': event_data['start'],
                    'timeZone': 'America/Sao_Paulo',
                },
                'end': {
                    'dateTime': event_data['end'],
                    'timeZone': 'America/Sao_Paulo',
                },
                'location': event_data.get('location', ''),
                'source': {
                    'title': 'Workspace Visual',
                    'url': 'https://workspace-visual.com'
                }
            }
            
            # Adiciona participantes se especificados
            if 'attendees' in event_data:
                event['attendees'] = [
                    {'email': email} for email in event_data['attendees']
                ]
            
            # Cria o evento
            created_event = self.service.events().insert(
                calendarId=calendar_id,
                body=event
            ).execute()
            
            logger.info(f"Evento criado: {created_event['id']}")
            return created_event['id']
            
        except HttpError as e:
            logger.error(f"Erro ao criar evento: {e}")
            return None
    
    def update_event(self, calendar_id: str, event_id: str, 
                    event_data: Dict[str, Any]) -> bool:
        """
        Atualiza um evento existente
        
        Args:
            calendar_id: ID do calendário
            event_id: ID do evento
            event_data: Novos dados do evento
            
        Returns:
            True se atualizado com sucesso
        """
        if not self.is_authenticated():
            return False
        
        try:
            # Obtém o evento atual
            event = self.service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            # Atualiza os campos
            if 'title' in event_data:
                event['summary'] = event_data['title']
            if 'description' in event_data:
                event['description'] = event_data['description']
            if 'start' in event_data:
                event['start'] = {
                    'dateTime': event_data['start'],
                    'timeZone': 'America/Sao_Paulo',
                }
            if 'end' in event_data:
                event['end'] = {
                    'dateTime': event_data['end'],
                    'timeZone': 'America/Sao_Paulo',
                }
            if 'location' in event_data:
                event['location'] = event_data['location']
            
            # Salva as alterações
            updated_event = self.service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event
            ).execute()
            
            logger.info(f"Evento atualizado: {updated_event['id']}")
            return True
            
        except HttpError as e:
            logger.error(f"Erro ao atualizar evento: {e}")
            return False
    
    def delete_event(self, calendar_id: str, event_id: str) -> bool:
        """
        Remove um evento do Google Calendar
        
        Args:
            calendar_id: ID do calendário
            event_id: ID do evento
            
        Returns:
            True se removido com sucesso
        """
        if not self.is_authenticated():
            return False
        
        try:
            self.service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            logger.info(f"Evento removido: {event_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Erro ao remover evento: {e}")
            return False
    
    def sync_workspace_to_google(self, workspace_events: List[Dict[str, Any]], 
                                calendar_id: str = 'primary') -> Dict[str, Any]:
        """
        Sincroniza eventos do Workspace Visual para o Google Calendar
        
        Args:
            workspace_events: Lista de eventos do Workspace Visual
            calendar_id: ID do calendário de destino
            
        Returns:
            Relatório da sincronização
        """
        if not self.is_authenticated():
            return {'error': 'Não autenticado'}
        
        sync_report = {
            'created': 0,
            'updated': 0,
            'errors': 0,
            'details': []
        }
        
        for ws_event in workspace_events:
            try:
                # Converte evento do Workspace Visual para formato Google Calendar
                event_data = self._convert_workspace_to_google_event(ws_event)
                
                # Verifica se o evento já existe (baseado em ID personalizado)
                existing_event_id = self._find_existing_event(
                    calendar_id, ws_event.get('workspace_id')
                )
                
                if existing_event_id:
                    # Atualiza evento existente
                    if self.update_event(calendar_id, existing_event_id, event_data):
                        sync_report['updated'] += 1
                        sync_report['details'].append(f"Atualizado: {ws_event.get('title')}")
                    else:
                        sync_report['errors'] += 1
                        sync_report['details'].append(f"Erro ao atualizar: {ws_event.get('title')}")
                else:
                    # Cria novo evento
                    event_id = self.create_event(calendar_id, event_data)
                    if event_id:
                        sync_report['created'] += 1
                        sync_report['details'].append(f"Criado: {ws_event.get('title')}")
                        # Salva mapeamento para futuras sincronizações
                        self._save_event_mapping(ws_event.get('workspace_id'), event_id)
                    else:
                        sync_report['errors'] += 1
                        sync_report['details'].append(f"Erro ao criar: {ws_event.get('title')}")
                        
            except Exception as e:
                sync_report['errors'] += 1
                sync_report['details'].append(f"Erro: {str(e)}")
        
        return sync_report
    
    def sync_google_to_workspace(self, calendar_id: str = 'primary') -> List[Dict[str, Any]]:
        """
        Sincroniza eventos do Google Calendar para o Workspace Visual
        
        Args:
            calendar_id: ID do calendário de origem
            
        Returns:
            Lista de eventos formatados para o Workspace Visual
        """
        if not self.is_authenticated():
            return []
        
        try:
            # Obtém eventos do Google Calendar
            google_events = self.get_events(calendar_id)
            
            # Converte para formato do Workspace Visual
            workspace_events = []
            for g_event in google_events:
                ws_event = self._convert_google_to_workspace_event(g_event)
                if ws_event:
                    workspace_events.append(ws_event)
            
            return workspace_events
            
        except Exception as e:
            logger.error(f"Erro na sincronização Google -> Workspace: {e}")
            return []
    
    def _convert_workspace_to_google_event(self, ws_event: Dict[str, Any]) -> Dict[str, Any]:
        """Converte evento do Workspace Visual para formato Google Calendar"""
        return {
            'title': f"[WS] {ws_event.get('funcionario', '')} - {ws_event.get('tarefa', '')}",
            'description': f"Tarefa: {ws_event.get('tarefa', '')}\n"
                          f"Funcionário: {ws_event.get('funcionario', '')}\n"
                          f"Categoria: {ws_event.get('categoria', '')}\n"
                          f"Tempo estimado: {ws_event.get('tempo_estimado', '')}min\n"
                          f"Criado pelo Workspace Visual",
            'start': ws_event.get('start'),
            'end': ws_event.get('end'),
            'location': 'Workspace Virtual'
        }
    
    def _convert_google_to_workspace_event(self, g_event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Converte evento do Google Calendar para formato Workspace Visual"""
        try:
            # Ignora eventos criados pelo próprio Workspace Visual
            if g_event.get('title', '').startswith('[WS]'):
                return None
            
            return {
                'google_event_id': g_event['id'],
                'title': g_event['title'],
                'description': g_event.get('description', ''),
                'start': g_event['start'],
                'end': g_event['end'],
                'location': g_event.get('location', ''),
                'source': 'google_calendar',
                'sync_timestamp': datetime.datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao converter evento Google: {e}")
            return None
    
    def _find_existing_event(self, calendar_id: str, workspace_id: str) -> Optional[str]:
        """Encontra evento existente baseado no ID do Workspace"""
        # Em produção, isso seria feito através de um banco de dados
        # Por simplicidade, usamos busca por texto na descrição
        try:
            events = self.get_events(calendar_id)
            for event in events:
                if f"workspace_id:{workspace_id}" in event.get('description', ''):
                    return event['id']
            return None
        except:
            return None
    
    def _save_event_mapping(self, workspace_id: str, google_event_id: str):
        """Salva mapeamento entre IDs do Workspace e Google Calendar"""
        # Em produção, isso seria salvo em banco de dados
        mapping_file = 'event_mappings.json'
        mappings = {}
        
        if os.path.exists(mapping_file):
            with open(mapping_file, 'r') as f:
                mappings = json.load(f)
        
        mappings[workspace_id] = google_event_id
        
        with open(mapping_file, 'w') as f:
            json.dump(mappings, f)
    
    def disconnect(self) -> bool:
        """Desconecta da conta Google e remove credenciais"""
        try:
            # Remove arquivos de credenciais
            if os.path.exists(self.token_file):
                os.remove(self.token_file)
            
            # Remove mapeamentos
            if os.path.exists('event_mappings.json'):
                os.remove('event_mappings.json')
            
            # Limpa serviço
            self.service = None
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao desconectar: {e}")
            return False

# Instância global do serviço
google_calendar_service = GoogleCalendarService()

