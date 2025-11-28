// Configuration de l'API
const API_BASE_URL = 'https://YOUR-AZURE-FUNCTION-APP.azurewebsites.net/api';

// Gestion de la soumission du formulaire
document.getElementById('incidentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    
    // Récupérer les valeurs du formulaire
    const pin = document.getElementById('pin').value;
    const zone = document.getElementById('zone').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    
    // Validation basique
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        showMessage('Le code PIN doit contenir 4 chiffres', 'danger');
        return;
    }
    
    // Désactiver le bouton pendant l'envoi
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Envoi en cours...';
    
    try {
        // ÉTAPE 1 : Vérifier le PIN
        const authResponse = await fetch(`${API_BASE_URL}/verify-pin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin })
        });
        
        const authData = await authResponse.json();
        
        if (!authData.valid || authData.role !== 'staff') {
            showMessage('Code PIN invalide ou accès non autorisé', 'danger');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Soumettre le Signalement';
            return;
        }
        
        // ÉTAPE 2 : Créer l'incident
        const incidentResponse = await fetch(`${API_BASE_URL}/incidents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                zone: zone,           // Ex: "B1"
                category: category,   // Ex: "Technique"
                description: description, // Ex: "chaise cassée"
                status: 'Ouvert',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!incidentResponse.ok) {
            throw new Error('Erreur lors de la création de l\'incident');
        }
        
        const incidentData = await incidentResponse.json();
        
        // ÉTAPE 3 : Envoyer notification email (service de votre collègue)
        // IMPORTANT : Votre collègue doit vous donner l'URL de son service AWS Lambda/GCP
        // Pour l'instant, on fait l'appel sans bloquer si ça échoue
        try {
            await sendEmailNotification(zone, category, description, incidentData.id);
        } catch (emailError) {
            console.warn('Notification email échouée:', emailError);
            // On continue même si l'email échoue
        }
        
        // Succès
        showMessage(`Incident signalé avec succès ! ID: ${incidentData.id.substring(0, 8)}`, 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('incidentForm').reset();
        
        // Réactiver le bouton après 2 secondes
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Soumettre le Signalement';
        }, 2000);
        
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors de la soumission. Vérifiez votre connexion.', 'danger');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Soumettre le Signalement';
    }
});

// Fonction pour envoyer la notification email
async function sendEmailNotification(zone, category, description, incidentId) {
    // URL du service AWS Lambda/GCP de votre collègue
    // TODO: Remplacer par l'URL réelle fournie par votre collègue
    const EMAIL_SERVICE_URL = 'https://YOUR-COLLEAGUE-EMAIL-SERVICE.amazonaws.com/send-notification';
    
    const emailData = {
        zone: zone,
        category: category,
        description: description,
        incidentId: incidentId,
        timestamp: new Date().toISOString()
    };
    
    console.log('Envoi de la notification email...', emailData);
    
    const response = await fetch(EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });
    
    if (response.ok) {
        console.log('✅ Email envoyé avec succès');
    } else {
        console.error('❌ Échec envoi email');
    }
}

// Fonction pour afficher les messages
function showMessage(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-fermer après 5 secondes
    setTimeout(() => {
        statusMessage.innerHTML = '';
    }, 5000);
}

// Validation en temps réel du PIN
document.getElementById('pin').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// Mode hors ligne
window.addEventListener('offline', () => {
    showMessage('Vous êtes hors ligne. Les données seront envoyées lors de la reconnexion.', 'warning');
});

window.addEventListener('online', () => {
    showMessage('Connexion rétablie', 'success');
});
