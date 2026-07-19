// ========== BASE DE DONNÉES ==========
let produits = JSON.parse(localStorage.getItem('electro_produits')) || [
    { id: 1, nom: "Réfrigérateur Samsung RT38 450L", marque: "Samsung", categorie: "Refrigerateurs", prix: 5999, prixPromo: 4999, description: "Réfrigérateur combiné Samsung Digital Inverter 450L. Technologie économie d'énergie. Éclairage LED. Garantie 2 ans.", emoji: "🧊" },
    { id: 2, nom: "Lave-linge LG F4J6 8kg", marque: "LG", categorie: "Lave-linge", prix: 4599, prixPromo: null, description: "Lave-linge frontal LG 8kg. Moteur Inverter Direct Drive. 14 programmes. Essorage 1400 tr/min.", emoji: "👕" },
    { id: 3, nom: "Lave-vaisselle Bosch SMS46", marque: "Bosch", categorie: "Lave-vaisselle", prix: 3999, prixPromo: 3499, description: "Lave-vaisselle Bosch 13 couverts. Classe A++. Silence 46dB. 6 programmes.", emoji: "🍽️" },
    { id: 4, nom: "Cuisinière Whirlpool AKP 745", marque: "Whirlpool", categorie: "Cuisinieres", prix: 2999, prixPromo: null, description: "Cuisinière 4 feux gaz Whirlpool. Four électrique 65L. Allumage intégré.", emoji: "🍳" },
    { id: 5, nom: "Four Encastrable Electrolux 60cm", marque: "Electrolux", categorie: "Fours", prix: 2499, prixPromo: 1999, description: "Four électrique encastrable Electrolux 60cm. Chaleur tournante. Nettoyage catalyse.", emoji: "🔥" },
    { id: 6, nom: "Micro-ondes Samsung 28L Grill", marque: "Samsung", categorie: "Micro-ondes", prix: 899, prixPromo: null, description: "Micro-ondes Samsung 28L avec Grill. 10 niveaux de puissance. Décongélation automatique.", emoji: "📡" },
    { id: 7, nom: "Climatiseur LG Split 12000BTU", marque: "LG", categorie: "Climatiseurs", prix: 4999, prixPromo: 4499, description: "Climatiseur split LG Inverter 12000BTU. Froid/Chaud. Télécommande. Filtre anti-bactéries.", emoji: "❄️" },
    { id: 8, nom: "Téléviseur Samsung 55\" 4K UHD", marque: "Samsung", categorie: "Televiseurs", prix: 6999, prixPromo: 5999, description: "TV LED Samsung 55 pouces 4K UHD. Smart TV. WiFi intégré. HDR. 3 HDMI.", emoji: "📺" },
    { id: 9, nom: "Aspirateur Bosch Serie 4", marque: "Bosch", categorie: "Aspirateurs", prix: 1499, prixPromo: null, description: "Aspirateur sans sac Bosch Serie 4. Puissance 2400W. Filtre HEPA. Rayon 10m.", emoji: "🧹" },
    { id: 10, nom: "Chauffe-eau Ariston 100L", marque: "Ariston", categorie: "Chauffe-eau", prix: 1999, prixPromo: 1799, description: "Chauffe-eau électrique Ariston 100L. Installation verticale. Thermostat réglable. Garantie 3 ans.", emoji: "💧" }
];

let coordonnees = JSON.parse(localStorage.getItem('electro_coords')) || {
    tel: "+212 522-123456",
    email: "contact@electrofennassa.ma",
    adresse: "Bd Mohammed V, Casablanca, Maroc",
    horaires: "Lun-Sam: 9h-19h\nDim: Fermé",
    whatsapp: "+212612345678"
};

let panier = JSON.parse(localStorage.getItem('electro_panier')) || [];
let adminConnected = sessionStorage.getItem('electro_admin') === 'true';
let filtreActuel = 'tous';

// ========== SAUVEGARDE ==========
function saveData() {
    localStorage.setItem('electro_produits', JSON.stringify(produits));
    localStorage.setItem('electro_coords', JSON.stringify(coordonnees));
    localStorage.setItem('electro_panier', JSON.stringify(panier));
}

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    afficherProduits();
    mettreAJourCoordonnees();
    afficherMarques();
    updateCartUI();
    updateWhatsAppLink();
    if (adminConnected) showAdminDashboard();
    
    // Back to top
    window.addEventListener('scroll', function() {
        document.getElementById('backToTop').style.display = window.scrollY > 500 ? 'block' : 'none';
    });
    
    // Recherche avec Entrée
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') rechercher();
    });
    
    // Admin login avec Entrée
    document.getElementById('passwordInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adminLogin();
    });
});

