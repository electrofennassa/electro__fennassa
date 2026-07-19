// ========== DONNÉES INITIALES ==========
var produits = JSON.parse(localStorage.getItem('electro_produits')) || [
    {id:1,nom:"Réfrigérateur Samsung RT38 450L",marque:"Samsung",categorie:"Refrigerateurs",prix:5999,prixPromo:4999,description:"Réfrigérateur combiné Samsung Digital Inverter 450L. Technologie économie d'énergie. Éclairage LED. Garantie 2 ans.",image:"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400"},
    {id:2,nom:"Lave-linge LG F4J6 8kg",marque:"LG",categorie:"Lave-linge",prix:4599,prixPromo:null,description:"Lave-linge frontal LG 8kg. Moteur Inverter Direct Drive. 14 programmes.",image:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400"},
    {id:3,nom:"Lave-vaisselle Bosch SMS46",marque:"Bosch",categorie:"Lave-vaisselle",prix:3999,prixPromo:3499,description:"Lave-vaisselle Bosch 13 couverts. Classe A++.",image:"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400"},
    {id:4,nom:"Cuisinière Whirlpool AKP 745",marque:"Whirlpool",categorie:"Cuisinieres",prix:2999,prixPromo:null,description:"Cuisinière 4 feux gaz Whirlpool.",image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"},
    {id:5,nom:"Four Encastrable Electrolux",marque:"Electrolux",categorie:"Fours",prix:2499,prixPromo:1999,description:"Four électrique encastrable Electrolux 60cm.",image:"https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400"},
    {id:6,nom:"Micro-ondes Samsung 28L",marque:"Samsung",categorie:"Micro-ondes",prix:899,prixPromo:null,description:"Micro-ondes Samsung 28L avec Grill.",image:"https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400"},
    {id:7,nom:"Climatiseur LG Split 12000BTU",marque:"LG",categorie:"Climatiseurs",prix:4999,prixPromo:4499,description:"Climatiseur split LG Inverter.",image:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"},
    {id:8,nom:"Téléviseur Samsung 55\" 4K",marque:"Samsung",categorie:"Televiseurs",prix:6999,prixPromo:5999,description:"TV LED Samsung 55 pouces 4K UHD.",image:"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"},
    {id:9,nom:"Aspirateur Bosch Serie 4",marque:"Bosch",categorie:"Aspirateurs",prix:1499,prixPromo:null,description:"Aspirateur sans sac Bosch.",image:"https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400"},
    {id:10,nom:"Chauffe-eau Ariston 100L",marque:"Ariston",categorie:"Chauffe-eau",prix:1999,prixPromo:1799,description:"Chauffe-eau électrique Ariston 100L.",image:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400"}
];

var coordonnees = JSON.parse(localStorage.getItem('electro_coords')) || {
    tel:"+212 522-123456",email:"contact@electrofennassa.ma",adresse:"Bd Mohammed V, Casablanca",horaires:"Lun-Sam: 9h-19h\nDim: Fermé",whatsapp:"+212612345678"
};

var panier = JSON.parse(localStorage.getItem('electro_panier')) || [];
var adminConnected = sessionStorage.getItem('electro_admin') === 'true';
var filtreActuel = 'tous';

// ========== SAUVEGARDE ==========
function saveData(){
    localStorage.setItem('electro_produits',JSON.stringify(produits));
    localStorage.setItem('electro_coords',JSON.stringify(coordonnees));
    localStorage.setItem('electro_panier',JSON.stringify(panier));
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded',function(){
    afficherProduits();
    mettreAJourCoordonnees();
    afficherMarques();
    updateCartUI();
    updateWhatsAppLink();
    if(adminConnected) showAdminDashboard();
    
    window.addEventListener('scroll',function(){
        var btn = document.getElementById('backToTop');
        if(btn) btn.style.display = window.scrollY > 500 ? 'block' : 'none';
    });
    
    var searchInput = document.getElementById('searchInput');
    if(searchInput){
        searchInput.addEventListener('keypress',function(e){
            if(e.key === 'Enter') rechercher();
        });
    }
    
    var passInput = document.getElementById('passwordInput');
    if(passInput){
        passInput.addEventListener('keypress',function(e){
            if(e.key === 'Enter') adminLogin();
        });
    }
});

// ========== PREVIEW IMAGE ==========
function previewAdminImage(url){
    var preview = document.getElementById('adminImagePreview');
    if(!preview) return;
    if(url && url.trim()){
        preview.innerHTML = '<img src="'+url.trim()+'" alt="Preview" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<p style=color:#e74c3c;>Image introuvable</p>\';">';
    } else {
        preview.innerHTML = '<p style="color:#aaa;">Aucune image</p>';
    }
}

// ========== AFFICHAGE ==========
function afficherProduits(filtre){
    if(!filtre) filtre = 'tous';
    var container = document.getElementById('produitsContainer');
    if(!container) return;
    
    var liste = filtre === 'tous' ? produits : produits.filter(function(p){return p.categorie === filtre;});
    
    if(liste.length === 0){
        container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;color:#999;">Aucun produit trouvé</p>';
        return;
    }
    
    container.innerHTML = '';
    liste.forEach(function(p){
        var promo = p.prixPromo ? Math.round((1 - p.prixPromo/p.prix) * 100) : 0;
        var card = document.createElement('div');
        card.className = 'produit-card';
        card.onclick = function(){ouvrirProduit(p.id);};
        card.innerHTML = 
            (promo > 0 ? '<span class="badge-promo">-'+promo+'%</span>' : '') +
            '<div class="produit-image">' +
                (p.image ? '<img src="'+p.image+'" alt="'+p.nom+'" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span class=no-image>📦</span>\';">' : '<span class="no-image">📦</span>') +
            '</div>' +
            '<div class="produit-info">' +
                '<span class="produit-marque">'+p.marque+'</span>' +
                '<h3 class="produit-nom">'+p.nom+'</h3>' +
                '<div class="produit-prix">' +
                    (p.prixPromo ? '<span class="ancien">'+p.prix.toLocaleString()+' MAD</span> ' : '') +
                    (p.prixPromo || p.prix).toLocaleString()+' MAD' +
                '</div>' +
                '<button class="btn-ajouter">🛒 Ajouter au panier</button>' +
            '</div>';
        
        var btn = card.querySelector('.btn-ajouter');
        btn.onclick = function(e){
            e.stopPropagation();
            ajouterAuPanier(p.id);
        };
        
        container.appendChild(card);
    });
}

function afficherMarques(){
    var container = document.getElementById('marquesContainer');
    if(!container) return;
    var marques = [];
    produits.forEach(function(p){
        if(marques.indexOf(p.marque) === -1) marques.push(p.marque);
    });
    container.innerHTML = marques.map(function(m){return '<div class="marque-item">'+m+'</div>';}).join('');
}

// ========== MODAL PRODUIT ==========
function ouvrirProduit(id){
    var p = produits.find(function(pr){return pr.id === id;});
    if(!p) return;
    
    document.getElementById('modalBody').innerHTML = 
        '<div class="produit-image-modal">' +
            (p.image ? '<img src="'+p.image+'" alt="'+p.nom+'" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span style=font-size:80px;>📦</span>\';">' : '<span style="font-size:80px;">📦</span>') +
        '</div>' +
        '<h2>'+p.nom+'</h2>' +
        '<span class="marque-badge">'+p.marque+'</span>' +
        '<div class="prix-modal">' +
            (p.prixPromo ? '<span style="text-decoration:line-through;color:#999;font-size:18px;">'+p.prix.toLocaleString()+' MAD</span> ' : '') +
            (p.prixPromo || p.prix).toLocaleString()+' MAD' +
        '</div>' +
        '<p class="description">'+p.description+'</p>' +
        '<p style="color:#27ae60;font-weight:bold;">✅ En stock - Livraison partout au Maroc</p>' +
        '<button class="btn-ajouter" style="padding:12px;font-size:16px;margin-top:10px;">🛒 Ajouter au panier</button>';
    
    document.getElementById('modalBody').querySelector('.btn-ajouter').onclick = function(){
        ajouterAuPanier(p.id);
        fermerModal();
    };
    
    document.getElementById('produitModal').style.display = 'block';
}

function fermerModal(){
    document.getElementById('produitModal').style.display = 'none';
}

// ========== PANIER ==========
function ajouterAuPanier(id){
    var p = produits.find(function(pr){return pr.id === id;});
    if(!p) return;
    
    var existant = panier.find(function(item){return item.id === id;});
    if(existant){
        existant.quantite++;
    } else {
        panier.push({id:id,nom:p.nom,prix:p.prixPromo || p.prix,image:p.image,quantite:1});
    }
    saveData();
    updateCartUI();
}

function retirerDuPanier(id){
    panier = panier.filter(function(item){return item.id !== id;});
    saveData();
    updateCartUI();
    afficherPanier();
}

function updateCartUI(){
    var count = 0;
    panier.forEach(function(item){count += item.quantite;});
    var cartCount = document.getElementById('cartCount');
    var floatingCount = document.getElementById('floatingCartCount');
    if(cartCount) cartCount.textContent = count;
    if(floatingCount) floatingCount.textContent = count;
}

function afficherPanier(){
    var content = document.getElementById('panierContent');
    var totalEl = document.getElementById('panierTotal');
    var btnCommander = document.getElementById('btnCommander');
    
    if(panier.length === 0){
        content.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">🛒 Votre panier est vide</p>';
        totalEl.style.display = 'none';
        btnCommander.style.display = 'none';
    } else {
        var total = 0;
        var html = '';
        panier.forEach(function(item){
            var sousTotal = item.prix * item.quantite;
            total += sousTotal;
            html += '<div class="panier-item">' +
                '<span>'+(item.image ? '<img src="'+item.image+'" style="width:40px;height:40px;object-fit:contain;border-radius:5px;vertical-align:middle;margin-right:8px;">' : '📦')+' '+item.nom+' x'+item.quantite+'</span>' +
                '<span>'+sousTotal.toLocaleString()+' MAD</span>' +
                '<button onclick="retirerDuPanier('+item.id+')">🗑️</button>' +
            '</div>';
        });
        content.innerHTML = html;
        totalEl.style.display = 'block';
        totalEl.innerHTML = '<strong>Total : '+total.toLocaleString()+' MAD</strong>';
        btnCommander.style.display = 'block';
    }
    
    document.getElementById('panierModal').style.display = 'block';
}

function fermerPanier(){
    document.getElementById('panierModal').style.display = 'none';
}

// ========== WHATSAPP ==========
function commanderWhatsApp(){
    if(panier.length === 0) return;
    var message = '🛒 *Nouvelle commande ELECTRO_FENNASSA*%0A%0A';
    var total = 0;
    panier.forEach(function(item){
        var sousTotal = item.prix * item.quantite;
        total += sousTotal;
        message += '- '+item.nom+' x'+item.quantite+' : '+sousTotal.toLocaleString()+' MAD%0A';
    });
    message += '%0A💰 *Total : '+total.toLocaleString()+' MAD*%0A%0A📞 Merci de me contacter.';
    var num = (coordonnees.whatsapp || '+212612345678').replace(/[^0-9]/g,'');
    window.open('https://wa.me/'+num+'?text='+message,'_blank');
}

function ouvrirWhatsApp(){
    var num = (coordonnees.whatsapp || '+212612345678').replace(/[^0-9]/g,'');
    window.open('https://wa.me/'+num+'?text=Bonjour ELECTRO_FENNASSA','_blank');
}

function updateWhatsAppLink(){
    var num = (coordonnees.whatsapp || '+212612345678').replace(/[^0-9]/g,'');
    var btn = document.getElementById('whatsappBtn');
    if(btn) btn.href = 'https://wa.me/'+num+'?text=Bonjour ELECTRO_FENNASSA';
}

// ========== RECHERCHE ==========
function rechercher(){
    var q = document.getElementById('searchInput').value.toLowerCase().trim();
    if(!q){afficherProduits(filtreActuel);return;}
    
    var resultats = produits.filter(function(p){
        return p.nom.toLowerCase().indexOf(q) !== -1 || p.marque.toLowerCase().indexOf(q) !== -1 || p.description.toLowerCase().indexOf(q) !== -1;
    });
    
    var container = document.getElementById('produitsContainer');
    if(resultats.length === 0){
        container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Aucun résultat pour "'+q+'"</p>';
    } else {
        var save = produits;
        produits = resultats;
        afficherProduits('tous');
        produits = save;
    }
}

// ========== FILTRE ==========
function filtrerCategorie(cat){
    filtreActuel = cat;
    var links = document.querySelectorAll('.nav-menu li a');
    links.forEach(function(a){a.classList.remove('active-cat');});
    afficherProduits(cat);
}

// ========== MENU MOBILE ==========
function toggleMenu(){
    document.getElementById('navMenu').classList.toggle('active');
}

// ========== COORDONNEES ==========
function mettreAJourCoordonnees(){
    var tels = document.querySelectorAll('#tel, #footerTel');
    tels.forEach(function(el){if(el) el.textContent = coordonnees.tel;});
    var emails = document.querySelectorAll('#email, #footerEmail');
    emails.forEach(function(el){if(el) el.textContent = coordonnees.email;});
    var adr = document.getElementById('footerAdresse');
    if(adr) adr.textContent = coordonnees.adresse;
    var hor = document.getElementById('footerHoraires');
    if(hor) hor.innerHTML = (coordonnees.horaires || '').replace(/\n/g,'<br>');
}

// ========== ADMIN ==========
function toggleAdmin(){
    var panel = document.getElementById('adminPanel');
    var arrow = document.getElementById('adminArrow');
    if(panel.style.display === 'none' || panel.style.display === ''){
        panel.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        panel.style.display = 'none';
        arrow.textContent = '▼';
    }
}

function adminLogin(){
    var pass = document.getElementById('passwordInput').value;
    if(pass === 'Nour1969'){
        adminConnected = true;
        sessionStorage.setItem('electro_admin','true');
        showAdminDashboard();
    } else {
        document.getElementById('adminError').style.display = 'block';
        document.getElementById('adminError').textContent = '❌ Mot de passe incorrect !';
    }
}

function adminLogout(){
    adminConnected = false;
    sessionStorage.removeItem('electro_admin');
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('passwordInput').value = '';
}

function showAdminDashboard(){
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminError').style.display = 'none';
    chargerAdminProduits();
    chargerAdminCoords();
    updateAdminStats();
}

function updateAdminStats(){
    document.getElementById('statProduits').textContent = produits.length;
    var marques = [];
    produits.forEach(function(p){if(marques.indexOf(p.marque)===-1) marques.push(p.marque);});
    document.getElementById('statMarques').textContent = marques.length;
}

function switchAdminTab(tab){
    document.querySelectorAll('.admin-tab').forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.admin-tab-content').forEach(function(c){c.classList.remove('active');});
    document.querySelectorAll('.admin-tab')[[{'liste':0,'ajouter':1,'coords':2}[tab]]].classList.add('active');
    document.getElementById('adminTab'+tab.charAt(0).toUpperCase()+tab.slice(1)).classList.add('active');
    if(tab==='liste') chargerAdminProduits();
    if(tab==='coords') chargerAdminCoords();
}

function chargerAdminProduits(){
    var tbody = document.getElementById('adminProduitsTable');
    var html = '';
    produits.forEach(function(p){
        html += '<tr>' +
            '<td>'+(p.image ? '<img src="'+p.image+'" alt="'+p.nom+'" onerror="this.style.display=\'none\';this.parentElement.textContent=\'📦\';">' : '📦')+'</td>' +
            '<td>'+p.id+'</td>' +
            '<td>'+p.nom+'</td>' +
            '<td>'+p.marque+'</td>' +
            '<td>'+p.categorie+'</td>' +
            '<td>'+p.prix.toLocaleString()+' MAD</td>' +
            '<td>'+(p.prixPromo ? p.prixPromo.toLocaleString()+' MAD' : '-')+'</td>' +
            '<td><button class="btn-edit" onclick="adminEditerProduit('+p.id+')">✏️</button> <button class="btn-del" onclick="adminSupprimerProduit('+p.id+')">🗑️</button></td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
}

function adminEditerProduit(id){
    var p = produits.find(function(pr){return pr.id === id;});
    if(!p) return;
    document.getElementById('adminEditId').value = p.id;
    document.getElementById('adminFormNom').value = p.nom;
    document.getElementById('adminFormMarque').value = p.marque;
    document.getElementById('adminFormCategorie').value = p.categorie;
    document.getElementById('adminFormPrix').value = p.prix;
    document.getElementById('adminFormPromo').value = p.prixPromo || '';
    document.getElementById('adminFormDescription').value = p.description;
    document.getElementById('adminFormImage').value = p.image || '';
    document.getElementById('adminFormTitle').textContent = '✏️ Modifier le produit #'+p.id;
    previewAdminImage(p.image);
    switchAdminTab('ajouter');
    document.getElementById('adminPanel').scrollIntoView({behavior:'smooth'});
}

function adminSupprimerProduit(id){
    if(confirm('Supprimer ce produit ?')){
        produits = produits.filter(function(p){return p.id !== id;});
        panier = panier.filter(function(item){return item.id !== id;});
        saveData();
        chargerAdminProduits();
        afficherProduits(filtreActuel);
        afficherMarques();
        updateAdminStats();
        updateCartUI();
    }
}

function adminSauvegarderProduit(){
    var nom = document.getElementById('adminFormNom').value.trim();
    if(!nom){alert('Le nom est obligatoire');return;}
    
    var editId = document.getElementById('adminEditId').value;
    var data = {
        nom:nom,
        marque:document.getElementById('adminFormMarque').value.trim(),
        categorie:document.getElementById('adminFormCategorie').value,
        prix:parseFloat(document.getElementById('adminFormPrix').value)||0,
        prixPromo:document.getElementById('adminFormPromo').value ? parseFloat(document.getElementById('adminFormPromo').value) : null,
        description:document.getElementById('adminFormDescription').value.trim(),
        image:document.getElementById('adminFormImage').value.trim()
    };
    
    if(editId){
        var index = produits.findIndex(function(p){return p.id === parseInt(editId);});
        if(index !== -1){data.id = parseInt(editId);produits[index] = data;}
    } else {
        data.id = produits.length > 0 ? Math.max.apply(null,produits.map(function(p){return p.id;})) + 1 : 1;
        produits.push(data);
    }
    
    saveData();
    adminResetForm();
    chargerAdminProduits();
    afficherProduits(filtreActuel);
    afficherMarques();
    updateAdminStats();
    switchAdminTab('liste');
    alert('✅ Produit enregistré !');
}

function adminResetForm(){
    document.getElementById('adminEditId').value = '';
    document.getElementById('adminFormNom').value = '';
    document.getElementById('adminFormMarque').value = '';
    document.getElementById('adminFormPrix').value = '';
    document.getElementById('adminFormPromo').value = '';
    document.getElementById('adminFormDescription').value = '';
    document.getElementById('adminFormImage').value = '';
    document.getElementById('adminFormTitle').textContent = '➕ Ajouter un produit';
    document.getElementById('adminImagePreview').innerHTML = '';
}

function chargerAdminCoords(){
    document.getElementById('adminCoordTel').value = coordonnees.tel || '';
    document.getElementById('adminCoordEmail').value = coordonnees.email || '';
    document.getElementById('adminCoordAdresse').value = coordonnees.adresse || '';
    document.getElementById('adminCoordHoraires').value = coordonnees.horaires || '';
    document.getElementById('adminCoordWhatsApp').value = coordonnees.whatsapp || '';
}

function adminSauvegarderCoordonnees(){
    coordonnees = {
        tel:document.getElementById('adminCoordTel').value.trim(),
        email:document.getElementById('adminCoordEmail').value.trim(),
        adresse:document.getElementById('adminCoordAdresse').value.trim(),
        horaires:document.getElementById('adminCoordHoraires').value.trim(),
        whatsapp:document.getElementById('adminCoordWhatsApp').value.trim()
    };
    saveData();
    mettreAJourCoordonnees();
    updateWhatsAppLink();
    alert('✅ Coordonnées enregistrées !');
}

// Fermer modales
window.onclick = function(e){
    if(e.target === document.getElementById('produitModal')) fermerModal();
    if(e.target === document.getElementById('panierModal')) fermerPanier();
};