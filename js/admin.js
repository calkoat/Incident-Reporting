
// admin.js - Logique pour le dashboard admin

// ⚙️ CONFIGURATION API
// IMPORTANT: Remplacez cette URL par votre vraie API backend
const API_URL = //'https://incidentdb.documents.azure.com/;AccountKey=kFOrNuez8niq1mQ9ibeZtvEEcfvc7E0Gxp1aYUaj8aqIXMo9h3nzelJKgnVOQ2a85ieSCPytVtgfACDb71YlUQ==';


document.getElementById("adminAuthForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // On ignore complètement le PIN
    document.getElementById("authSection").style.display = "none";
    document.getElementById("dashboardSection").style.display = "block";

    loadIncidents();
});



    
// 📝 Récupération des éléments DOM
const totalCount = document.getElementById('totalIncidents');
const medicalCount = document.getElementById('medicalCount');
const securityCount = document.getElementById('securityCount');
const technicalCount = document.getElementById('technicalCount');

const incidentsTable = document.getElementById('incidentsTable');
const filterZone = document.getElementById('filterZone');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const refreshBtn = document.getElementById('refreshBtn');


// 💾 Stockage local des incidents
let allIncidents = [];

// 🌐 Charger les incidents depuis l'API
async function loadIncidents() {
    try {
        // 🌐 APPEL API - Décommentez quand l'API est prête
        /*const response = await fetch(`${API_URL}/incidents`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement');
        }
        
        allIncidents = await response.json();
        */

        // 🧪 MODE TEST - Données de démonstration
        allIncidents = [
            {
                id: 1,
                zone: 'A1',
                category: 'Médical',
                description: 'Blessure légère au genou, premiers soins nécessaires',
                timestamp: '2025-11-23T14:30:00',
                status: 'Ouvert'
            },
            {
                id: 2,
                zone: 'B2',
                category: 'Sécurité',
                description: 'Barrière de sécurité endommagée près de la scène principale',
                timestamp: '2025-11-23T15:15:00',
                status: 'Ouvert'
            },
            {
                id: 3,
                zone: 'C1',
                category: 'Technique',
                description: 'Problème de son au niveau du système audio',
                timestamp: '2025-11-23T13:00:00',
                status: 'Résolu'
            },
            {
                id: 4,
                zone: 'A2',
                category: 'Autre',
                description: 'Poubelle renversée, nettoyage requis',
                timestamp: '2025-11-23T16:00:00',
                status: 'Ouvert'
            },
            {
                id: 5,
                zone: 'B1',
                category: 'Sécurité',
                description: 'Attroupement important, surveillance renforcée demandée',
                timestamp: '2025-11-23T16:30:00',
                status: 'Ouvert'
            }
        ];

        // Mettre à jour l'affichage
        updateStats();
        displayIncidents();

    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        incidentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    ❌ Erreur lors du chargement des incidents
                </td>
            </tr>
        `;
    }
}

// 📊 Mettre à jour les statistiques
function updateStats() {
    const open = allIncidents.filter(i => i.status === 'Ouvert').length;
    const resolved = allIncidents.filter(i => i.status === 'Résolu').length;
    
    totalCount.textContent = allIncidents.length;
    openCount.textContent = open;
    resolvedCount.textContent = resolved;
}

// 📋 Afficher les incidents dans le tableau
function displayIncidents() {
    // Appliquer les filtres
    let filtered = allIncidents;

    const zoneFilter = filterZone.value;
    const categoryFilter = filterCategory.value;
    const statusFilter = filterStatus.value;

    if (zoneFilter) {
        filtered = filtered.filter(i => i.zone === zoneFilter);
    }

    if (categoryFilter) {
        filtered = filtered.filter(i => i.category === categoryFilter);
    }

    if (statusFilter) {
        filtered = filtered.filter(i => i.status === statusFilter);
    }

    // Afficher les incidents
    if (filtered.length === 0) {
        incidentsTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    📭 Aucun incident à afficher
                </td>
            </tr>
        `;
        return;
    }

    incidentsTable.innerHTML = filtered.map(incident => `
        <tr>
            <td><strong>#${incident.id}</strong></td>
            <td>
                <span class="badge badge-zone">${incident.zone}</span>
            </td>
            <td>
                ${getCategoryIcon(incident.category)} ${incident.category}
            </td>
            <td>${incident.description}</td>
            <td>${formatTimestamp(incident.timestamp)}</td>
            <td>
                <span class="badge badge-status ${incident.status === 'Ouvert' ? 'badge-open' : 'badge-resolved'}">
                    ${incident.status}
                </span>
            </td>
            <td>
                ${incident.status === 'Ouvert' ? 
                    `<button class="btn btn-resolve" onclick="resolveIncident(${incident.id})">
                        ✅ Résoudre
                    </button>` : 
                    '<span class="text-success">✓ Résolu</span>'
                }
            </td>
        </tr>
    `).join('');
}

// ✅ Résoudre un incident
async function resolveIncident(id) {
    if (!confirm('Marquer cet incident comme résolu?')) {
        return;
    }

    try {
        // 🌐 APPEL API - Décommentez quand l'API est prête
       /* 
        const response = await fetch(`${API_URL}/incidents/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Résolu' })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }
        
*/
        // 🧪 MODE TEST - Mise à jour locale
        const incident = allIncidents.find(i => i.id === id);
        if (incident) {
            incident.status = 'Résolu';
        }

        // Mettre à jour l'affichage
        updateStats();
        displayIncidents();

        // Notification succès
        showNotification('✅ Incident #' + id + ' marqué comme résolu');

    } catch (error) {
        console.error('❌ Erreur résolution:', error);
        alert('❌ Erreur lors de la résolution de l\'incident');
    }
}

// 🔧 Obtenir l'icône de catégorie
function getCategoryIcon(category) {
    const icons = {
        'Médical': '🏥',
        'Sécurité': '🛡️',
        'Technique': '🔧',
        'Autre': '❓'
    };
    return icons[category] || '📌';
}

// 📅 Formater le timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month} ${hours}:${minutes}`;
}

// 🔔 Afficher une notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 🎯 Event listeners
refreshBtn.addEventListener('click', loadIncidents);
filterZone.addEventListener('change', displayIncidents);
filterCategory.addEventListener('change', displayIncidents);
filterStatus.addEventListener('change', displayIncidents);

// 🔄 Auto-refresh toutes les 30 secondes
setInterval(loadIncidents, 30000);

// 🚀 Charger au démarrage
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard admin chargé');
    loadIncidents();
});

// Rendre la fonction resolveIncident accessible globalement
window.resolveIncident = resolveIncident;
