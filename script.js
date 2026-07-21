// ========== DONNEES ==========
var produits = JSON.parse(localStorage.getItem('ep_produits')) || [
    {id:1,nom:"Réfrigérateur Samsung RT38",marque:"Samsung",categorie:"Refrigerateurs",prix:5999,prixPromo:4999,description:"Réfrigérateur Samsung 450L Digital Inverter",image:"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",images:[]},
    {id:2,nom:"Lave-linge LG 8kg",marque:"LG",categorie:"Lave-linge",prix:4599,prixPromo:null,description:"Lave-linge frontal LG Inverter",image:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400",images:[]},
    {id:3,nom:"Lave-vaisselle Bosch",marque:"Bosch",categorie:"Lave-vaisselle",prix:3999,prixPromo:3499,description:"Lave-vaisselle Bosch 13 couverts",image:"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",images:[]},
    {id:4,nom:"Cuisinière Whirlpool",marque:"Whirlpool",categorie:"Cuisinieres",prix:2999,prixPromo:null,description:"Cuisinière 4 feux Whirlpool",image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",images:[]},
    {id:5,nom:"Four Electrolux",marque:"Electrolux",categorie:"Fours",prix:2499,prixPromo:1999,description:"Four encastrable Electrolux 60cm",image:"https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400",images:[]},
    {id:6,nom:"Micro-ondes Samsung",marque:"Samsung",categorie:"Micro-ondes",prix:899,prixPromo:null,description:"Micro-ondes Samsung 28L Grill",image:"https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400",images:[]},
    {id:7,nom:"Climatiseur LG 12000BTU",marque:"LG",categorie:"Climatiseurs",prix:4999,prixPromo:4499,description:"Climatiseur split LG Inverter",image:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",images:[]},
    {id:8,nom:"TV Samsung 55\" 4K",marque:"Samsung",categorie:"Televiseurs",prix:6999,prixPromo:5999,description:"TV Samsung 55\" 4K UHD Smart",image:"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",images:[]},
    {id:9,nom:"Aspirateur Bosch",marque:"Bosch",categorie:"Aspirateurs",prix:1499,prixPromo:null,description:"Aspirateur sans sac Bosch",image:"https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",images:[]},
    {id:10,nom:"Chauffe-eau Ariston 100L",marque:"Ariston",categorie:"Chauffe-eau",prix:1999,prixPromo:1799,description:"Chauffe-eau électrique Ariston",image:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",images:[]}
];

var packs = JSON.parse(localStorage.getItem('ep_packs')) || [
    {id:1,nom:"Pack Cuisine Essentielle",prix:8999,image:"",produits:[1,4,5],description:"Réfrigérateur + Cuisinière + Four",economie:1498},
    {id:2,nom:"Pack Buanderie",prix:5499,image:"",produits:[2,3],description:"Lave-linge + Lave-vaisselle",economie:499}
];

var coords = JSON.parse(localStorage.getItem('ep_coords')) || {
    tel:"+212 522-123456",email:"contact@electrofennassa.ma",adresse:"Casablanca, Maroc",horaires:"Lun-Sam: 9h-19h",whatsapp:"+212612345678"
};

var panier = JSON.parse(localStorage.getItem('ep_panier')) || [];
var adminOk = sessionStorage.getItem('ep_admin') === 'yes';
var filtre = 'tous';

// ========== SAVE ==========
function save(){
    localStorage.setItem('ep_produits',JSON.stringify(produits));
    localStorage.setItem('ep_packs',JSON.stringify(packs));
    localStorage.setItem('ep_coords',JSON.stringify(coords));
    localStorage.setItem('ep_panier',JSON.stringify(panier));
    sauvegarderTousLesProduits();
}

// ========== SAUVEGARDER TOUS LES PRODUITS SUR FIREBASE ==========
async function sauvegarderTousLesProduits() {
  try {
    const anciens = await db.collection("produits").get();
    anciens.forEach(async (doc) => {
      await db.collection("produits").doc(doc.id).delete();
    });
    
    for (let p of produits) {
      await db.collection("produits").add({
        id: p.id,
        nom: p.nom,
        marque: p.marque,
        categorie: p.categorie,
        prix: p.prix,
        prixPromo: p.prixPromo,
        description: p.description,
        image: p.image
      });
    }
    console.log("✅ Tous les produits sauvegardés sur Firebase !");
  } catch (error) {
    console.error("❌ Erreur sauvegarde Firebase :", error);
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded',function(){
    afficherTout();
    updateCoords();
    updateCart();
    updateWhatsApp();
    if(adminOk) showDashboard();
    window.addEventListener('scroll',function(){
        document.getElementById('backToTop').style.display = window.scrollY > 400 ? 'block' : 'none';
    });
});

// ========== AFFICHAGE ==========
function createCard(p){
    var promo = p.prixPromo ? Math.round((1-p.prixPromo/p.prix)*100) : 0;
    return '<div class="produit-card" onclick="openProduit('+p.id+')">'+
        (promo>0?'<span class="badge-promo">-'+promo+'%</span>':'')+
        '<div class="produit-image">'+(p.image?'<img src="'+p.image+'" onerror="this.parentElement.innerHTML=\'<span class=no-image>📦</span>\'">':'<span class="no-image">📦</span>')+'</div>'+
        '<div class="produit-info"><span class="produit-marque">'+p.marque+'</span><h3 class="produit-nom">'+p.nom+'</h3>'+
        '<div class="produit-prix">'+(p.prixPromo?'<span class="ancien">'+p.prix.toLocaleString()+' MAD</span> ':'')+(p.prixPromo||p.prix).toLocaleString()+' MAD</div>'+
        '<button class="btn-ajouter" onclick="event.stopPropagation();addPanier('+p.id+')">🛒 Ajouter</button></div></div>';
}

function afficherTout(){
    var promos = produits.filter(function(p){return p.prixPromo;});
    document.getElementById('promosContainer').innerHTML = promos.length ? promos.map(createCard).join('') : '<p style="text-align:center;color:#999;">Aucune promotion</p>';
    
    var pc = document.getElementById('packsContainer');
    pc.innerHTML = packs.map(function(pk){
        var noms = pk.produits.map(function(pid){var p=produits.find(function(x){return x.id===pid;});return p?p.nom:'';}).join(' + ');
        var total = pk.produits.reduce(function(s,pid){var p=produits.find(function(x){return x.id===pid;});return s+(p?(p.prixPromo||p.prix):0);},0);
        return '<div class="pack-card" onclick="openPack('+pk.id+')">'+
            (pk.economie?'<span class="badge-promo" style="background:#27ae60;">💰 -'+pk.economie.toLocaleString()+' MAD</span>':'')+
            '<div class="pack-image">'+(pk.image?'<img src="'+pk.image+'">':'<span style="font-size:60px;">🎁</span>')+'</div>'+
            '<div class="pack-info"><h3>'+pk.nom+'</h3><p class="pack-produits">'+noms+'</p>'+
            '<div class="pack-prix"><span class="ancien">'+total.toLocaleString()+' MAD</span> <span class="prix-promo">'+pk.prix.toLocaleString()+' MAD</span></div>'+
            '<button class="btn-ajouter" onclick="event.stopPropagation();addPackPanier('+pk.id+')">🎁 Ajouter le pack</button></div></div>';
    }).join('');
    
    var liste = filtre === 'tous' ? produits : produits.filter(function(p){return p.categorie === filtre;});
    document.getElementById('produitsContainer').innerHTML = liste.length ? liste.map(createCard).join('') : '<p style="text-align:center;color:#999;">Aucun produit</p>';
}

// ========== MODAL PRODUIT ==========
function openProduit(id){
    var p = produits.find(function(x){return x.id===id;}); if(!p) return;
    var imgs = []; if(p.image) imgs.push(p.image); if(p.images) imgs = imgs.concat(p.images);
    
    var galerie = imgs.length ? '<div class="galerie"><div class="galerie-main"><img src="'+imgs[0]+'" id="galMain"></div>'+
        (imgs.length>1 ? '<div class="galerie-thumbs">'+imgs.map(function(img,i){return '<img src="'+img+'" class="'+(i===0?'active':'')+'" onclick="document.getElementById(\'galMain\').src=\''+img+'\';var t=this.parentElement.querySelectorAll(\'img\');for(var j=0;j<t.length;j++)t[j].classList.remove(\'active\');this.classList.add(\'active\');">';}).join('')+'</div>' : '')+'</div>' : '<div style="text-align:center;font-size:80px;">📦</div>';
    
    document.getElementById('modalBody').innerHTML = galerie+
        '<h2>'+p.nom+'</h2><span class="marque-badge">'+p.marque+'</span>'+
        '<div class="prix-modal">'+(p.prixPromo?'<span style="text-decoration:line-through;color:#999;font-size:16px;">'+p.prix.toLocaleString()+' MAD</span> ':'')+'<span style="color:#e74c3c;">'+(p.prixPromo||p.prix).toLocaleString()+' MAD</span></div>'+
        '<p class="description">'+p.description+'</p>'+
        '<button class="btn-ajouter" style="padding:10px;font-size:15px;" onclick="addPanier('+p.id+');closeModal();">🛒 Ajouter au panier</button>';
    document.getElementById('modal').style.display = 'block';
}

function openPack(id){
    var pk = packs.find(function(x){return x.id===id;}); if(!pk) return;
    var prods = pk.produits.map(function(pid){return produits.find(function(x){return x.id===pid;});}).filter(function(x){return x;});
    var total = prods.reduce(function(s,p){return s+(p.prixPromo||p.prix);},0);
    
    document.getElementById('modalBody').innerHTML = 
        '<div style="text-align:center;font-size:80px;padding:20px;">'+(pk.image?'<img src="'+pk.image+'" style="max-width:100%;max-height:200px;">':'🎁')+'</div>'+
        '<h2>'+pk.nom+'</h2><p style="font-size:13px;color:#666;">'+pk.description+'</p>'+
        '<p style="margin:10px 0;"><span style="text-decoration:line-through;color:#999;">'+total.toLocaleString()+' MAD</span> <span style="font-size:24px;font-weight:bold;color:#e74c3c;">'+pk.prix.toLocaleString()+' MAD</span></p>'+
        '<h4>📦 Contenu :</h4>'+prods.map(function(p){return '<div style="padding:5px;background:#f8f8f8;margin:3px 0;border-radius:5px;">📦 '+p.nom+' - '+(p.prixPromo||p.prix).toLocaleString()+' MAD</div>';}).join('')+
        '<button class="btn-ajouter" style="padding:10px;font-size:15px;margin-top:10px;width:100%;" onclick="addPackPanier('+pk.id+');closeModal();">🎁 Ajouter le pack</button>';
    document.getElementById('modal').style.display = 'block';
}

function closeModal(){document.getElementById('modal').style.display = 'none';}

// ========== PANIER ==========
function addPanier(id){
    var p = produits.find(function(x){return x.id===id;}); if(!p) return;
    var e = panier.find(function(x){return x.id===id&&x.type==='p';});
    if(e){e.q++;}else{panier.push({id:id,type:'p',nom:p.nom,prix:p.prixPromo||p.prix,image:p.image,q:1});}
    save();updateCart();
}

function addPackPanier(id){
    var pk = packs.find(function(x){return x.id===id;}); if(!pk) return;
    var e = panier.find(function(x){return x.id===id&&x.type==='k';});
    if(e){e.q++;}else{panier.push({id:id,type:'k',nom:pk.nom,prix:pk.prix,image:pk.image,q:1});}
    save();updateCart();
}

function removePanier(id,type){
    panier = panier.filter(function(x){return !(x.id===id&&x.type===type);});
    save();updateCart();afficherPanier();
}

function updateCart(){
    var c = 0; panier.forEach(function(x){c+=x.q;});
    document.getElementById('cartCount').textContent = c;
    document.getElementById('floatingCartCount').textContent = c;
}

function afficherPanier(){
    var el = document.getElementById('panierContent');
    var t = document.getElementById('panierTotal');
    var b = document.getElementById('btnCommander');
    if(panier.length===0){
        el.innerHTML = '<p style="text-align:center;padding:30px;">Panier vide</p>';
        t.style.display='none'; b.style.display='none';
    }else{
        var total=0, html='';
        panier.forEach(function(x){
            var st = x.prix*x.q; total+=st;
            html+='<div class="panier-item"><span>'+(x.type==='k'?'🎁':'📦')+' '+x.nom+' x'+x.q+'</span><span>'+st.toLocaleString()+' MAD</span><button onclick="removePanier('+x.id+',\''+x.type+'\')">🗑️</button></div>';
        });
        el.innerHTML = html;
        t.style.display='block'; t.innerHTML='Total : <strong>'+total.toLocaleString()+' MAD</strong>';
        b.style.display='block';
    }
    document.getElementById('panierModal').style.display = 'block';
}

function closePanier(){document.getElementById('panierModal').style.display = 'none';}

function commander(){
    if(!panier.length) return;
    var msg='🛒 Commande ELECTRO_FENNASSA%0A%0A',total=0;
    panier.forEach(function(x){var st=x.prix*x.q;total+=st;msg+='- '+x.nom+' x'+x.q+' : '+st.toLocaleString()+' MAD%0A';});
    msg+='%0ATotal : '+total.toLocaleString()+' MAD';
    window.open('https://wa.me/'+coords.whatsapp.replace(/[^0-9]/g,'')+'?text='+msg,'_blank');
}

// ========== RECHERCHE ==========
function rechercher(){
    var q = document.getElementById('searchInput').value.toLowerCase().trim();
    if(!q){afficherTout();return;}
    var r = produits.filter(function(p){return p.nom.toLowerCase().indexOf(q)!==-1||p.marque.toLowerCase().indexOf(q)!==-1;});
    document.getElementById('produitsContainer').innerHTML = r.length ? r.map(createCard).join('') : '<p style="text-align:center;padding:30px;">Aucun résultat</p>';
}

function filtrer(cat){filtre=cat;afficherTout();}
function toggleMenu(){document.getElementById('navMenu').classList.toggle('active');}

// ========== COORDS ==========
function updateCoords(){
    document.getElementById('tel').textContent=coords.tel;
    document.getElementById('email').textContent=coords.email;
    document.getElementById('footerTel').textContent=coords.tel;
    document.getElementById('footerEmail').textContent=coords.email;
    document.getElementById('footerHoraires').innerHTML=coords.horaires.replace(/\n/g,'<br>');
}

function updateWhatsApp(){
    document.getElementById('whatsappBtn').href='https://wa.me/'+coords.whatsapp.replace(/[^0-9]/g,'')+'?text=Bonjour ELECTRO_FENNASSA';
}

function previewImage(url){
    var p = document.getElementById('imagePreview');
    p.innerHTML = url ? '<img src="'+url+'" style="max-width:150px;max-height:150px;border-radius:8px;">' : '';
}

// ========== ADMIN ==========
function toggleAdmin(){
    var p = document.getElementById('adminPanel');
    var a = document.getElementById('adminArrow');
    p.style.display = p.style.display==='none'?'block':'none';
    a.textContent = p.style.display==='block'?'▲':'▼';
}

function adminLogin(){
    if(document.getElementById('passwordInput').value==='Nour1969'){
        adminOk=true;sessionStorage.setItem('ep_admin','yes');showDashboard();
    }else{document.getElementById('adminError').style.display='block';document.getElementById('adminError').textContent='Mot de passe incorrect';}
}

function adminLogout(){
    adminOk=false;sessionStorage.removeItem('ep_admin');
    document.getElementById('adminLogin').style.display='block';
    document.getElementById('adminDashboard').style.display='none';
}

function showDashboard(){
    document.getElementById('adminLogin').style.display='none';
    document.getElementById('adminDashboard').style.display='block';
    loadAdminTable();loadAdminPacks();loadAdminCoords();
}

function switchTab(t){
    document.querySelectorAll('.admin-tab').forEach(function(x){x.classList.remove('active');});
    document.querySelectorAll('.admin-tab-content').forEach(function(x){x.classList.remove('active');});
    var m={liste:0,ajouter:1,packs:2,coords:3};
    document.querySelectorAll('.admin-tab')[m[t]].classList.add('active');
    document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1)).classList.add('active');
    if(t==='liste')loadAdminTable();
    if(t==='packs')loadAdminPacks();
    if(t==='coords')loadAdminCoords();
}

function loadAdminTable(){
    document.getElementById('adminTable').innerHTML = produits.map(function(p){
        return '<tr><td>'+p.id+'</td><td>'+p.nom+'</td><td>'+p.prix+' MAD</td><td>'+(p.prixPromo||'-')+'</td><td><button class="btn-edit" onclick="editProduit('+p.id+')">✏️</button> <button class="btn-del" onclick="delProduit('+p.id+')">🗑️</button></td></tr>';
    }).join('');
}

function editProduit(id){
    var p = produits.find(function(x){return x.id===id;}); if(!p) return;
    document.getElementById('editId').value = p.id;
    document.getElementById('formNom').value = p.nom;
    document.getElementById('formMarque').value = p.marque;
    document.getElementById('formCat').value = p.categorie;
    document.getElementById('formPrix').value = p.prix;
    document.getElementById('formPromo').value = p.prixPromo||'';
    document.getElementById('formDesc').value = p.description;
    document.getElementById('formImage').value = p.image||'';
    previewImage(p.image);
    switchTab('ajouter');
}

function delProduit(id){
    if(confirm('Supprimer ?')){
        produits = produits.filter(function(p){return p.id!==id;});
        panier = panier.filter(function(x){return !(x.id===id&&x.type==='p');});
        save();loadAdminTable();afficherTout();updateCart();
    }
}

function saveProduit(){
    var nom = document.getElementById('formNom').value.trim(); if(!nom){alert('Nom obligatoire');return;}
    var eid = document.getElementById('editId').value;
    var d = {
        nom:nom,marque:document.getElementById('formMarque').value.trim(),
        categorie:document.getElementById('formCat').value,
        prix:parseFloat(document.getElementById('formPrix').value)||0,
        prixPromo:document.getElementById('formPromo').value?parseFloat(document.getElementById('formPromo').value):null,
        description:document.getElementById('formDesc').value.trim(),
        image:document.getElementById('formImage').value.trim(),
        images:[]
    };
    if(eid){
        var i = produits.findIndex(function(p){return p.id===parseInt(eid);});
        if(i!==-1){d.id=parseInt(eid);produits[i]=d;}
    }else{
        d.id = produits.length?Math.max.apply(null,produits.map(function(p){return p.id;}))+1:1;
        produits.push(d);
    }
    save();loadAdminTable();afficherTout();
    document.getElementById('editId').value='';document.getElementById('formNom').value='';document.getElementById('formMarque').value='';
    document.getElementById('formPrix').value='';document.getElementById('formPromo').value='';document.getElementById('formDesc').value='';document.getElementById('formImage').value='';
    document.getElementById('imagePreview').innerHTML='';
    switchTab('liste');alert('✅ Enregistré !');
}

function loadAdminPacks(){
    document.getElementById('adminPacksList').innerHTML = packs.map(function(pk){
        var noms = pk.produits.map(function(pid){var p=produits.find(function(x){return x.id===pid;});return p?p.nom:'';}).join(', ');
        return '<div style="background:rgba(255,255,255,0.05);padding:8px;margin:5px 0;border-radius:5px;display:flex;justify-content:space-between;">🎁 '+pk.nom+' - '+pk.prix.toLocaleString()+' MAD ('+noms+') <button class="btn-del" onclick="delPack('+pk.id+')">🗑️</button></div>';
    }).join('');
}

function savePack(){
    var nom = document.getElementById('packNom').value.trim(); if(!nom){alert('Nom obligatoire');return;}
    var pids = (document.getElementById('packProduits').value||'').split(',').map(function(x){return parseInt(x.trim());}).filter(function(x){return x;});
    var total = pids.reduce(function(s,pid){var p=produits.find(function(x){return x.id===pid;});return s+(p?(p.prixPromo||p.prix):0);},0);
    var prix = parseFloat(document.getElementById('packPrix').value)||0;
    packs.push({
        id:packs.length?Math.max.apply(null,packs.map(function(x){return x.id;}))+1:1,
        nom:nom,prix:prix,image:document.getElementById('packImage').value.trim(),
        produits:pids,description:document.getElementById('packDesc').value.trim(),
        economie:total-prix>0?total-prix:0
    });
    save();loadAdminPacks();afficherTout();
    document.getElementById('packNom').value='';document.getElementById('packPrix').value='';document.getElementById('packProduits').value='';
    document.getElementById('packImage').value='';document.getElementById('packDesc').value='';
    alert('✅ Pack ajouté !');
}

function delPack(id){
    if(confirm('Supprimer ?')){
        packs = packs.filter(function(x){return x.id!==id;});
        panier = panier.filter(function(x){return !(x.id===id&&x.type==='k');});
        save();loadAdminPacks();afficherTout();updateCart();
    }
}

function loadAdminCoords(){
    document.getElementById('coordTel').value=coords.tel;
    document.getElementById('coordEmail').value=coords.email;
    document.getElementById('coordAdresse').value=coords.adresse;
    document.getElementById('coordHoraires').value=coords.horaires;
    document.getElementById('coordWhatsApp').value=coords.whatsapp;
}

function saveCoords(){
    coords={
        tel:document.getElementById('coordTel').value.trim(),
        email:document.getElementById('coordEmail').value.trim(),
        adresse:document.getElementById('coordAdresse').value.trim(),
        horaires:document.getElementById('coordHoraires').value.trim(),
        whatsapp:document.getElementById('coordWhatsApp').value.trim()
    };
    save();updateCoords();updateWhatsApp();alert('✅ Enregistré !');
}

// ========== SYNCHRONISATION TEMPS RÉEL FIREBASE ==========
db.collection("produits").onSnapshot(function(snapshot) {
    produits = [];
    snapshot.forEach(function(doc) {
        produits.push(doc.data());
    });
    localStorage.setItem('ep_produits', JSON.stringify(produits));
    afficherTout();
    console.log("🔄 Synchronisation temps réel !");
});

// ========== CHARGER AU DÉMARRAGE ==========
async function chargerDepuisFirebase() {
  try {
    const snapshot = await db.collection("produits").get();
    if (!snapshot.empty) {
      produits = [];
      snapshot.forEach((doc) => {
        produits.push(doc.data());
      });
      localStorage.setItem('ep_produits', JSON.stringify(produits));
      console.log("📦 Produits chargés depuis Firebase !");
      afficherTout();
    } else {
      sauvegarderTousLesProduits();
    }
  } catch (error) {
    console.error("❌ Erreur chargement :", error);
  }
}

chargerDepuisFirebase();