// Configuration de l'API
const API_BASE_URL = 'https://YOUR-AZURE-FUNCTION-APP.azurewebsites.net/api';

// Variable globale pour stocker les incidents
let allIncidents = [];

// ====== MODE TEST : Données de démonstration ======
const TEST_MODE = true; // Changez à false quand l'API est prête

const DEMO_INCIDENTS = [
    {
        id: '1a2b3c4d',
        zone: 'A1',
        category: 'Médical',
        description: 'Un spectateur a fait un malaise dans la tribune Nord',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'Ouvert'
    },
    {
        id: '2b3c4d5e',
        zone: 'B2',
        category: 'Sécurité',
        description: 'Altercation entre deux groupes de supporters',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'Résolu'
    },
    {
        id: '3c4d5e6f',
        zone: 'C1',
        category: 'Technique',
        description: 'Panne d\'éclairage dans les vestiaires',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'Ouvert'
    },
    {
        id: '4d5e6f7g',
        zone: 'A2',
        category: 'Médical',
        description: 'Blessure mineure nécessitant des premiers soins',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        status: 'Résolu'
    },
    {
        id: '5e6f7g8h',
        zone: 'B1',
        category: 'Sécurité',
        description: 'Objet suspect signalé sous un siège',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'Ouvert'
    },
    {
        id: '6f7g8h9i',
        zone: 'C2',
        category: 'Autre',
        description: 'Problème avec le système de sonorisation VIP',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        status: 'Ouvert'
    }
];

// Authentification Admin
document.getElementById('adminAuthForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const pin = document.getElementById('adminPin').value;
    const authMessage = document.getElementById('authMessage');
    
    if (TEST_MODE) {
        // MODE TEST : Accepter n'importe quel code à 4 chiffres
        if (pin.length === 4 && /^\d+$/.test(pin)) {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'block';
            loadIncidents();
        } else {
            authMessage.innerHTML = '<div class="alert alert-danger">Le code PIN doit contenir 4 chiffres</div>';
        }
        return;
    }
    
    // MODE PRODUCTION : Vérification avec API
    try {
        const response = await fetch(`${API_BASE_URL}/verify-pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin })
        });
        
        const data = await response.json();
        
        if (data.valid && data.role === 'admin') {
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('dashboardSection').style.display = 'block';
            loadIncidents();
        } else {
            authMessage.innerHTML = '<div class="alert alert-danger">Code PIN admin invalide</div>';
        }
    } catch (error) {
        authMessage.innerHTML = '<div class="alert alert-danger">Erreur de connexion</div>';
    }
});

// Charger tous les incidents
async function loadIncidents() {
    if (TEST_MODE) {
        // MODE TEST : Utiliser les données de démonstration
        allIncidents = DEMO_INCIDENTS;
        updateStatistics();
        displayIncidents(allIncidents);
        return;
    }
    
    // MODE PRODUCTION : Charger depuis l'API
    try {
        const response = await fetch(`${API_BASE_URL}/incidents`);
        allIncidents = await response.json();
        
        updateStatistics();
        displayIncidents(allIncidents);
    } catch (error) {
        console.error('Erreur chargement incidents:', error);
        document.getElementById('incidentsTable').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">
                Erreur de chargement des données
            </td></tr>
        `;
    }
}

// Afficher les incidents dans le tableau
function displayIncidents(incidents) {
    const tableBody = document.getElementById('incidentsTable');
    
    if (incidents.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="7" class="text-center">
                Aucun incident pour le moment
            </td></tr>
        `;
        return;
    }
    
    tableBody.innerHTML = incidents.map(incident => `
        <tr class="${incident.status === 'Résolu' ? 'resolved' : ''}">
            <td><strong>${incident.id.substring(0, 8)}</strong></td>
            <td><span class="badge-modern badge-zone">${incident.zone}</span></td>
            <td>${incident.category}</td>
            <td>${incident.description.substring(0, 50)}${incident.description.length > 50 ? '...' : ''}</td>
            <td>${formatDate(incident.timestamp)}</td>
            <td>
                <span class="badge-modern ${incident.status === 'Ouvert' ? 'badge-open' : 'badge-resolved'}">
                    ${incident.status}
                </span>
            </td>
            <td>
                ${incident.status === 'Ouvert' ? `
                    <button class="btn-action btn-success" onclick="resolveIncident('${incident.id}')">
                        Résoudre
                    </button>
                ` : `
                    <button class="btn-action btn-success" disabled>
                        Résolu
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

// Mettre à jour les statistiques
function updateStatistics() {
    const total = allIncidents.length;
    const medical = allIncidents.filter(i => i.category === 'Médical').length;
    const security = allIncidents.filter(i => i.category === 'Sécurité').length;
    const technical = allIncidents.filter(i => i.category === 'Technique').length;
    
    document.getElementById('totalIncidents').textContent = total;
    document.getElementById('medicalCount').textContent = medical;
    document.getElementById('securityCount').textContent = security;
    document.getElementById('technicalCount').textContent = technical;
}

// Résoudre un incident
async function resolveIncident(id) {
    if (!confirm('Marquer cet incident comme résolu ?')) {
        return;
    }
    
    if (TEST_MODE) {
        // MODE TEST : Mettre à jour localement
        const incident = allIncidents.find(i => i.id === id);
        if (incident) {
            incident.status = 'Résolu';
            updateStatistics();
            displayIncidents(allIncidents);
            showToast('Incident marqué comme résolu', 'success');
        }
        return;
    }
    
    // MODE PRODUCTION : Mettre à jour via API
    try {
        const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Résolu' })
        });
        
        if (response.ok) {
            loadIncidents();
            showToast('Incident marqué comme résolu', 'success');
        }
    } catch (error) {
        console.error('Erreur résolution incident:', error);
        showToast('Erreur lors de la résolution', 'danger');
    }
}

// Filtrer les incidents
function filterIncidents() {
    const zoneFilter = document.getElementById('filterZone').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = allIncidents;
    
    if (zoneFilter) {
        filtered = filtered.filter(i => i.zone === zoneFilter);
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(i => i.category === categoryFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    displayIncidents(filtered);
}

// Déconnexion
function logout() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('adminAuthForm').reset();
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Auto-refresh toutes les 30 secondes (désactivé en mode test)
if (!TEST_MODE) {
    setInterval(() => {
        if (document.getElementById('dashboardSection').style.display !== 'none') {
            loadIncidents();
        }
    }, 30000);
}
