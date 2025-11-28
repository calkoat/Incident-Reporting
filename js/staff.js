// staff.js - Logique pour le formulaire staff

// ⚙️ CONFIGURATION API
// IMPORTANT: Remplacez cette URL par votre vraie API backend
const API_URL = //'https://incidentdb.documents.azure.com/;AccountKey=kFOrNuez8niq1mQ9ibeZtvEEcfvc7E0Gxp1aYUaj8aqIXMo9h3nzelJKgnVOQ2a85ieSCPytVtgfACDb71YlUQ==';

// 📝 Récupération des éléments DOM
const pinInput = document.getElementById('pinInput');
const zoneSelect = document.getElementById('zoneSelect');
const categorySelect = document.getElementById('categorySelect');
const descriptionText = document.getElementById('descriptionText');
const submitBtn = document.getElementById('submitBtn');
const alertContainer = document.getElementById('alertContainer');

// 🔒 Validation PIN (uniquement chiffres)
pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// 📤 Fonction pour soumettre l'incident
async function submitIncident() {
    // Récupération des valeurs
    const pin = pinInput.value.trim();
    const zone = zoneSelect.value;
    const category = categorySelect.value;
    const description = descriptionText.value.trim();

    // Validation
    if (!validateForm(pin, zone, category, description)) {
        return;
    }

    // Désactiver le bouton pendant l'envoi
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...';

    try {
        // Créer l'objet incident
        const incident = {
            pin: pin,
            zone: zone,
            category: category,
            description: description,
            timestamp: new Date().toISOString(),
            status: 'Ouvert'
        };

        // 🌐 APPEL API - Décommentez quand l'API est prête
        
        const response = await fetch(`${API_URL}/incidents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(incident)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi');
        }

        const result = await response.json();
        */

        // 🧪 MODE TEST - Simulation (à retirer en production)
        console.log('📨 Incident envoyé (mode test):', incident);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simule délai réseau

        // Afficher succès
        showAlert('success', '✅ Incident signalé avec succès! Votre signalement a été enregistré.');

        // Réinitialiser le formulaire
        resetForm();

    } catch (error) {
        console.error('❌ Erreur:', error);
        showAlert('danger', '❌ Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = '📤 Envoyer le signalement';
    }
}

// ✅ Fonction de validation
function validateForm(pin, zone, category, description) {
    // Validation PIN
    if (pin.length !== 4) {
        showAlert('warning', '⚠️ Le code PIN doit contenir exactement 4 chiffres.');
        pinInput.focus();
        return false;
    }

    // Validation zone
    if (!zone) {
        showAlert('warning', '⚠️ Veuillez sélectionner une zone.');
        zoneSelect.focus();
        return false;
    }

    // Validation catégorie
    if (!category) {
        showAlert('warning', '⚠️ Veuillez sélectionner une catégorie.');
        categorySelect.focus();
        return false;
    }

    // Validation description
    if (description.length < 10) {
        showAlert('warning', '⚠️ La description doit contenir au moins 10 caractères.');
        descriptionText.focus();
        return false;
    }

    return true;
}

// 🎨 Afficher une alerte
function showAlert(type, message) {
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    alertContainer.innerHTML = alertHTML;

    // Auto-fermeture après 5 secondes
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }
    }, 5000);
}

// 🔄 Réinitialiser le formulaire
function resetForm() {
    pinInput.value = '';
    zoneSelect.value = '';
    categorySelect.value = '';
    descriptionText.value = '';
    pinInput.focus();
}

// 🎯 Event listeners
submitBtn.addEventListener('click', submitIncident);

// Permettre soumission avec Enter sur description
descriptionText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        submitIncident();
    }
});

// 🚀 Au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Formulaire staff chargé');
    pinInput.focus();
});
