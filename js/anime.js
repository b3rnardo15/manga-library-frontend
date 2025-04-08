document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://manga-library-backend-3.onrender.com/api';
    const animeModal = document.getElementById('animeModal');
    const animeForm = document.getElementById('animeForm');
    const addAnimeBtn = document.getElementById('addAnimeBtn');
    const modalTitle = document.getElementById('modalTitle');
    const loadingIndicator = document.getElementById('loadingIndicator');
    let editAnimeId = null;

    // Exibe ou oculta o indicador de loading
    const setLoading = (isLoading) => {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    };

    // Exibe uma mensagem de erro
    const showError = (message) => {
        alert(`Erro: ${message}`);
    };

    // Carrega os animes da API
    const loadAnimes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/animes`);
            if (!response.ok) throw new Error('Falha ao carregar animes');
            
            const animes = await response.json();
            const tableBody = document.querySelector('#animesTable tbody');
            tableBody.innerHTML = '';

            animes.forEach(anime => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${anime.titulo}</td>
                    <td>${anime.genero}</td>
                    <td>${anime.episodios}</td>
                    <td>${anime.ano}</td>
                    <td>${anime.estudio ? anime.estudio.nome : 'N/A'}</td>
                    <td>
                        <button class="edit-btn" data-id="${anime._id}">Editar</button>
                        <button class="delete-btn" data-id="${anime._id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Eventos dos botões
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openEditAnimeModal(e.target.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteAnime(e.target.dataset.id));
            });

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Carrega estúdios no select
    const loadEstudios = async (selectedEstudioId = null) => {
        try {
            const response = await fetch(`${apiUrl}/estudios`);
            if (!response.ok) throw new Error('Falha ao carregar estúdios');

            const estudios = await response.json();
            const select = document.getElementById('estudio');
            select.innerHTML = '<option value="">Selecione um estúdio</option>';

            estudios.forEach(estudio => {
                const option = document.createElement('option');
                option.value = estudio._id;
                option.textContent = estudio.nome;
                if (estudio._id === selectedEstudioId) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

        } catch (error) {
            showError(error.message);
        }
    };

    // Abre modal para adicionar novo anime
    const openAddAnimeModal = async () => {
        editAnimeId = null;
        modalTitle.textContent = 'Adicionar Anime';
        animeForm.reset();
        await loadEstudios();
        animeModal.style.display = 'block';
    };

    // Abre modal para editar anime existente
    const openEditAnimeModal = async (id) => {
        try {
            setLoading(true);
            editAnimeId = id;
            modalTitle.textContent = 'Editar Anime';

            const response = await fetch(`${apiUrl}/animes/${id}`);
            if (!response.ok) throw new Error('Anime não encontrado');

            const anime = await response.json();
            document.getElementById('titulo').value = anime.titulo;
            document.getElementById('genero').value = anime.genero;
            document.getElementById('episodios').value = anime.episodios;
            document.getElementById('ano').value = anime.ano;
            document.getElementById('sinopse').value = anime.sinopse || '';

            await loadEstudios(anime.estudio);

            animeModal.style.display = 'block';

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Salva um novo anime ou atualiza um existente
    const saveAnime = async (event) => {
        event.preventDefault();

        const animeData = {
            titulo: document.getElementById('titulo').value,
            genero: document.getElementById('genero').value,
            numeroEpisodios: parseInt(document.getElementById('episodios').value),
            ano: parseInt(document.getElementById('ano').value),
            sinopse: document.getElementById('sinopse').value,
            estudio: document.getElementById('estudio').value
        };

        try {
            setLoading(true);
            const url = editAnimeId ? `${apiUrl}/animes/${editAnimeId}` : `${apiUrl}/animes`;
            const method = editAnimeId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(animeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar anime');
            }

            animeModal.style.display = 'none';
            loadAnimes();

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Deleta um anime
    const deleteAnime = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este anime?')) return;

        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/animes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Falha ao deletar anime');
            }

            loadAnimes();

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fecha o modal
    document.querySelector('.close').addEventListener('click', () => {
        animeModal.style.display = 'none';
    });

    // Fecha modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target === animeModal) {
            animeModal.style.display = 'none';
        }
    });

    // Evento de envio do formulário
    animeForm.addEventListener('submit', saveAnime);

    // Evento de clique para adicionar anime
    addAnimeBtn.addEventListener('click', openAddAnimeModal);

    // Carrega a lista de animes ao iniciar
    loadAnimes();
});
