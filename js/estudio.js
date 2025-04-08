document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    const estudioModal = document.getElementById('estudioModal');
    const estudioForm = document.getElementById('estudioForm');
    const addEstudioBtn = document.getElementById('addEstudioBtn');
    const modalTitle = document.getElementById('modalTitle');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const detailsModal = document.getElementById('detailsModal');
    const estudioDetails = document.getElementById('estudioDetails');
    let editEstudioId = null;

    // Função para exibir/ocultar o indicador de carregamento
    const setLoading = (isLoading) => {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    };

    // Função para exibir mensagens de erro
    const showError = (message) => {
        alert(`Erro: ${message}`);
    };

    // Função para carregar estúdios
    const loadEstudios = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/estudios`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar estúdios: ${response.status}`);
            }
            
            const estudios = await response.json();
            const tableBody = document.querySelector('#estudiosTable tbody');
            tableBody.innerHTML = '';

            estudios.forEach(estudio => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${estudio.nome}</td>
                    <td>${estudio.fundacao}</td>
                    <td>${estudio.pais}</td>
                    <td>
                        <button class="btn-action btn-view" data-id="${estudio._id}">Ver</button>
                        <button class="btn-action btn-edit" data-id="${estudio._id}">Editar</button>
                        <button class="btn-action btn-delete" data-id="${estudio._id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Adicionar event listeners para os botões
            document.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', (e) => showEstudioDetails(e.target.dataset.id));
            });

            document.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
            });

            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', (e) => deleteEstudio(e.target.dataset.id));
            });
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para exibir detalhes de um estúdio
    const showEstudioDetails = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/estudios/${id}`);
            
            if (!response.ok) {
                throw new Error(`Estúdio não encontrado: ${response.status}`);
            }
            
            const estudio = await response.json();
            
            estudioDetails.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">Nome:</div>
                    <div class="detail-value">${estudio.nome}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ano de Fundação:</div>
                    <div class="detail-value">${estudio.fundacao}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">País:</div>
                    <div class="detail-value">${estudio.pais}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Descrição:</div>
                    <div class="detail-value">${estudio.descricao}</div>
                </div>
                ${estudio.website ? `
                <div class="detail-item">
                    <div class="detail-label">Website:</div>
                    <div class="detail-value">
                        <a href="${estudio.website}" target="_blank">${estudio.website}</a>
                    </div>
                </div>` : ''}
            `;
            
            detailsModal.style.display = 'block';
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir modal de edição
    const openEditModal = async (id) => {
        try {
            setLoading(true);
            editEstudioId = id;
            modalTitle.innerText = 'Editar Mangá';
            
            const response = await fetch(`${API_URL}/estudios/${id}`);
            
            if (!response.ok) {
                throw new Error(`Estúdio não encontrado: ${response.status}`);
            }
            
            const estudio = await response.json();
            
            document.getElementById('nome').value = estudio.nome;
            document.getElementById('fundacao').value = estudio.fundacao;
            document.getElementById('pais').value = estudio.pais;
            document.getElementById('descricao').value = estudio.descricao;
            document.getElementById('website').value = estudio.website || '';
            
            estudioModal.style.display = 'block';
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir modal de adição
    const openAddModal = () => {
        editEstudioId = null;
        modalTitle.innerText = 'Adicionar Mangá';
        estudioForm.reset();
        estudioModal.style.display = 'block';
    };

    // Função para salvar estúdio (adicionar ou atualizar)
    const saveEstudio = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            const estudioData = {
                nome: document.getElementById('nome').value,
                fundacao: parseInt(document.getElementById('fundacao').value),
                pais: document.getElementById('pais').value,
                descricao: document.getElementById('descricao').value,
                website: document.getElementById('website').value || undefined
            };
            
            const url = editEstudioId 
                ? `${API_URL}/estudios/${editEstudioId}` 
                : `${API_URL}/estudios`;
                
            const method = editEstudioId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(estudioData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao ${editEstudioId ? 'atualizar' : 'criar'} estúdio`);
            }
            
            estudioModal.style.display = 'none';
            loadEstudios();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para excluir estúdio
    const deleteEstudio = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este Mangá? Isso também removerá todos os animes associados a ele.')) {
            return;
        }
        
        try {
            setLoading(true);
            
            const response = await fetch(`${API_URL}/estudios/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir Mangá');
            }
            
            loadEstudios();
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Event listeners
    addEstudioBtn.addEventListener('click', openAddModal);
    estudioForm.addEventListener('submit', saveEstudio);
    
    document.querySelector('.close').addEventListener('click', () => {
        estudioModal.style.display = 'none';
    });
    
    document.querySelector('.close-details').addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === estudioModal) {
            estudioModal.style.display = 'none';
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // Inicialização
    loadEstudios();
});