// ========== AFFICHAGE PRODUITS ==========
function afficherProduits(filtre = 'tous') {
    const container = document.getElementById('produitsContainer');
    if (!container) return;
    
    let produitsFiltres = filtre === 'tous' ? produits : produits.filter(p => p.categorie === filtre);
    
    container.innerHTML = produitsFiltres.length === 0 ? 
        '<p style="text-align:center;padding:40px;grid-column:1/-1;color:#999;">Aucun produit trouvé</p>' :
        produitsFiltres.map(p => `
            <div class="produit-card" onclick="ouvrirProduit(${p.id})">
                ${p.prixPromo ? `<span class="badge-promo">-${Math.round((1 - p.prixPromo/p.prix) * 100)}%</span>` : ''}
                <div class="produit-image">${p.emoji || '📦'}</div>
                <div class="produit-info">
                    <span class="produit-marque">${p.marque}</span>
                    <h3 class="produit-nom">${p.nom}</h3>
                    <div class="produit-prix">
                        ${p.prixPromo ? `<span class="ancien">${p.prix.toLocaleString()} MAD</span>` : ''}
                        ${(p.prixPromo || p.prix).toLocaleString()} MAD
                    </div>
                    <button class="btn-ajouter" onclick="event.stopPropagation(); ajouterAuPanier(${p.id})">🛒 Ajouter au panier</button>
                </div>
            </div>
        `).join('');
}

// ========== MARQUES ==========
function afficherMarques() {
    const container = document.getElementById('marquesContainer');
    if (!container) return;
    
    const marques = [...new Set(produits.map(p => p.marque))];
    container.innerHTML = marques.map(m => `<div class="marque-item">${m}</div>`).join('');
}

// ========== MODAL PRODUIT ==========
function ouvrirProduit(id) {
    const p = produits.find(pr => pr.id === id);
    if (!p) return;
    
    document.getElementById('modalBody').innerHTML = `
        <div class="produit-image" style="font-size:100px;">${p.emoji || '📦'}</div>
        <h2>${p.nom}</h2>
        <span class="marque-badge">${p.marque}</span>
        <div class="prix-modal">
            ${p.prixPromo ? `<span style="text-decoration:line-through;color:#999;font-size:18px;">${p.prix.toLocaleString()} MAD</span> ` : ''}
            ${(p.prixPromo || p.prix).toLocaleString()} MAD
        </div>
        <p class="description">${p.description}</p>
        <p style="color:#27ae60;font-weight:bold;">✅ En stock - Livraison partout au Maroc</p>
        <button class="btn-ajouter" style="padding:12px;font-size:16px;margin-top:10px;" onclick="ajouterAuPanier(${p.id});fermerModal();">🛒 Ajouter au panier</button>
    `;
    
    document.getElementById('produitModal').style.display = 'block';
}

function fermerModal() {
    document.getElementById('produitModal').style.display = 'none';
}

// ========== PANIER ==========
function ajouterAuPanier(id) {
    const p = produits.find(pr => pr.id === id);
    if (!p) return;
    
    const existant = panier.find(item => item.id === id);
    if (existant) {
        existant.quantite++;
    } else {
        panier.push({ id: id, nom: p.nom, prix: p.prixPromo || p.prix, emoji: p.emoji, quantite: 1 });
    }
    saveData();
    updateCartUI();
    
    // Animation
    const cartIcon = document.querySelector('.floating-cart');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    }
}

function retirerDuPanier(id) {
    panier = panier.filter(item => item.id !== id);
    saveData();
    updateCartUI();
    afficherPanier();
}

