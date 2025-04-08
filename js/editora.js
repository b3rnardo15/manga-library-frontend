document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/api';
    const editoraModal = document.getElementById('editoraModal');
    const editoraForm = document.getElementById('editoraForm');
    const addEditoraBtn = document.getElementById('addEditoraBtn');
    const modalTitle = document.getElementById('modalTitle');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const messageContainer = document.getElementById('messageContainer');
    let editEditoraId = null;

    // Função para mostrar/ocultar indicador de carregamento
    const setLoading = (isLoading) => {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    };

    // Função para mostrar mensagens ao usuário
    const showMessage = (message, isError = false) => {
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = isError ? 'message error' : 'message success';
            messageContainer.style.display = 'block';
            
            // Esconder a mensagem após 4 segundos
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 4000);
        } else {
            alert(message); // Fallback para navegadores sem suporte a elementos personalizados
        }
    };

    // Função para carregar editoras
    const loadEditoras = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/editoras`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar editoras: ${response.status}`);
            }
            
            const editoras = await response.json();
            const tableBody = document.querySelector('#editorasTable tbody');
            
            if (!tableBody) {
                console.error('Tabela de editoras não encontrada no DOM');
                return;
            }
            
            tableBody.innerHTML = '';

            editoras.forEach(editora => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${editora.nome}</td>
                    <td>${editora.pais}</td>
                    <td>${editora.fundadoEm}</td>
                    <td>${editora.site || 'N/A'}</td>
                    <td>
                        <button class="btn-edit" data-id="${editora._id}">Editar</button>
                        <button class="btn-delete" data-id="${editora._id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adicionar eventos aos botões de edição e exclusão
            document.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', (e) => openEditEditoraModal(e.target.dataset.id));
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', (e) => deleteEditora(e.target.dataset.id));
            });
        } catch (error) {
            showMessage(`Erro ao carregar editoras: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir modal de adição de editora
    const openAddEditoraModal = () => {
        editEditoraId = null;
        modalTitle.textContent = 'Adicionar Nova Editora';
        editoraForm.reset();
        editoraModal.style.display = 'block';
    };

    // Função para abrir modal de edição de editora
    const openEditEditoraModal = async (id) => {
        try {
            setLoading(true);
            editEditoraId = id;
            modalTitle.textContent = 'Editar Editora';

            const response = await fetch(`${apiUrl}/editoras/${id}`);
            
            if (!response.ok) {
                throw new Error(`Editora não encontrada: ${response.status}`);
            }
            
            const editora = await response.json();
            
            document.getElementById('nome').value = editora.nome;
            document.getElementById('pais').value = editora.pais;
            document.getElementById('fundadoEm').value = editora.fundadoEm;
            document.getElementById('site').value = editora.site || '';
            
            editoraModal.style.display = 'block';
        } catch (error) {
            showMessage(`Erro ao carregar dados da editora: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Função para salvar editora (criar ou atualizar)
    const saveEditora = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            const editoraData = {
                nome: document.getElementById('nome').value,
                pais: document.getElementById('pais').value,
                fundadoEm: document.getElementById('fundadoEm').value,
                site: document.getElementById('site').value
            };

            const url = editEditoraId 
                ? `${apiUrl}/editoras/${editEditoraId}` 
                : `${apiUrl}/editoras`;
            
            const method = editEditoraId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editoraData)
            });

            if (!response.ok) {
                throw new Error(`Erro ao ${editEditoraId ? 'atualizar' : 'criar'} editora: ${response.status}`);
            }

            editoraModal.style.display = 'none';
            loadEditoras();
            showMessage(`Editora ${editEditoraId ? 'atualizada' : 'adicionada'} com sucesso!`);
        } catch (error) {
            showMessage(`Erro ao salvar editora: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Função para excluir editora
    const deleteEditora = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta editora?')) {
            return;
        }
        
        try {
            setLoading(true);
            
            const response = await fetch(`${apiUrl}/editoras/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Erro ao excluir editora: ${response.status}`);
            }

            loadEditoras();
            showMessage('Editora excluída com sucesso!');
        } catch (error) {
            showMessage(`Erro ao excluir editora: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };

    // Event Listeners
    addEditoraBtn.addEventListener('click', openAddEditoraModal);
    
    editoraForm.addEventListener('submit', saveEditora);
    
    // Fechar modal ao clicar no X
    document.querySelector('.close').addEventListener('click', () => {
        editoraModal.style.display = 'none';
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', (e) => {
        if (e.target === editoraModal) {
            editoraModal.style.display = 'none';
        }
    });

    // Inicializar carregamento de editoras
    loadEditoras();
});