function updateCartUI() {
    const count = panier.reduce((sum, item) => sum + item.quantite, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('floatingCartCount').textContent = count;
}

function afficherPanier() {
    const content = document.getElementById('panierContent');
    const totalEl = document.getElementById('panierTotal');
    const btnCommander = document.getElementById('btnCommander');
    
    if (panier.length === 0) {
        content.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">🛒 Votre panier est vide</p>';
        totalEl.style.display = 'none';
        btnCommander.style.display = 'none';
    } else {
        let total = 0;
        content.innerHTML = panier.map(item => {
            const sousTotal = item.prix * item.quantite;
            total += sousTotal;
            return `
                <div class="panier-item">
                    <span>${item.emoji || '📦'} ${item.nom} x${item.quantite}</span>
                    <span>${sousTotal.toLocaleString()} MAD</span>
                    <button onclick="retirerDuPanier(${item.id})">🗑️</button>
                </div>
            `;
        }).join('');
        
        totalEl.style.display = 'block';
        totalEl.innerHTML = `<strong>Total : ${total.toLocaleString()} MAD</strong>`;
        btnCommander.style.display = 'block';
    }
    
    document.getElementById('panierModal').style.display = 'block';
}

function fermerPanier() {
    document.getElementById('panierModal').style.display = 'none';
}

// ========== COMMANDER WHATSAPP ==========
function commanderWhatsApp() {
    if (panier.length === 0) return;
    
    let message = '🛒 *Nouvelle commande ELECTRO_FENNASSA*%0A%0A';
    let total = 0;
    
    panier.forEach(item => {
        const sousTotal = item.prix * item.quantite;
        total += sousTotal;
        message += `- ${item.nom} x${item.quantite} : ${sousTotal.toLocaleString()} MAD%0A`;
    });
    
    message += `%0A💰 *Total : ${total.toLocaleString()} MAD*%0A%0A`;
    message += '📞 Merci de me contacter pour finaliser la commande.';
    
    const whatsappNum = coordonnees.whatsapp || '+212612345678';
    window.open(`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
}

function ouvrirWhatsApp() {
    const whatsappNum = coordonnees.whatsapp || '+212612345678';
    window.open(`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=Bonjour ELECTRO_FENNASSA, je suis intéressé par vos produits.`, '_blank');
}

function updateWhatsAppLink() {
    const whatsappNum = coordonnees.whatsapp || '+212612345678';
    document.getElementById('whatsappBtn').href = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=Bonjour ELECTRO_FENNASSA, je souhaite des informations sur vos produits.`;
}

// ========== RECHERCHE ==========
function rechercher() {
    const q = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!q) { afficherProduits(filtreActuel); return; }
    
    const resultats = produits.filter(p => 
        p.nom.toLowerCase().includes(q) || p.marque.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    
    const container = document.getElementById('produitsContainer');
    if (resultats.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Aucun produit trouvé pour "' + q + '"</p>';
    } else {
        const save = produits;
        produits = resultats;
        afficherProduits('tous');
        produits = save;
    }
}

// ========== FILTRE CATÉGORIES ==========
function filtrerCategorie(cat) {
    filtreActuel = cat;
    document.querySelectorAll('.nav-menu li a').forEach(a => a.classList.remove('active-cat'));
    const link = document.querySelector(`[onclick="filtrerCategorie('${cat}')"]`);
    if (link) link.classList.add('active-cat');
    afficherProduits(cat);
}

// ========== MENU MOBILE ==========
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// ========== COORDONNÉES ==========
function mettreAJourCoordonnees() {
    document.querySelectorAll('#tel, #footerTel').forEach(el => { if(el) el.textContent = coordonnees.tel; });
    document.querySelectorAll('#email, #footerEmail').forEach(el => { if(el) el.textContent = coordonnees.email; });
    const adresseEl = document.getElementById('footerAdresse');
    if(adresseEl) adresseEl.textContent = coordonnees.adresse;
    const horairesEl = document.getElementById('footerHoraires');
    if(horairesEl) horairesEl.innerHTML = (coordonnees.horaires || '').replace(/\n/g, '<br>');
}

// ========== ADMIN ==========
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    const arrow = document.getElementById('adminArrow');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        panel.style.display = 'none';
        arrow.textContent = '▼';
    }
}

function adminLogin() {
    const password = document.getElementById('passwordInput').value;
    if (password === 'Nour1969') {
        adminConnected = true;
        sessionStorage.setItem('electro_admin', 'true');
        showAdminDashboard();
    } else {
        document.getElementById('adminError').style.display = 'block';
        document.getElementById('adminError').textContent = '❌ Mot de passe incorrect !';
    }
}

function adminLogout() {
    adminConnected = false;
    sessionStorage.removeItem('electro_admin');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('passwordInput').value = '';
}

function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminError').style.display = 'none';
    chargerAdminProduits();
    chargerAdminCoords();
    updateAdminStats();
}

function updateAdminStats() {
    document.getElementById('statProduits').textContent = produits.length;
    document.getElementById('statMarques').textContent = [...new Set(produits.map(p => p.marque))].length;
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    
    const tabMap = { 'liste': 0, 'ajouter': 1, 'coords': 2 };
    document.querySelectorAll('.admin-tab')[tabMap[tab]].classList.add('active');
    document.getElementById('adminTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    if (tab === 'liste') chargerAdminProduits();
    if (tab === 'coords') chargerAdminCoords();
}

function chargerAdminProduits() {
    const tbody = document.getElementById('adminProduitsTable');
    tbody.innerHTML = produits.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.nom}</td>
            <td>${p.marque}</td>
            <td>${p.categorie}</td>
            <td>${p.prix.toLocaleString()} MAD</td>
            <td>${p.prixPromo ? p.prixPromo.toLocaleString() + ' MAD' : '-'}</td>
            <td>
                <button class="btn-edit" onclick="adminEditerProduit(${p.id})">✏️</button>
                <button class="btn-del" onclick="adminSupprimerProduit(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function adminEditerProduit(id) {
    const p = produits.find(pr => pr.id === id);
    if (!p) return;
    
    document.getElementById('adminEditId').value = p.id;
    document.getElementById('adminFormNom').value = p.nom;
    document.getElementById('adminFormMarque').value = p.marque;
    document.getElementById('adminFormCategorie').value = p.categorie;
    document.getElementById('adminFormPrix').value = p.prix;
    document.getElementById('adminFormPromo').value = p.prixPromo || '';
    document.getElementById('adminFormDescription').value = p.description;
    document.getElementById('adminFormEmoji').value = p.emoji || '';
    document.getElementById('adminFormTitle').textContent = '✏️ Modifier le produit #' + p.id;
    
    switchAdminTab('ajouter');
    document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
}

function adminSupprimerProduit(id) {
    if (confirm('Supprimer définitivement ce produit ?')) {
        produits = produits.filter(p => p.id !== id);
        // Supprimer aussi du panier
        panier = panier.filter(item => item.id !== id);
        saveData();
        chargerAdminProduits();
        afficherProduits(filtreActuel);
        afficherMarques();
        updateAdminStats();
        updateCartUI();
    }
}

function adminSauvegarderProduit() {
    const nom = document.getElementById('adminFormNom').value.trim();
    if (!nom) return alert('Le nom du produit est obligatoire');
    
    const editId = document.getElementById('adminEditId').value;
    const produitData = {
        nom: nom,
        marque: document.getElementById('adminFormMarque').value.trim(),
        categorie: document.getElementById('adminFormCategorie').value,
        prix: parseFloat(document.getElementById('adminFormPrix').value) || 0,
        prixPromo: document.getElementById('adminFormPromo').value ? parseFloat(document.getElementById('adminFormPromo').value) : null,
        description: document.getElementById('adminFormDescription').value.trim(),
        emoji: document.getElementById('adminFormEmoji').value.trim() || '📦'
    };
    
    if (editId) {
        const index = produits.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            produitData.id = parseInt(editId);
            produits[index] = produitData;
        }
    } else {
        produitData.id = produits.length > 0 ? Math.max(...produits.map(p => p.id)) + 1 : 1;
        produits.push(produitData);
    }
    
    saveData();
    adminResetForm();
    chargerAdminProduits();
    afficherProduits(filtreActuel);
    afficherMarques();
    updateAdminStats();
    switchAdminTab('liste');
}

function adminResetForm() {
    document.getElementById('adminEditId').value = '';
    document.getElementById('adminFormNom').value = '';
    document.getElementById('adminFormMarque').value = '';
    document.getElementById('adminFormPrix').value = '';
    document.getElementById('adminFormPromo').value = '';
    document.getElementById('adminFormDescription').value = '';
    document.getElementById('adminFormEmoji').value = '';
    document.getElementById('adminFormTitle').textContent = '➕ Ajouter un nouveau produit';
}

function chargerAdminCoords() {
    document.getElementById('adminCoordTel').value = coordonnees.tel || '';
    document.getElementById('adminCoordEmail').value = coordonnees.email || '';
    document.getElementById('adminCoordAdresse').value = coordonnees.adresse || '';
    document.getElementById('adminCoordHoraires').value = coordonnees.horaires || '';
    document.getElementById('adminCoordWhatsApp').value = coordonnees.whatsapp || '';
}

function adminSauvegarderCoordonnees() {
    coordonnees = {
        tel: document.getElementById('adminCoordTel').value.trim(),
        email: document.getElementById('adminCoordEmail').value.trim(),
        adresse: document.getElementById('adminCoordAdresse').value.trim(),
        horaires: document.getElementById('adminCoordHoraires').value.trim(),
        whatsapp: document.getElementById('adminCoordWhatsApp').value.trim()
    };
    saveData();
    mettreAJourCoordonnees();
    updateWhatsAppLink();
    alert('✅ Coordonnées enregistrées avec succès !');
}

// Fermer les modales en cliquant en dehors
window.onclick = function(e) {
    if (e.target === document.getElementById('produitModal')) fermerModal();
    if (e.target === document.getElementById('panierModal')) fermerPanier();
}